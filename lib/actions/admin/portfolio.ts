"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/admin/action-result";
import { portfolioSchema } from "@/lib/validations/admin/portfolio";

export async function getPortfolioItemsAction() {
  await requireAdmin();
  return prisma.portfolioItem.findMany({
    where: { deletedAt: null },
    include: { category: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function getPortfolioItemAction(id: string) {
  await requireAdmin();
  return prisma.portfolioItem.findFirst({
    where: { id, deletedAt: null },
    include: {
      category: true,
      gallery: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function savePortfolioItemAction(
  input: unknown,
  id?: string,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = portfolioSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "ورودی نامعتبر");
  }

  const { gallery, ...data } = parsed.data;

  if (id) {
    await prisma.$transaction([
      prisma.portfolioItem.update({ where: { id }, data }),
      prisma.portfolioImage.deleteMany({ where: { portfolioItemId: id } }),
      ...(gallery.length
        ? [
            prisma.portfolioImage.createMany({
              data: gallery.map((g) => ({ ...g, portfolioItemId: id! })),
            }),
          ]
        : []),
    ]);
  } else {
    const created = await prisma.portfolioItem.create({
      data: {
        ...data,
        gallery: gallery.length ? { create: gallery } : undefined,
      },
    });
    id = created.id;
  }

  revalidatePath("/portfolio");
  revalidatePath("/admins/portfolio");
  return actionSuccess({ id: id! });
}

export async function deletePortfolioItemAction(
  id: string,
): Promise<ActionResult> {
  await requireAdmin();
  await prisma.portfolioItem.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/portfolio");
  revalidatePath("/admins/portfolio");
  return actionSuccess(undefined);
}
