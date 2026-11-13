"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminRole } from "@/lib/admin/auth";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/admin/action-result";
import {
  PRODUCT_UPLOAD_MAX_SIZE_SETTING_KEY,
  siteSettingsSchema,
} from "@/lib/validations/admin/site-settings";
import { parseProductUploadMaxSizeGb } from "@/lib/product-upload-limit";

const SETTING_KEYS = [
  "name",
  "tagline",
  "description",
  "phone",
  "email",
  "address",
  "workingHours",
  "instagram",
  "telegram",
  "linkedin",
  "whatsapp",
] as const;

export async function getSiteSettingsAction() {
  await requireAdminRole(["SUPER_ADMIN", "ADMIN"]);
  const rows = await prisma.siteSetting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    name: map.name ?? "",
    tagline: map.tagline ?? "",
    description: map.description ?? "",
    phone: map.phone ?? "",
    email: map.email ?? "",
    address: map.address ?? "",
    workingHours: map.workingHours ?? "",
    instagram: map.instagram ?? "",
    telegram: map.telegram ?? "",
    linkedin: map.linkedin ?? "",
    whatsapp: map.whatsapp ?? "",
    productUploadMaxSizeGb: parseProductUploadMaxSizeGb(
      map[PRODUCT_UPLOAD_MAX_SIZE_SETTING_KEY],
    ),
  };
}

export async function saveSiteSettingsAction(
  input: unknown,
): Promise<ActionResult> {
  await requireAdminRole(["SUPER_ADMIN", "ADMIN"]);
  const parsed = siteSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "ورودی نامعتبر");
  }

  const uploadLimit = parsed.data.productUploadMaxSizeGb;
  await prisma.$transaction([
    ...SETTING_KEYS.map((key) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value: parsed.data[key] },
        create: { key, value: parsed.data[key] },
      }),
    ),
    // Empty field → remove the row so the default (1 GB) applies.
    uploadLimit == null
      ? prisma.siteSetting.deleteMany({
          where: { key: PRODUCT_UPLOAD_MAX_SIZE_SETTING_KEY },
        })
      : prisma.siteSetting.upsert({
          where: { key: PRODUCT_UPLOAD_MAX_SIZE_SETTING_KEY },
          update: { value: String(uploadLimit) },
          create: {
            key: PRODUCT_UPLOAD_MAX_SIZE_SETTING_KEY,
            value: String(uploadLimit),
          },
        }),
  ]);

  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/admins/settings");
  revalidatePath("/admins/products", "layout");
  return actionSuccess(undefined);
}
