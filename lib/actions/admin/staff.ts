"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminRole } from "@/lib/admin/auth";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/admin/action-result";
import { staffSchema } from "@/lib/validations/admin/staff";

export async function getStaffAction() {
  await requireAdminRole(["SUPER_ADMIN"]);
  return prisma.admin.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });
}

export async function getStaffMemberAction(id: string) {
  await requireAdminRole(["SUPER_ADMIN"]);
  return prisma.admin.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
      isActive: true,
    },
  });
}

export async function saveStaffAction(
  input: unknown,
  id?: string,
  currentAdminId?: string,
): Promise<ActionResult<{ id: string }>> {
  const session = await requireAdminRole(["SUPER_ADMIN"]);
  const parsed = staffSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "ورودی نامعتبر");
  }

  const { password, ...data } = parsed.data;

  if (id) {
    if (id === session.adminId && !data.isActive) {
      return actionError("نمی‌توانید حساب خود را غیرفعال کنید");
    }
    const updateData: Record<string, unknown> = { ...data };
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }
    await prisma.admin.update({ where: { id }, data: updateData });
  } else {
    if (!password) {
      return actionError("رمز عبور الزامی است");
    }
    const created = await prisma.admin.create({
      data: {
        ...data,
        passwordHash: await bcrypt.hash(password, 10),
      },
    });
    id = created.id;
  }

  revalidatePath("/admins/staff");
  return actionSuccess({ id: id! });
}

export async function deactivateStaffAction(
  id: string,
  currentAdminId: string,
): Promise<ActionResult> {
  await requireAdminRole(["SUPER_ADMIN"]);
  if (id === currentAdminId) {
    return actionError("نمی‌توانید حساب خود را حذف کنید");
  }
  await prisma.admin.update({
    where: { id },
    data: { isActive: false, deletedAt: new Date() },
  });
  revalidatePath("/admins/staff");
  return actionSuccess(undefined);
}
