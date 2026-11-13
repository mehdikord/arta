import { z } from "zod";

/** Site-setting key for the package-file upload limit (value in GB). */
export const PRODUCT_UPLOAD_MAX_SIZE_SETTING_KEY = "productUploadMaxSizeGb";
/** Used when the admin has not set a limit. */
export const DEFAULT_PRODUCT_UPLOAD_MAX_SIZE_GB = 1;
export const MIN_PRODUCT_UPLOAD_MAX_SIZE_GB = 0.01;
export const MAX_PRODUCT_UPLOAD_MAX_SIZE_GB = 100;

export const productUploadMaxSizeGbSchema = z
  .number({ error: "حجم باید عدد باشد" })
  .min(MIN_PRODUCT_UPLOAD_MAX_SIZE_GB, "حداقل حجم مجاز ۰٫۰۱ گیگابایت است")
  .max(MAX_PRODUCT_UPLOAD_MAX_SIZE_GB, "حداکثر حجم مجاز ۱۰۰ گیگابایت است")
  .nullable();

export const siteSettingsSchema = z.object({
  name: z.string().min(2).max(191),
  tagline: z.string().min(2).max(191),
  description: z.string().min(10),
  phone: z.string().min(5).max(50),
  email: z.string().email(),
  address: z.string().min(5),
  workingHours: z.string().min(5),
  instagram: z.string().url().or(z.literal("")),
  telegram: z.string().url().or(z.literal("")),
  linkedin: z.string().url().or(z.literal("")),
  whatsapp: z.string().url().or(z.literal("")),
  /** null → default (1 GB). */
  productUploadMaxSizeGb: productUploadMaxSizeGbSchema,
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
