"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/admin/action-result";
import { siteStatSchema } from "@/lib/validations/admin/site-stat";

export async function getSiteStatsAction() {
  await requireAdmin();
  return prisma.siteStat.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getSiteStatAction(id: string) {
  await requireAdmin();
  return prisma.siteStat.findUnique({ where: { id } });
}

export async function saveSiteStatAction(
  input: unknown,
  id?: string,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = siteStatSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "ورودی نامعتبر");
  }

  if (id) {
    await prisma.siteStat.update({ where: { id }, data: parsed.data });
  } else {
    const created = await prisma.siteStat.create({ data: parsed.data });
    id = created.id;
  }

  revalidatePath("/");
  revalidatePath("/admins/site-stats");
  return actionSuccess({ id: id! });
}

export async function deleteSiteStatAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.siteStat.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admins/site-stats");
  return actionSuccess(undefined);
}
