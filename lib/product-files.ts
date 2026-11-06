import "server-only";

import path from "node:path";
import { mkdir, stat, unlink } from "node:fs/promises";

const DEFAULT_MAX_FILE_SIZE = 1024 * 1024 * 1024;
const STORAGE_KEY_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-[a-zA-Z0-9._-]{1,120}$/;

export const PRODUCT_FILE_TYPES: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "text/plain": ".txt",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "audio/mpeg": ".mp3",
  "audio/mp4": ".m4a",
  "audio/ogg": ".ogg",
  "audio/wav": ".wav",
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "application/zip": ".zip",
  "application/x-zip-compressed": ".zip",
  "application/vnd.rar": ".rar",
  "application/x-rar-compressed": ".rar",
  "application/x-7z-compressed": ".7z",
};

/** Kinds that the upload route can produce (ARCHIVE is legacy-only). */
export type UploadableProductFileKind = "TEXT" | "VIDEO" | "AUDIO" | "ARCHIVE";

const PRODUCT_FILE_KINDS_BY_MIME: Record<string, UploadableProductFileKind> = {
  "application/pdf": "TEXT",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "TEXT",
  "text/plain": "TEXT",
  "video/mp4": "VIDEO",
  "video/webm": "VIDEO",
  "audio/mpeg": "AUDIO",
  "audio/mp4": "AUDIO",
  "audio/ogg": "AUDIO",
  "audio/wav": "AUDIO",
  "image/png": "TEXT",
  "image/jpeg": "TEXT",
  "image/webp": "TEXT",
  "image/gif": "TEXT",
  "application/zip": "ARCHIVE",
  "application/x-zip-compressed": "ARCHIVE",
  "application/vnd.rar": "ARCHIVE",
  "application/x-rar-compressed": "ARCHIVE",
  "application/x-7z-compressed": "ARCHIVE",
};

/** Auto-detect the file kind from the uploaded MIME type. */
export function detectProductFileKind(
  contentType: string,
): UploadableProductFileKind | null {
  return PRODUCT_FILE_KINDS_BY_MIME[contentType.toLowerCase()] ?? null;
}

/** Legacy public URL prefixes allowed inside product_files.storage_key. */
const LEGACY_PUBLIC_PREFIXES = ["/files/", "/uploads/"] as const;

function isLegacyPublicStorageKey(storageKey: string): boolean {
  return LEGACY_PUBLIC_PREFIXES.some((prefix) =>
    storageKey.startsWith(prefix),
  );
}

/**
 * Resolve a product-file storage key to an on-disk location.
 * Accepts private storage keys (uuid-<name>) and legacy public URLs.
 * Throws when the key is not a known shape or escapes the storage root.
 */
export function resolveProductFileLocation(storageKey: string): string {
  if (isValidProductStorageKey(storageKey)) {
    return resolveProductFilePath(storageKey);
  }

  if (isLegacyPublicStorageKey(storageKey)) {
    let decodedUrl: string;
    try {
      decodedUrl = decodeURIComponent(storageKey);
    } catch {
      throw new Error("Invalid product file storage key");
    }
    const projectRoot = process.cwd();
    const publicRoot = path.resolve(
      /* turbopackIgnore: true */ projectRoot,
      "public",
    );
    const resolved = path.resolve(
      /* turbopackIgnore: true */ publicRoot,
      decodedUrl.replace(/^\/+/, ""),
    );
    if (!resolved.startsWith(`${publicRoot}${path.sep}`)) {
      throw new Error("Invalid product file path");
    }
    return resolved;
  }

  throw new Error("Invalid product file storage key");
}

/** Does the on-disk file for a storage key exist? */
export async function productFileLocationExists(storageKey: string): Promise<boolean> {
  let location: string;
  try {
    location = resolveProductFileLocation(storageKey);
  } catch {
    return false;
  }
  try {
    const fileStats = await stat(location);
    return fileStats.isFile();
  } catch {
    return false;
  }
}

/**
 * Original download filename for a storage key:
 * private keys are uuid-<original>; legacy public URLs use the path basename.
 */
export function getOriginalFilename(storageKey: string): string {
  if (isValidProductStorageKey(storageKey)) {
    return storageKey.slice(37);
  }
  if (isLegacyPublicStorageKey(storageKey)) {
    const basename = storageKey.split("/").pop() ?? "";
    if (basename) return basename;
  }
  return "package-file";
}

