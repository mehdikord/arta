"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/admin/action-result";
import { portfolioCategorySchema } from "@/lib/validations/admin/portfolio-category";

export async function getPortfolioCategoriesAction() {
  await requireAdmin();
  return prisma.portfolioCategory.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { items: true } } },
  });
}

export async function savePortfolioCategoryAction(
  input: unknown,
  id?: string,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = portfolioCategorySchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "ورودی نامعتبر");
  }

  if (id) {
    await prisma.portfolioCategory.update({ where: { id }, data: parsed.data });
  } else {
    const created = await prisma.portfolioCategory.create({ data: parsed.data });
    id = created.id;
  }

  revalidatePath("/portfolio");
  revalidatePath("/admins/portfolio");
  return actionSuccess({ id: id! });
}

export async function deletePortfolioCategoryAction(
  id: string,
): Promise<ActionResult> {
  await requireAdmin();
  const count = await prisma.portfolioItem.count({
    where: { categoryId: id, deletedAt: null },
  });
  if (count > 0) {
    return actionError("این دسته دارای نمونه‌کار است");
  }
  await prisma.portfolioCategory.delete({ where: { id } });
  revalidatePath("/admins/portfolio/categories");
  return actionSuccess(undefined);
}
