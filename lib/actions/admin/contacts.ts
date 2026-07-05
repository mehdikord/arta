"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminRole } from "@/lib/admin/auth";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/admin/action-result";
import type { ContactStatus } from "@/lib/generated/prisma/client";

export async function getContactsAction(status?: ContactStatus) {
  await requireAdminRole(["SUPER_ADMIN", "ADMIN"]);
  return prisma.contactSubmission.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export async function getContactAction(id: string) {
  await requireAdminRole(["SUPER_ADMIN", "ADMIN"]);
  return prisma.contactSubmission.findUnique({ where: { id } });
}

export async function updateContactStatusAction(
  id: string,
  status: ContactStatus,
): Promise<ActionResult> {
  await requireAdminRole(["SUPER_ADMIN", "ADMIN"]);
  await prisma.contactSubmission.update({ where: { id }, data: { status } });
  revalidatePath("/admins/contacts");
  revalidatePath("/admins/dashboard");
  return actionSuccess(undefined);
}

export async function getNewContactsCountAction() {
  await requireAdminRole(["SUPER_ADMIN", "ADMIN"]);
  return prisma.contactSubmission.count({ where: { status: "NEW" } });
}
