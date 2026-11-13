/**
 * Allowed product (package) file types — shared by the admin form (client)
 * and the secure upload route (server).
 *
 * Detection is based on the file EXTENSION, never on the browser-reported
 * MIME type: browsers report inconsistent or empty types for many formats
 * (e.g. `audio/x-wav`, `audio/mp3`, `video/quicktime`, "" for .rar/.7z/.mkv),
 * which previously caused valid files to be rejected.
 *
 * Files are always stored privately and served as `attachment` with
 * `X-Content-Type-Options: nosniff`, so the content type below is only used
 * for the download response.
 */

export type ProductFileKindValue = "TEXT" | "VIDEO" | "AUDIO" | "ARCHIVE";

type FileTypeInfo = { mime: string; kind: ProductFileKindValue };

export const PRODUCT_FILE_EXTENSIONS: Record<string, FileTypeInfo> = {
  // Documents / text
  pdf: { mime: "application/pdf", kind: "TEXT" },
  doc: { mime: "application/msword", kind: "TEXT" },
  docx: {
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    kind: "TEXT",
  },
  odt: { mime: "application/vnd.oasis.opendocument.text", kind: "TEXT" },
  rtf: { mime: "application/rtf", kind: "TEXT" },
  txt: { mime: "text/plain; charset=utf-8", kind: "TEXT" },
  md: { mime: "text/markdown; charset=utf-8", kind: "TEXT" },
  csv: { mime: "text/csv; charset=utf-8", kind: "TEXT" },
  epub: { mime: "application/epub+zip", kind: "TEXT" },
  ppt: { mime: "application/vnd.ms-powerpoint", kind: "TEXT" },
  pptx: {
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    kind: "TEXT",
  },
  odp: { mime: "application/vnd.oasis.opendocument.presentation", kind: "TEXT" },
  xls: { mime: "application/vnd.ms-excel", kind: "TEXT" },
  xlsx: {
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    kind: "TEXT",
  },
  ods: { mime: "application/vnd.oasis.opendocument.spreadsheet", kind: "TEXT" },
  // Images (grouped with text-like content)
  png: { mime: "image/png", kind: "TEXT" },
  jpg: { mime: "image/jpeg", kind: "TEXT" },
  jpeg: { mime: "image/jpeg", kind: "TEXT" },
  webp: { mime: "image/webp", kind: "TEXT" },
  gif: { mime: "image/gif", kind: "TEXT" },
  // Video
  mp4: { mime: "video/mp4", kind: "VIDEO" },
  m4v: { mime: "video/x-m4v", kind: "VIDEO" },
  webm: { mime: "video/webm", kind: "VIDEO" },
  mov: { mime: "video/quicktime", kind: "VIDEO" },
  mkv: { mime: "video/x-matroska", kind: "VIDEO" },
  avi: { mime: "video/x-msvideo", kind: "VIDEO" },
  wmv: { mime: "video/x-ms-wmv", kind: "VIDEO" },
  flv: { mime: "video/x-flv", kind: "VIDEO" },
  "3gp": { mime: "video/3gpp", kind: "VIDEO" },
  mpg: { mime: "video/mpeg", kind: "VIDEO" },
  mpeg: { mime: "video/mpeg", kind: "VIDEO" },
  // Audio
  mp3: { mime: "audio/mpeg", kind: "AUDIO" },
  m4a: { mime: "audio/mp4", kind: "AUDIO" },
  aac: { mime: "audio/aac", kind: "AUDIO" },
  ogg: { mime: "audio/ogg", kind: "AUDIO" },
  oga: { mime: "audio/ogg", kind: "AUDIO" },
  opus: { mime: "audio/opus", kind: "AUDIO" },
  wav: { mime: "audio/wav", kind: "AUDIO" },
  flac: { mime: "audio/flac", kind: "AUDIO" },
  wma: { mime: "audio/x-ms-wma", kind: "AUDIO" },
  amr: { mime: "audio/amr", kind: "AUDIO" },
  // Archives
  zip: { mime: "application/zip", kind: "ARCHIVE" },
  rar: { mime: "application/vnd.rar", kind: "ARCHIVE" },
  "7z": { mime: "application/x-7z-compressed", kind: "ARCHIVE" },
  tar: { mime: "application/x-tar", kind: "ARCHIVE" },
  gz: { mime: "application/gzip", kind: "ARCHIVE" },
  tgz: { mime: "application/gzip", kind: "ARCHIVE" },
  bz2: { mime: "application/x-bzip2", kind: "ARCHIVE" },
  xz: { mime: "application/x-xz", kind: "ARCHIVE" },
};

/** Lower-cased extension without the dot ("" when there is none). */
export function getFileExtension(filename: string): string {
  const base = filename.split(/[\\/]/).pop() ?? "";
  const dot = base.lastIndexOf(".");
  if (dot <= 0 || dot === base.length - 1) return "";
  return base.slice(dot + 1).toLowerCase();
}

export function getProductFileTypeInfo(filename: string): FileTypeInfo | null {
  const extension = getFileExtension(filename);
  return Object.hasOwn(PRODUCT_FILE_EXTENSIONS, extension)
    ? PRODUCT_FILE_EXTENSIONS[extension]
    : null;
}

/** `accept` attribute for file inputs. */
export const PRODUCT_FILE_ACCEPT = Object.keys(PRODUCT_FILE_EXTENSIONS)
  .map((ext) => `.${ext}`)
  .join(",");

/** Human-readable groups for helper text in the admin UI. */
export const PRODUCT_FILE_GROUPS: { kind: ProductFileKindValue; label: string; extensions: string[] }[] =
  (
    [
      ["TEXT", "سند و متن"],
      ["VIDEO", "ویدیو"],
      ["AUDIO", "صوت"],
      ["ARCHIVE", "فشرده"],
    ] as const
  ).map(([kind, label]) => ({
    kind,
    label,
    extensions: Object.entries(PRODUCT_FILE_EXTENSIONS)
      .filter(([, info]) => info.kind === kind)
      .map(([ext]) => ext.toUpperCase()),
  }));

/** Format bytes as a short Persian-friendly size string. */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "۰ بایت";
  const units = ["بایت", "کیلوبایت", "مگابایت", "گیگابایت"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const rounded = value >= 100 || unit === 0 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded.toLocaleString("fa-IR")} ${units[unit]}`;
}
