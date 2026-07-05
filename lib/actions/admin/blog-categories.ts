"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/admin/action-result";
import { blogCategorySchema } from "@/lib/validations/admin/blog-category";

export async function getBlogCategoriesAction() {
  await requireAdmin();
  return prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });
}

export async function saveBlogCategoryAction(
  input: unknown,
  id?: string,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = blogCategorySchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "ورودی نامعتبر");
  }

  if (id) {
    await prisma.blogCategory.update({ where: { id }, data: parsed.data });
  } else {
    const created = await prisma.blogCategory.create({ data: parsed.data });
    id = created.id;
  }

  revalidatePath("/blog");
  revalidatePath("/admins/blog");
  return actionSuccess({ id: id! });
}

export async function deleteBlogCategoryAction(
  id: string,
): Promise<ActionResult> {
  await requireAdmin();
  const count = await prisma.blogPost.count({
    where: { categoryId: id, deletedAt: null },
  });
  if (count > 0) {
    return actionError("این دسته دارای مقاله است");
  }
  await prisma.blogCategory.delete({ where: { id } });
  revalidatePath("/admins/blog/categories");
  return actionSuccess(undefined);
}