/** MIME type for delivery, derived from the file extension. */
export function getProductFileContentType(storageKey: string): string {
  const ext = path.extname(getOriginalFilename(storageKey)).toLowerCase();
  switch (ext) {
    case ".pdf":
      return "application/pdf";
    case ".mp4":
      return "video/mp4";
    case ".webm":
      return "video/webm";
    case ".mp3":
      return "audio/mpeg";
    case ".m4a":
      return "audio/mp4";
    case ".ogg":
      return "audio/ogg";
    case ".wav":
      return "audio/wav";
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case ".txt":
      return "text/plain";
    case ".gif":
      return "image/gif";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".rar":
      return "application/vnd.rar";
    case ".7z":
      return "application/x-7z-compressed";
    default:
      return "application/octet-stream";
  }
}

export function getProductFileStorageRoot(): string {
  return path.resolve(
    /* turbopackIgnore: true */
    process.env.PRODUCT_FILE_STORAGE_DIR ??
      path.join(process.cwd(), "storage", "product-files"),
  );
}

export function getProductFileMaxSize(): number {
  const configuredMegabytes = Number(process.env.PRODUCT_FILE_MAX_SIZE_MB);
  if (Number.isFinite(configuredMegabytes) && configuredMegabytes > 0) {
    return Math.floor(configuredMegabytes * 1024 * 1024);
  }
  return DEFAULT_MAX_FILE_SIZE;
}

export function sanitizeProductFilename(filename: string): string {
  const extension = path.extname(filename).toLowerCase();
  const baseName = path
    .basename(filename, extension)
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[._-]+|[._-]+$/g, "")
    .slice(0, 90);
  return `${baseName || "package"}${extension}`.slice(0, 120);
}

export function isValidProductStorageKey(storageKey: string): boolean {
  return STORAGE_KEY_PATTERN.test(storageKey);
}

export function resolveProductFilePath(storageKey: string): string {
  if (!isValidProductStorageKey(storageKey)) {
    throw new Error("Invalid product storage key");
  }

  const storageRoot = getProductFileStorageRoot();
  const resolvedPath = path.resolve(
    /* turbopackIgnore: true */ storageRoot,
    storageKey,
  );
  if (path.dirname(resolvedPath) !== storageRoot) {
    throw new Error("Invalid product file path");
  }
  return resolvedPath;
}

export async function ensureProductFileStorage(): Promise<string> {
  const storageRoot = getProductFileStorageRoot();
  await mkdir(storageRoot, { recursive: true, mode: 0o700 });
  return storageRoot;
}

export async function productFileExists(storageKey: string): Promise<boolean> {
  try {
    const fileStats = await stat(resolveProductFilePath(storageKey));
    return fileStats.isFile();
  } catch {
    return false;
  }
}

export async function deleteProductFile(storageKey: string): Promise<void> {
  if (!isValidProductStorageKey(storageKey)) return;
  try {
    await unlink(resolveProductFilePath(storageKey));
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw error;
  }
}

export async function deleteLegacyPublicProductFile(
  legacyUrl: string,
): Promise<void> {
  if (!legacyUrl.startsWith("/uploads/") && !legacyUrl.startsWith("/files/")) {
    return;
  }

  let decodedUrl: string;
  try {
    decodedUrl = decodeURIComponent(legacyUrl);
  } catch {
    return;
  }

  const projectRoot = process.cwd();
  const publicUploadsRoot = path.resolve(
    /* turbopackIgnore: true */ projectRoot,
    "public",
    "uploads",
  );
  const legacyPath = path.resolve(
    /* turbopackIgnore: true */ projectRoot,
    "public",
    decodedUrl.replace(/^\/+/, ""),
  );
  if (
    legacyPath === publicUploadsRoot ||
    !legacyPath.startsWith(`${publicUploadsRoot}${path.sep}`)
  ) {
    return;
  }

  try {
    const fileStats = await stat(legacyPath);
    if (fileStats.isFile()) await unlink(legacyPath);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw error;
  }
}

export function getStoredOriginalFilename(storageKey: string): string {
  if (!isValidProductStorageKey(storageKey)) return "package-file";
  return storageKey.slice(37);
}
