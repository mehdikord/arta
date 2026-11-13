import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { NextRequest, NextResponse } from "next/server";
import { getMediaTypeInfo } from "@/lib/media-types";

export const runtime = "nodejs";

const STORAGE_ROOT = path.resolve(process.cwd(), "storage", "web");

function notFound() {
  return new NextResponse("Not found", { status: 404 });
}

function parseRange(header: string, size: number) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match) return null;
  let start: number;
  let end: number;
  if (!match[1]) {
    const suffix = Number(match[2]);
    if (!suffix) return null;
    start = Math.max(size - suffix, 0);
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  }
  if (start >= size || end < start) return null;
  return { start, end };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const filePath = path.resolve(STORAGE_ROOT, segments.join("/"));
  if (!filePath.startsWith(STORAGE_ROOT + path.sep)) return notFound();

  let size: number;
  try {
    const info = await stat(filePath);
    if (!info.isFile()) return notFound();
    size = info.size;
  } catch {
    return notFound();
  }

  const type = getMediaTypeInfo(filePath);
  const headers: Record<string, string> = {
    "Content-Type": type?.mime ?? "application/octet-stream",
    "Cache-Control": "public, max-age=31536000, immutable",
    "Accept-Ranges": "bytes",
    "X-Content-Type-Options": "nosniff",
  };
  // SVG can carry scripts: when opened directly it must not run in our origin.
  if (type?.mime === "image/svg+xml") {
    headers["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; img-src data:; sandbox";
  }

  const rangeHeader = request.headers.get("range");
  if (rangeHeader) {
    const range = parseRange(rangeHeader, size);
    if (!range) {
      return new NextResponse(null, { status: 416, headers: { ...headers, "Content-Range": `bytes */${size}` } });
    }
    return new NextResponse(Readable.toWeb(createReadStream(filePath, range)) as BodyInit, {
      status: 206,
      headers: {
        ...headers,
        "Content-Length": String(range.end - range.start + 1),
        "Content-Range": `bytes ${range.start}-${range.end}/${size}`,
      },
    });
  }

  return new NextResponse(Readable.toWeb(createReadStream(filePath)) as BodyInit, {
    headers: { ...headers, "Content-Length": String(size) },
  });
}
