import { prisma } from "@/lib/prisma";
import { mapBlogPost } from "./mappers";

export async function getBlogPosts() {
  const rows = await prisma.blogPost.findMany({
    where: { isPublished: true, deletedAt: null },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
  });
  return rows.map(mapBlogPost);
}

export async function getBlogPostBySlug(slug: string) {
  const row = await prisma.blogPost.findFirst({
    where: { slug, isPublished: true, deletedAt: null },
    include: { category: true },
  });
  return row ? mapBlogPost(row) : null;
}

export async function getRecentBlogPosts(limit = 3) {
  const rows = await prisma.blogPost.findMany({
    where: { isPublished: true, deletedAt: null },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  return rows.map(mapBlogPost);
}

export async function getBlogCategories() {
  const rows = await prisma.blogCategory.findMany({ orderBy: { name: "asc" } });
  return rows.map((c) => c.name);
}
