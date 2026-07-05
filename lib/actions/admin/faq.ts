"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/admin/action-result";
import { faqSchema } from "@/lib/validations/admin/faq";

export async function getFaqsAction() {
  await requireAdmin();
  return prisma.faq.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getFaqAction(id: string) {
  await requireAdmin();
  return prisma.faq.findUnique({ where: { id } });
}

export async function saveFaqAction(
  input: unknown,
  id?: string,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = faqSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "ورودی نامعتبر");
  }

  if (id) {
    await prisma.faq.update({ where: { id }, data: parsed.data });
  } else {
    const created = await prisma.faq.create({ data: parsed.data });
    id = created.id;
  }

  revalidatePath("/faq");
  revalidatePath("/admins/faq");
  return actionSuccess({ id: id! });
}

export async function deleteFaqAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.faq.delete({ where: { id } });
  revalidatePath("/faq");
  revalidatePath("/admins/faq");
  return actionSuccess(undefined);
}
