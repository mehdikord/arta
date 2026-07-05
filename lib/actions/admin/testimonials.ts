"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/admin/action-result";
import { testimonialSchema } from "@/lib/validations/admin/testimonial";

export async function getTestimonialsAction() {
  await requireAdmin();
  return prisma.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getTestimonialAction(id: string) {
  await requireAdmin();
  return prisma.testimonial.findUnique({ where: { id } });
}

export async function saveTestimonialAction(
  input: unknown,
  id?: string,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "ورودی نامعتبر");
  }

  if (id) {
    await prisma.testimonial.update({ where: { id }, data: parsed.data });
  } else {
    const created = await prisma.testimonial.create({ data: parsed.data });
    id = created.id;
  }

  revalidatePath("/");
  revalidatePath("/admins/testimonials");
  return actionSuccess({ id: id! });
}

export async function deleteTestimonialAction(
  id: string,
): Promise<ActionResult> {
  await requireAdmin();
  await prisma.testimonial.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admins/testimonials");
  return actionSuccess(undefined);
}
