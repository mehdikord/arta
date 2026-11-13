import { randomUUID } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromCookie } from "@/lib/admin/session";
import {
  getMediaTypeInfo,
  matchesMediaSignature,
  mediaDisplayName,
  mediaExtension,
} from "@/lib/media-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STORAGE_ROOT = path.resolve(process.cwd(), "storage", "web");
const HEAD_BYTES = 4096;

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function sanitizeStem(name: string): string {
  return (
    name
      .normalize("NFKD")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^[._-]+|[._-]+$/g, "")
      .slice(0, 80) || "file"
  );
}

/**
 * Public media upload (images, video, audio, PDF).
 * Body: raw file bytes · Header `X-File-Name`: URI-encoded original name.
 */
export async function POST(request: NextRequest) {
  const session = await getAdminSessionFromCookie();
  if (!session) return jsonError("دسترسی غیرمجاز؛ دوباره وارد شوید", 401);

  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return jsonError("درخواست نامعتبر است", 403);
  }
  if (!request.body) return jsonError("فایل یافت نشد", 400);

  let originalName = "";
  try {
    originalName = decodeURIComponent(request.headers.get("x-file-name") ?? "");
  } catch {
    return jsonError("نام فایل نامعتبر است", 400);
  }
  const ext = mediaExtension(originalName);
  const info = getMediaTypeInfo(originalName);
  if (!info) return jsonError("این نوع فایل مجاز نیست", 415);

  const declared = Number(request.headers.get("content-length") ?? NaN);
  if (Number.isFinite(declared) && declared > info.maxBytes) {
    return jsonError(`حجم فایل بیش از حد مجاز (${Math.round(info.maxBytes / 1024 / 1024)} مگابایت) است`, 413);
  }

  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const dir = path.join(STORAGE_ROOT, year, month);
  await mkdir(dir, { recursive: true });

  const stem = sanitizeStem(originalName.slice(0, -(ext.length + 1)));
  const filename = `${randomUUID()}-${stem}.${ext}`;
  const destination = path.join(dir, filename);

  let received = 0;
  const head = new Uint8Array(HEAD_BYTES);
  let headLength = 0;
  const inspector = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      if (headLength < HEAD_BYTES) {
        const take = Math.min(HEAD_BYTES - headLength, chunk.length);
        head.set(chunk.subarray(0, take), headLength);
        headLength += take;
      }
      received += chunk.length;
      if (received > info.maxBytes) {
        callback(new Error("TOO_LARGE"));
        return;
      }
      callback(null, chunk);
    },
  });

  try {
    await pipeline(
      Readable.fromWeb(request.body as never),
      inspector,
      createWriteStream(destination, { flags: "wx", mode: 0o644 }),
    );
    if (received === 0) throw new Error("EMPTY");
    if (!matchesMediaSignature(ext, head.subarray(0, headLength))) throw new Error("BAD_SIGNATURE");
  } catch (error) {
    await unlink(destination).catch(() => undefined);
    const code = error instanceof Error ? error.message : "";
    if (code === "TOO_LARGE") {
      return jsonError(`حجم فایل بیش از حد مجاز (${Math.round(info.maxBytes / 1024 / 1024)} مگابایت) است`, 413);
    }
    if (code === "EMPTY") return jsonError("فایل خالی است", 400);
    if (code === "BAD_SIGNATURE") return jsonError("محتوای فایل با پسوند آن مطابقت ندارد", 415);
    console.error("Media upload failed", error);
    return jsonError("آپلود فایل کامل نشد؛ دوباره تلاش کنید", 400);
  }

  revalidatePath("/admins/media");
  const url = `/api/media/${year}/${month}/${filename}`;
  return NextResponse.json({
    url,
    file: {
      url,
      name: mediaDisplayName(filename),
      size: received,
      type: info.kind,
      createdAt: now.toISOString(),
    },
  });
}
