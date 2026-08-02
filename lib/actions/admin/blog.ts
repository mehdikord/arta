"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/admin/action-result";
import { blogPostSchema } from "@/lib/validations/admin/blog";
import { sanitizeBlogContent } from "@/lib/blog-content";

export async function getBlogPostsAction() {
  await requireAdmin();
  return prisma.blogPost.findMany({
    where: { deletedAt: null },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getBlogPostAction(id: string) {
  await requireAdmin();
  return prisma.blogPost.findFirst({
    where: { id, deletedAt: null },
    include: { category: true },
  });
}

export async function saveBlogPostAction(
  input: unknown,
  id?: string,
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const parsed = blogPostSchema.safeParse(input);
  if (!parsed.success) {
    return actionError(parsed.error.issues[0]?.message ?? "ورودی نامعتبر");
  }

  const data = {
    ...parsed.data,
    content: sanitizeBlogContent(parsed.data.content),
    publishedAt: new Date(parsed.data.publishedAt),
  };

  if (id) {
    await prisma.blogPost.update({ where: { id }, data });
  } else {
    const created = await prisma.blogPost.create({ data });
    id = created.id;
  }

  revalidatePath("/blog");
  revalidatePath("/admins/blog");
  return actionSuccess({ id: id! });
}

export async function deleteBlogPostAction(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.blogPost.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/blog");
  revalidatePath("/admins/blog");
  return actionSuccess(undefined);
}
