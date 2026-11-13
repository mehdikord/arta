import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { unlink } from "node:fs/promises";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromCookie } from "@/lib/admin/session";
import { prisma } from "@/lib/prisma";
import { formatFileSize, getProductFileTypeInfo } from "@/lib/product-file-types";
import {
  deleteProductFile,
  ensureProductFileStorage,
  getProductFileMaxSize,
  isValidProductStorageKey,
  resolveProductFilePath,
  sanitizeProductFilename,
} from "@/lib/product-files";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  return !origin || origin === request.nextUrl.origin;
}

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

async function guard(request: NextRequest) {
  const session = await getAdminSessionFromCookie();
  if (!session) return jsonError("دسترسی غیرمجاز؛ دوباره وارد شوید", 401);
  if (!isSameOrigin(request)) return jsonError("درخواست نامعتبر است", 403);
  return null;
}

/**
 * Secure streaming upload for private package files.
 *
 * Body: raw file bytes. Headers: `X-File-Name` (URI-encoded original name).
 * The file type is decided from the (allowlisted) extension — never from the
 * browser-reported MIME — and the file is written outside `public/`.
 */
export async function POST(request: NextRequest) {
  const denied = await guard(request);
  if (denied) return denied;
  if (!request.body) return jsonError("فایل یافت نشد", 400);

  let originalFilename = "";
  try {
    originalFilename = decodeURIComponent(request.headers.get("x-file-name") ?? "");
  } catch {
    return jsonError("نام فایل نامعتبر است", 400);
  }
  if (!originalFilename) return jsonError("نام فایل ارسال نشده است", 400);

  const typeInfo = getProductFileTypeInfo(originalFilename);
  if (!typeInfo) {
    return jsonError("این نوع فایل مجاز نیست", 415);
  }

  const maxSize = await getProductFileMaxSize();
  const maxSizeLabel = formatFileSize(maxSize);
  const lengthHeader = request.headers.get("content-length");
  const contentLength = lengthHeader === null ? null : Number(lengthHeader);
  if (contentLength !== null) {
    if (!Number.isFinite(contentLength) || contentLength <= 0) {
      return jsonError("فایل خالی است", 400);
    }
    if (contentLength > maxSize) {
      return jsonError(`حجم فایل باید کمتر از ${maxSizeLabel} باشد`, 413);
    }
  }

  const safeFilename = sanitizeProductFilename(originalFilename);
  const storageKey = `${randomUUID()}-${safeFilename}`;
  if (!isValidProductStorageKey(storageKey)) {
    return jsonError("نام فایل نامعتبر است", 400);
  }

  await ensureProductFileStorage();
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
    if (receivedBytes === 0) throw new Error("EMPTY_FILE");
    if (contentLength !== null && receivedBytes !== contentLength) {
      throw new Error("INCOMPLETE_UPLOAD");
    }
    return NextResponse.json({
      storageKey,
      filename: originalFilename,
      size: receivedBytes,
      kind: typeInfo.kind,
    });
  } catch (error) {
    await unlink(destination).catch(() => undefined);
    const code = error instanceof Error ? error.message : "";
    if (code === "FILE_TOO_LARGE") {
      return jsonError(`حجم فایل باید کمتر از ${maxSizeLabel} باشد`, 413);
    }
    if (code === "EMPTY_FILE") return jsonError("فایل خالی است", 400);
    if (code !== "INCOMPLETE_UPLOAD") {
      console.error("Product file upload failed", error);
    }
    return jsonError("آپلود فایل کامل نشد؛ دوباره تلاش کنید", 400);
  }
}

/**
 * Remove an uploaded file that was never saved to a package
 * (replaced or removed in the form before saving). Files referenced by any
 * package are never deleted here.
 */
export async function DELETE(request: NextRequest) {
  const denied = await guard(request);
  if (denied) return denied;

  const storageKey = request.nextUrl.searchParams.get("key") ?? "";
  if (!isValidProductStorageKey(storageKey)) {
    return jsonError("کلید فایل نامعتبر است", 400);
  }

  const references = await prisma.productFile.count({ where: { storageKey } });
  if (references > 0) {
    return NextResponse.json({ deleted: false });
  }

  await deleteProductFile(storageKey);
  return NextResponse.json({ deleted: true });
}
