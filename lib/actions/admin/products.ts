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
  productFileLocationExists,
} from "@/lib/product-files";

export async function getProductsAction() {
  await requireAdmin();
  return prisma.product.findMany({
    where: { deletedAt: null },
    include: {
      category: true,
      _count: { select: { chapters: true, files: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductAction(id: string) {
  await requireAdmin();
  return prisma.product.findFirst({
    where: { id, deletedAt: null },
    include: {
      chapters: { orderBy: { sortOrder: "asc" } },
      files: { orderBy: { sortOrder: "asc" } },
      category: true,
    },
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

  const { chapters, files, ...data } = parsed.data;
  const sortedFiles = [...files].sort((a, b) => a.sortOrder - b.sortOrder);

  // Every file referenced by the form must exist on disk before saving.
  for (const file of sortedFiles) {
    if (!(await productFileLocationExists(file.storageKey))) {
      return actionError(
        `فایل «${file.displayName}» یافت نشد؛ لطفاً دوباره آپلود کنید`,
      );
    }
  }

  let previousSlug: string | undefined;
  let removedStorageKeys: string[] = [];

  if (id) {
    const currentProduct = await prisma.product.findFirst({
      where: { id, deletedAt: null },
      select: { fileUrl: true, slug: true, files: { select: { id: true, storageKey: true } } },
    });
    if (!currentProduct) {
      return actionError("پکیج یافت نشد");
    }
    previousSlug = currentProduct.slug;
    removedStorageKeys = currentProduct.files
      .filter(
        (old) =>
          !sortedFiles.some((next) => next.storageKey === old.storageKey),
      )
      .map((old) => old.storageKey);

    await prisma.$transaction([
      prisma.product.update({
        where: { id },
        data: { ...data, fileUrl: sortedFiles[0].storageKey },
      }),
      prisma.productChapter.deleteMany({ where: { productId: id } }),
      prisma.productChapter.createMany({
        data: chapters.map((c) => ({ ...c, productId: id! })),
      }),
      prisma.productFile.deleteMany({ where: { productId: id } }),
      prisma.productFile.createMany({
        data: sortedFiles.map((f) => ({ ...f, productId: id! })),
      }),
    ]);
  } else {
    const created = await prisma.product.create({
      data: {
        ...data,
        fileUrl: sortedFiles[0].storageKey,
        chapters: {
          create: chapters.map((c) => ({ title: c.title, sortOrder: c.sortOrder })),
        },
        files: {
          create: sortedFiles.map((f) => ({
            displayName: f.displayName,
            storageKey: f.storageKey,
            kind: f.kind,
            sortOrder: f.sortOrder,
          })),
        },
      },
    });
    id = created.id;
  }

  // Clean up files that are no longer referenced by this product.
  // A storage key is only deleted when no other product file row still
  // points to it (legacy public files may be shared across products).
  for (const storageKey of removedStorageKeys) {
    const otherReferences = await prisma.productFile.count({
      where: { storageKey },
    });
    if (otherReferences === 0) {
      const deleteFile = isValidProductStorageKey(storageKey)
        ? deleteProductFile(storageKey)
        : deleteLegacyPublicProductFile(storageKey);
      await deleteFile.catch((error) => {
        console.error("Failed to delete replaced product file", error);
      });
    }
  }

  revalidatePath("/products");
  revalidatePath(`/products/${data.slug}`);
  if (previousSlug && previousSlug !== data.slug) {
    revalidatePath(`/products/${previousSlug}`);
  }
  revalidatePath("/admins/products");
  revalidatePath("/profile/purchases");
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
