"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/admin/action-result";
import { productCategorySchema } from "@/lib/validations/admin/product-category";

export async function getProductCategoriesAction() {
  await requireAdmin();
  return prisma.productCategory.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

export async function saveProductCategoryAction(
  input: unknown,
  id?: string,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = productCategorySchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "ورودی نامعتبر");
  }

  if (id) {
    await prisma.productCategory.update({ where: { id }, data: parsed.data });
  } else {
    const created = await prisma.productCategory.create({ data: parsed.data });
    id = created.id;
  }

  revalidatePath("/products");
  revalidatePath("/admins/products");
  return actionSuccess({ id: id! });
}

export async function deleteProductCategoryAction(
  id: string,
): Promise<ActionResult> {
  await requireAdmin();
  const count = await prisma.product.count({
    where: { categoryId: id, deletedAt: null },
  });
  if (count > 0) {
    return actionError("این دسته دارای پکیج است و قابل حذف نیست");
  }
  await prisma.productCategory.delete({ where: { id } });
  revalidatePath("/admins/products/categories");
  return actionSuccess(undefined);
}
