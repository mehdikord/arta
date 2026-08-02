import "server-only";

import path from "node:path";
import { mkdir, stat, unlink } from "node:fs/promises";

const DEFAULT_MAX_FILE_SIZE = 1024 * 1024 * 1024;
const STORAGE_KEY_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-[a-zA-Z0-9._-]{1,120}$/;

export const PRODUCT_FILE_TYPES: Record<string, string> = {
  "application/pdf": ".pdf",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
  "application/zip": ".zip",
  "application/x-zip-compressed": ".zip",
  "application/vnd.rar": ".rar",
  "application/x-rar-compressed": ".rar",
  "application/x-7z-compressed": ".7z",
};

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
  if (!legacyUrl.startsWith("/uploads/")) return;

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
