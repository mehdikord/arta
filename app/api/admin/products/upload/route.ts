import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { unlink } from "node:fs/promises";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromCookie } from "@/lib/admin/session";
import {
  PRODUCT_FILE_TYPES,
  detectProductFileKind,
  ensureProductFileStorage,
  getProductFileMaxSize,
  resolveProductFilePath,
  sanitizeProductFilename,
} from "@/lib/product-files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  const session = await getAdminSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "درخواست نامعتبر است" }, { status: 403 });
  }
  if (!request.body) {
    return NextResponse.json({ error: "فایل یافت نشد" }, { status: 400 });
  }

  const contentType = request.headers.get("content-type")?.split(";")[0].trim();
  const contentTypeLower = contentType?.toLowerCase().trim();
  const expectedExtension = contentTypeLower
    ? PRODUCT_FILE_TYPES[contentTypeLower]
    : undefined;
  const kind = contentTypeLower ? detectProductFileKind(contentTypeLower) : null;
  if (!contentTypeLower || !expectedExtension || !kind) {
    return NextResponse.json({ error: "نوع فایل مجاز نیست" }, { status: 415 });
  }

  const maxSize = getProductFileMaxSize();
  const contentLength = Number(request.headers.get("content-length"));
  if (
    !Number.isFinite(contentLength) ||
    contentLength <= 0 ||
    contentLength > maxSize
  ) {
    return NextResponse.json(
      { error: `حجم فایل باید کمتر از ${Math.floor(maxSize / 1024 / 1024)} مگابایت باشد` },
      { status: 413 },
    );
  }

  const encodedFilename = request.headers.get("x-file-name");
  let originalFilename = "package-file";
  try {
    originalFilename = encodedFilename
      ? decodeURIComponent(encodedFilename)
      : originalFilename;
  } catch {
    return NextResponse.json({ error: "نام فایل نامعتبر است" }, { status: 400 });
  }

  const safeFilename = sanitizeProductFilename(originalFilename);
  if (safeFilename.toLowerCase().endsWith(expectedExtension) === false) {
    return NextResponse.json(
      { error: "پسوند فایل با نوع آن مطابقت ندارد" },
      { status: 400 },
    );
  }

  await ensureProductFileStorage();
  const storageKey = `${randomUUID()}-${safeFilename}`;
  const destination = resolveProductFilePath(storageKey);
  let receivedBytes = 0;
  const sizeLimiter = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      receivedBytes += chunk.length;
      if (receivedBytes > maxSize) {
        callback(new Error("FILE_TOO_LARGE"));
        return;
      }
      callback(null, chunk);
    },
  });

  try {
    await pipeline(
      Readable.fromWeb(request.body as never),
      sizeLimiter,
      createWriteStream(destination, { flags: "wx", mode: 0o600 }),
    );
    if (receivedBytes !== contentLength) {
      throw new Error("INCOMPLETE_UPLOAD");
    }
    return NextResponse.json({
      storageKey,
      filename: safeFilename,
      size: receivedBytes,
      kind,
    });
  } catch (error) {
    await unlink(destination).catch(() => undefined);
    const message =
      error instanceof Error && error.message === "FILE_TOO_LARGE"
        ? "حجم فایل بیش از حد مجاز است"
        : "آپلود فایل کامل نشد؛ دوباره تلاش کنید";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
