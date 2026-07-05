"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminRole } from "@/lib/admin/auth";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/admin/action-result";
import { siteSettingsSchema } from "@/lib/validations/admin/site-settings";

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

  await prisma.$transaction(
    SETTING_KEYS.map((key) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value: parsed.data[key] },
        create: { key, value: parsed.data[key] },
      }),
    ),
  );

  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/admins/settings");
  return actionSuccess(undefined);
}
