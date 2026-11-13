import "server-only";

import path from "node:path";
import { mkdir, stat, unlink } from "node:fs/promises";
import {
  getFileExtension,
  getProductFileTypeInfo,
} from "@/lib/product-file-types";
import { prisma } from "@/lib/prisma";
import { parseProductUploadMaxSizeGb } from "@/lib/product-upload-limit";
import {
  DEFAULT_PRODUCT_UPLOAD_MAX_SIZE_GB,
  PRODUCT_UPLOAD_MAX_SIZE_SETTING_KEY,
} from "@/lib/validations/admin/site-settings";

const GIGABYTE = 1024 * 1024 * 1024;
const STORAGE_KEY_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-[a-zA-Z0-9._-]{1,120}$/;

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
  return (
    getProductFileTypeInfo(getOriginalFilename(storageKey))?.mime ??
    "application/octet-stream"
  );
}

export function getProductFileStorageRoot(): string {
  return path.resolve(
    /* turbopackIgnore: true */
    process.env.PRODUCT_FILE_STORAGE_DIR ??
      path.join(process.cwd(), "storage", "product-files"),
  );
}

/**
 * Max upload size (bytes) for package files.
 * Priority: admin setting (Settings → upload limit, in GB) → 1 GB default.
 */
export async function getProductFileMaxSize(): Promise<number> {
  try {
    const row = await prisma.siteSetting.findUnique({
      where: { key: PRODUCT_UPLOAD_MAX_SIZE_SETTING_KEY },
      select: { value: true },
    });
    const gb = parseProductUploadMaxSizeGb(row?.value);
    if (gb !== null) return Math.floor(gb * GIGABYTE);
  } catch (error) {
    console.error("Failed to read upload size setting", error);
  }
  return Math.floor(DEFAULT_PRODUCT_UPLOAD_MAX_SIZE_GB * GIGABYTE);
}

/**
 * ASCII-only, path-safe filename used inside the storage key.
 * The extension is kept as-is (callers validate it against the allowlist).
 */
export function sanitizeProductFilename(filename: string): string {
  const base = filename.split(/[\\/]/).pop() ?? "";
  const extension = getFileExtension(base);
  const stem = extension ? base.slice(0, -(extension.length + 1)) : base;
  const safeStem = stem
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[._-]+|[._-]+$/g, "")
    .slice(0, 90);
  const safeExtension = extension.replace(/[^a-z0-9]/g, "");
  return `${safeStem || "package"}${safeExtension ? `.${safeExtension}` : ""}`.slice(0, 120);
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
