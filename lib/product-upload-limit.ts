import {
  MAX_PRODUCT_UPLOAD_MAX_SIZE_GB,
  MIN_PRODUCT_UPLOAD_MAX_SIZE_GB,
} from "@/lib/validations/admin/site-settings";

/** Stored setting string → GB number, or null when unset/invalid. */
export function parseProductUploadMaxSizeGb(
  value: string | null | undefined,
): number | null {
  if (value == null || value.trim() === "") return null;
  const gb = Number(value);
  if (
    !Number.isFinite(gb) ||
    gb < MIN_PRODUCT_UPLOAD_MAX_SIZE_GB ||
    gb > MAX_PRODUCT_UPLOAD_MAX_SIZE_GB
  ) {
    return null;
  }
  return gb;
}
