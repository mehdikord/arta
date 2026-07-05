"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminRole } from "@/lib/admin/auth";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/admin/action-result";
import type { AppointmentStatus } from "@/lib/generated/prisma/client";

export async function getUsersAction() {
  await requireAdminRole(["SUPER_ADMIN", "ADMIN"]);
  return prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { purchases: true, appointments: true } },
    },
  });
}

export async function getUserAction(id: string) {
  await requireAdminRole(["SUPER_ADMIN", "ADMIN"]);
  return prisma.user.findFirst({
    where: { id, deletedAt: null },
    include: {
      purchases: { include: { product: true }, orderBy: { purchasedAt: "desc" } },
      appointments: { orderBy: { date: "desc" } },
    },
  });
}

export async function deactivateUserAction(id: string): Promise<ActionResult> {
  await requireAdminRole(["SUPER_ADMIN", "ADMIN"]);
  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/admins/users");
  return actionSuccess(undefined);
}

export async function getPurchasesAction() {
  await requireAdminRole(["SUPER_ADMIN", "ADMIN"]);
  return prisma.purchase.findMany({
    orderBy: { purchasedAt: "desc" },
    include: { user: true, product: true },
  });
}

export async function getAppointmentsAction() {
  await requireAdminRole(["SUPER_ADMIN", "ADMIN"]);
  return prisma.appointment.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: { user: true },
  });
}

export async function updateAppointmentStatusAction(
  id: string,
  status: AppointmentStatus,
): Promise<ActionResult> {
  await requireAdminRole(["SUPER_ADMIN", "ADMIN"]);
  await prisma.appointment.update({ where: { id }, data: { status } });
  revalidatePath("/admins/appointments");
  return actionSuccess(undefined);
}
