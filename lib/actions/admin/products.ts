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
import {
  deleteLegacyPublicProductFile,
  deleteProductFile,
  isValidProductStorageKey,
  productFileExists,
} from "@/lib/product-files";

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
  if (!(await productFileExists(data.fileUrl))) {
    return actionError("فایل اصلی پکیج یافت نشد؛ لطفاً دوباره آپلود کنید");
  }

  let previousSlug: string | undefined;
  if (id) {
    const currentProduct = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      select: { fileUrl: true, slug: true },
    });
    if (!currentProduct) {
      return actionError("پکیج یافت نشد");
    }
    previousSlug = currentProduct.slug;

    await prisma.$transaction([
      prisma.product.update({ where: { id }, data }),
      prisma.productChapter.deleteMany({ where: { productId: id } }),
      prisma.productChapter.createMany({
        data: chapters.map((c) => ({ ...c, productId: id! })),
      }),
    ]);
    if (currentProduct.fileUrl !== data.fileUrl) {
      const deletePreviousFile = isValidProductStorageKey(currentProduct.fileUrl)
        ? deleteProductFile(currentProduct.fileUrl)
        : deleteLegacyPublicProductFile(currentProduct.fileUrl);
      await deletePreviousFile.catch((error) => {
        console.error("Failed to delete replaced product file", error);
      });
    }
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
  revalidatePath(`/products/${data.slug}`);
  if (previousSlug && previousSlug !== data.slug) {
    revalidatePath(`/products/${previousSlug}`);
  }
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
