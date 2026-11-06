import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getOriginalFilename,
  getProductFileContentType,
  resolveProductFileLocation,
} from "@/lib/product-files";
import { verifyProductFileDownloadToken } from "@/lib/product-file-links";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Time-limited, user-bound download for a single product file.
 *
 * The only accepted path to these (private) files: a signed token
 * (from `getProductFileDownloadLinkAction`) that is bound to the exact
 * user + product + file and expires after the configured TTL
 * (default 4 hours). There is no direct/public download link.
 * On every request the purchase is re-checked so deactivated users or
 * refunded purchases lose access even inside the TTL window.
 */

function contentDisposition(filename: string): string {
  const asciiFallback = filename
    .replace(/[^\x20-\x7E]/g, "_")
    .replace(/["\\]/g, "_");
  return `attachment; filename="${asciiFallback}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

function parseRange(rangeHeader: string, fileSize: number) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
  if (!match) return null;

  const requestedStart = match[1] ? Number(match[1]) : undefined;
  const requestedEnd = match[2] ? Number(match[2]) : undefined;
  let start: number;
  let end: number;

  if (requestedStart === undefined) {
    if (!requestedEnd || requestedEnd <= 0) return null;
    start = Math.max(fileSize - requestedEnd, 0);
    end = fileSize - 1;
  } else {
    start = requestedStart;
    end =
      requestedEnd === undefined ? fileSize - 1 : Math.min(requestedEnd, fileSize - 1);
  }

  if (start < 0 || start >= fileSize || end < start) return null;
  return { start, end };
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> },
) {
  const { id, fileId } = await params;

  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return jsonError("لینک دانلود معتبر نیست؛ از بخش پکیج‌های من دانلود کنید", 401);
  }

  const payload = await verifyProductFileDownloadToken(token);
  if (!payload) {
    return jsonError("لینک دانلود منقضی شده است؛ دوباره از حساب خود لینک بگیرید", 410);
  }

  // The token must point at exactly this route's product + file.
  if (payload.productId !== id || payload.fileId !== fileId) {
    return jsonError("لینک دانلود نامعتبر است", 400);
  }

  // Re-check access on every request.
  const [user, product, file, purchase] = await Promise.all([
    prisma.user.findFirst({
      where: { id: payload.userId, deletedAt: null },
    }),
    prisma.product.findFirst({
      where: { id, deletedAt: null, isPublished: true },
    }),
    prisma.productFile.findFirst({ where: { id: fileId, productId: id } }),
    prisma.purchase.findFirst({
      where: { userId: payload.userId, productId: id, status: "COMPLETED" },
    }),
  ]);

  if (!user || !product || !file || !purchase) {
    return jsonError("شما به فایل این پکیج دسترسی ندارید", 403);
  }

  let filePath: string;
  try {
    filePath = resolveProductFileLocation(file.storageKey);
  } catch {
    return jsonError("فایل پکیج نامعتبر است", 404);
  }

  let fileStats;
  try {
    fileStats = await stat(filePath);
    if (!fileStats.isFile()) throw new Error("NOT_A_FILE");
  } catch {
    return jsonError("فایل پکیج یافت نشد", 404);
  }

  const filename = getOriginalFilename(file.storageKey);
  const baseHeaders = {
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-store, max-age=0",
    "Content-Disposition": contentDisposition(filename),
    "Content-Type": getProductFileContentType(file.storageKey),
    "X-Content-Type-Options": "nosniff",
  };
  const rangeHeader = request.headers.get("range");

  if (rangeHeader) {
    const range = parseRange(rangeHeader, fileStats.size);
    if (!range) {
      return new NextResponse(null, {
        status: 416,
        headers: {
          ...baseHeaders,
          "Content-Range": `bytes */${fileStats.size}`,
        },
      });
    }

    const stream = createReadStream(filePath, range);
    return new NextResponse(Readable.toWeb(stream) as BodyInit, {
      status: 206,
      headers: {
        ...baseHeaders,
        "Content-Length": String(range.end - range.start + 1),
        "Content-Range": `bytes ${range.start}-${range.end}/${fileStats.size}`,
      },
    });
  }

  const stream = createReadStream(filePath);
  return new NextResponse(Readable.toWeb(stream) as BodyInit, {
    headers: {
      ...baseHeaders,
      "Content-Length": String(fileStats.size),
    },
  });
}
