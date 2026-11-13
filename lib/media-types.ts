/**
 * Public media library (storage/web, served from /api/media/…).
 * Shared by the upload route (server) and the media UI (client).
 * Type is decided by EXTENSION and then verified against the file's
 * leading bytes on the server — the browser MIME type is never trusted.
 */

export type MediaKind = "image" | "video" | "audio" | "document";

type MediaTypeInfo = { mime: string; kind: MediaKind; maxBytes: number };

const MB = 1024 * 1024;

export const MEDIA_TYPES: Record<string, MediaTypeInfo> = {
  jpg: { mime: "image/jpeg", kind: "image", maxBytes: 10 * MB },
  jpeg: { mime: "image/jpeg", kind: "image", maxBytes: 10 * MB },
  png: { mime: "image/png", kind: "image", maxBytes: 10 * MB },
  webp: { mime: "image/webp", kind: "image", maxBytes: 10 * MB },
  gif: { mime: "image/gif", kind: "image", maxBytes: 10 * MB },
  avif: { mime: "image/avif", kind: "image", maxBytes: 10 * MB },
  svg: { mime: "image/svg+xml", kind: "image", maxBytes: 2 * MB },
  mp4: { mime: "video/mp4", kind: "video", maxBytes: 200 * MB },
  webm: { mime: "video/webm", kind: "video", maxBytes: 200 * MB },
  mov: { mime: "video/quicktime", kind: "video", maxBytes: 200 * MB },
  mp3: { mime: "audio/mpeg", kind: "audio", maxBytes: 50 * MB },
  m4a: { mime: "audio/mp4", kind: "audio", maxBytes: 50 * MB },
  ogg: { mime: "audio/ogg", kind: "audio", maxBytes: 50 * MB },
  wav: { mime: "audio/wav", kind: "audio", maxBytes: 50 * MB },
  pdf: { mime: "application/pdf", kind: "document", maxBytes: 50 * MB },
};

export const MEDIA_KIND_LABELS: Record<MediaKind, string> = {
  image: "تصویر",
  video: "ویدیو",
  audio: "صوت",
  document: "سند",
};

export const MEDIA_ACCEPT = Object.keys(MEDIA_TYPES).map((ext) => `.${ext}`).join(",");

export function mediaExtension(filename: string): string {
  const base = filename.split(/[\\/]/).pop() ?? "";
  const dot = base.lastIndexOf(".");
  return dot > 0 ? base.slice(dot + 1).toLowerCase() : "";
}

export function getMediaTypeInfo(filename: string): MediaTypeInfo | null {
  const ext = mediaExtension(filename);
  return Object.hasOwn(MEDIA_TYPES, ext) ? MEDIA_TYPES[ext]! : null;
}

/** Stored names are "<uuid>-<name>.<ext>"; show only "<name>.<ext>". */
export function mediaDisplayName(storedName: string): string {
  return storedName.replace(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i, "");
}

const ascii = (bytes: Uint8Array, start: number, end: number) =>
  String.fromCharCode(...bytes.subarray(start, end));

/**
 * Check the first bytes of an upload against its declared extension.
 * Rejects e.g. an HTML page renamed to .png.
 */
export function matchesMediaSignature(ext: string, head: Uint8Array): boolean {
  const b = head;
  switch (ext) {
    case "jpg":
    case "jpeg":
      return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    case "png":
      return b[0] === 0x89 && ascii(b, 1, 4) === "PNG";
    case "gif":
      return ascii(b, 0, 4) === "GIF8";
    case "webp":
      return ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP";
    case "wav":
      return ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WAVE";
    case "avif":
    case "mp4":
    case "mov":
    case "m4a":
      return ascii(b, 4, 8) === "ftyp" || (ext === "mov" && ["moov", "mdat", "wide", "free"].includes(ascii(b, 4, 8)));
    case "webm":
      return b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3;
    case "ogg":
      return ascii(b, 0, 4) === "OggS";
    case "mp3":
      return ascii(b, 0, 3) === "ID3" || (b[0] === 0xff && (b[1]! & 0xe0) === 0xe0);
    case "pdf":
      return ascii(b, 0, 5) === "%PDF-";
    case "svg": {
      const text = new TextDecoder().decode(b).replace(/^﻿/, "").trimStart().toLowerCase();
      return (text.startsWith("<?xml") || text.startsWith("<svg") || text.startsWith("<!--") || text.startsWith("<!doctype svg")) && text.includes("<svg");
    }
    default:
      return false;
  }
}
