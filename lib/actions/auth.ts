"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/admin/action-result";
import {
  loginSchema,
  registerSchema,
  type LoginInput,
} from "@/lib/validations/auth";
import { settingsSchema, changePasswordSchema } from "@/lib/validations/profile";
import {
  createUserSessionToken,
  setUserSessionCookie,
  clearUserSessionCookie,
  getUserSessionFromCookie,
} from "@/lib/user/session";
import { getActiveAppointmentCount } from "@/lib/data/appointments";
import { timeSlotToAppointmentSlot } from "@/lib/user/slots";
import type { TimeSlot } from "@/types";

export async function loginUserAction(
  input: LoginInput,
): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "ورودی نامعتبر");
  }

  const user = await prisma.user.findFirst({
    where: { mobile: parsed.data.mobile, deletedAt: null },
  });
  if (!user) {
    return actionError("شماره موبایل یا رمز عبور اشتباه است");
  }

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) {
    return actionError("شماره موبایل یا رمز عبور اشتباه است");
  }

  const token = await createUserSessionToken({
    userId: user.id,
    name: user.name,
    mobile: user.mobile,
  });
  await setUserSessionCookie(token);
  return actionSuccess(undefined);
}

export async function registerUserAction(input: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "ورودی نامعتبر");
  }

  const existing = await prisma.user.findUnique({
    where: { mobile: parsed.data.mobile },
  });
  if (existing) {
    return actionError("این شماره موبایل قبلاً ثبت شده است");
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      mobile: parsed.data.mobile,
      passwordHash,
    },
  });

  const token = await createUserSessionToken({
    userId: user.id,
    name: user.name,
    mobile: user.mobile,
  });
  await setUserSessionCookie(token);
  return actionSuccess(undefined);
}

export async function logoutUserAction(): Promise<ActionResult> {
  await clearUserSessionCookie();
  return actionSuccess(undefined);
}

export async function getCurrentUserAction() {
  const session = await getUserSessionFromCookie();
  if (!session) return null;

  const user = await prisma.user.findFirst({
    where: { id: session.userId, deletedAt: null },
    include: {
      purchases: {
        where: { status: "COMPLETED" },
        select: { productId: true },
      },
      appointments: { select: { id: true } },
    },
  });
  if (!user) return null;

  const activeAppointmentCount = await getActiveAppointmentCount(user.id);

  return {
    id: user.id,
    name: user.name,
    mobile: user.mobile,
    createdAt: user.createdAt.toISOString(),
    purchases: user.purchases.map((p) => p.productId),
    appointments: user.appointments.map((a) => a.id),
    activeAppointmentCount,
  };
}

export async function updateProfileAction(
  name: string,
): Promise<ActionResult> {
  const session = await getUserSessionFromCookie();
  if (!session) return actionError("لطفاً وارد شوید");

  const parsed = settingsSchema.safeParse({ name });
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "ورودی نامعتبر");
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { name: parsed.data.name },
  });

  const token = await createUserSessionToken({
    userId: session.userId,
    name: parsed.data.name,
    mobile: session.mobile,
  });
  await setUserSessionCookie(token);
  revalidatePath("/profile");
  return actionSuccess(undefined);
}

export async function changePasswordAction(input: unknown): Promise<ActionResult> {
  const session = await getUserSessionFromCookie();
  if (!session) return actionError("لطفاً وارد شوید");

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "ورودی نامعتبر");
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return actionError("کاربر یافت نشد");

  const valid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.passwordHash,
  );
  if (!valid) return actionError("رمز فعلی اشتباه است");

  await prisma.user.update({
    where: { id: session.userId },
    data: { passwordHash: await bcrypt.hash(parsed.data.newPassword, 10) },
  });
  return actionSuccess(undefined);
}

export async function createPurchaseAction(
  productId: string,
): Promise<ActionResult> {
  const session = await getUserSessionFromCookie();
  if (!session) return actionError("لطفاً وارد شوید");

  const product = await prisma.product.findFirst({
    where: { id: productId, deletedAt: null, isPublished: true },
  });
  if (!product) return actionError("پکیج یافت نشد");

  const existing = await prisma.purchase.findUnique({
    where: {
      userId_productId: { userId: session.userId, productId },
    },
  });
  if (existing) return actionError("شما قبلاً این پکیج را دارید");

  const pricePaid =
    product.discountPrice ?? product.price ?? null;

  await prisma.purchase.create({
    data: {
      userId: session.userId,
      productId,
      pricePaid: pricePaid === 0 ? null : pricePaid,
      status: "COMPLETED",
    },
  });

  revalidatePath("/profile");
  revalidatePath("/profile/purchases");
  return actionSuccess(undefined);
}

export async function createAppointmentAction(
  date: string,
  slot: TimeSlot,
): Promise<ActionResult> {
  const session = await getUserSessionFromCookie();
  if (!session) return actionError("لطفاً وارد شوید");

  const appointmentDate = new Date(date);
  const appointmentSlot = timeSlotToAppointmentSlot(slot);
  const active = await prisma.appointment.findFirst({
    where: {
      date: appointmentDate,
      slot: appointmentSlot,
      status: { in: ["CONFIRMED", "COMPLETED"] },
    },
  });
  if (active) return actionError("این زمان قبلاً رزرو شده است");

  const userActive = await prisma.appointment.findFirst({
    where: {
      userId: session.userId,
      date: appointmentDate,
      status: "CONFIRMED",
    },
  });
  if (userActive) {
    return actionError("شما در این روز نوبت فعال دارید");
  }

  await prisma.appointment.create({
    data: {
      userId: session.userId,
      date: appointmentDate,
      slot: appointmentSlot,
      status: "CONFIRMED",
    },
  });

  revalidatePath("/profile");
  revalidatePath("/profile/appointments");
  revalidatePath("/appointment");
  return actionSuccess(undefined);
}

export async function cancelAppointmentAction(
  id: string,
): Promise<ActionResult> {
  const session = await getUserSessionFromCookie();
  if (!session) return actionError("لطفاً وارد شوید");

  const appointment = await prisma.appointment.findFirst({
    where: { id, userId: session.userId },
  });
  if (!appointment) return actionError("نوبت یافت نشد");

  await prisma.appointment.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/profile");
  revalidatePath("/profile/appointments");
  revalidatePath("/appointment");
  return actionSuccess(undefined);
}
