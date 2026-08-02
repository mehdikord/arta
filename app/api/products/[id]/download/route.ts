import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getStoredOriginalFilename,
  resolveProductFilePath,
} from "@/lib/product-files";
import { getUserSessionFromCookie } from "@/lib/user/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getUserSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "ابتدا وارد حساب خود شوید" }, { status: 401 });
  }

  const { id } = await params;
  const product = await prisma.product.findFirst({
    where: {
      id,
      purchases: {
        some: {
          userId: session.userId,
          status: "COMPLETED",
          user: {
            deletedAt: null,
          },
        },
      },
    },
    select: {
      fileUrl: true,
    },
  });
  if (!product) {
    return NextResponse.json(
      { error: "شما به فایل این پکیج دسترسی ندارید" },
      { status: 403 },
    );
  }

  let filePath: string;
  try {
    filePath = resolveProductFilePath(product.fileUrl);
  } catch {
    return NextResponse.json({ error: "فایل پکیج نامعتبر است" }, { status: 404 });
  }

  let fileStats;
  try {
    fileStats = await stat(filePath);
    if (!fileStats.isFile()) throw new Error("NOT_A_FILE");
  } catch {
    return NextResponse.json({ error: "فایل پکیج یافت نشد" }, { status: 404 });
  }

  const filename = getStoredOriginalFilename(product.fileUrl);
  const baseHeaders = {
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-store, max-age=0",
    "Content-Disposition": contentDisposition(filename),
    "Content-Type": "application/octet-stream",
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
