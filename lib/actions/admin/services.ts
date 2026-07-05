"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/admin/action-result";
import { serviceSchema } from "@/lib/validations/admin/service";

export async function getServicesAction() {
  await requireAdmin();
  return prisma.service.findMany({
    where: { deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getServiceAction(id: string) {
  await requireAdmin();
  return prisma.service.findFirst({ where: { id, deletedAt: null } });
}

export async function saveServiceAction(
  input: unknown,
  id?: string,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = serviceSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "ورودی نامعتبر");
  }

  const data = parsed.data;

  if (id) {
    await prisma.service.update({ where: { id }, data });
  } else {
    const created = await prisma.service.create({ data });
    id = created.id;
  }

  revalidatePath("/services");
  revalidatePath("/admins/services");
  return actionSuccess({ id: id! });
}

export async function deleteServiceAction(
  id: string,
): Promise<ActionResult> {
  await requireAdmin();
  await prisma.service.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/services");
  revalidatePath("/admins/services");
  return actionSuccess(undefined);
}

export async function toggleServicePublishedAction(
  id: string,
  isPublished: boolean,
): Promise<ActionResult> {
  await requireAdmin();
  await prisma.service.update({ where: { id }, data: { isPublished } });
  revalidatePath("/services");
  return actionSuccess(undefined);
}
