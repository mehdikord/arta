"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/admin/action-result";
import {
  clearAdminSessionCookie,
  createAdminSessionToken,
  setAdminSessionCookie,
} from "@/lib/admin/session";
import { adminLoginSchema } from "@/lib/validations/admin/auth";
import { ADMIN_DASHBOARD_PATH } from "@/lib/admin/constants";

export async function loginAdminAction(
  input: unknown,
): Promise<ActionResult<{ redirect: string }>> {
  const parsed = adminLoginSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "ورودی نامعتبر");
  }

  const { mobile, password } = parsed.data;

  const admin = await prisma.admin.findFirst({
    where: { mobile, deletedAt: null, isActive: true },
  });

  if (!admin) {
    return actionError("موبایل یا گذرواژه اشتباه است");
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    return actionError("موبایل یا گذرواژه اشتباه است");
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });

  const token = await createAdminSessionToken({
    adminId: admin.id,
    role: admin.role,
    name: admin.name,
    mobile: admin.mobile,
  });

  await setAdminSessionCookie(token);

  return actionSuccess({ redirect: ADMIN_DASHBOARD_PATH });
}

export async function logoutAdminAction(): Promise<void> {
  await clearAdminSessionCookie();
}
