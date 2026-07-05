"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/admin/action-result";
import { productSchema } from "@/lib/validations/admin/product";

export async function getProductsAction() {
  await requireAdmin();
  return prisma.product.findMany({
    where: { deletedAt: null },
    include: { category: true, _count: { select: { chapters: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductAction(id: string) {
  await requireAdmin();
  return prisma.product.findFirst({
    where: { id, deletedAt: null },
    include: { chapters: { orderBy: { sortOrder: "asc" } }, category: true },
  });
}

export async function saveProductAction(
  input: unknown,
  id?: string,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "ورودی نامعتبر");
  }

  const { chapters, ...data } = parsed.data;

  if (id) {
    await prisma.$transaction([
      prisma.product.update({ where: { id }, data }),
      prisma.productChapter.deleteMany({ where: { productId: id } }),
      prisma.productChapter.createMany({
        data: chapters.map((c) => ({ ...c, productId: id! })),
      }),
    ]);
  } else {
    const created = await prisma.product.create({
      data: {
        ...data,
        chapters: { create: chapters },
      },
    });
    id = created.id;
  }

  revalidatePath("/products");
  revalidatePath("/admins/products");
  return actionSuccess({ id: id! });
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.product.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/products");
  revalidatePath("/admins/products");
  return actionSuccess(undefined);
}
