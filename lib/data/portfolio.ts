import { prisma } from "@/lib/prisma";
import { mapPortfolioItem } from "./mappers";

export async function getPortfolioItems() {
  const rows = await prisma.portfolioItem.findMany({
    where: { isPublished: true, deletedAt: null },
    include: { category: true, gallery: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(mapPortfolioItem);
}

export async function getPortfolioItemBySlug(slug: string) {
  const row = await prisma.portfolioItem.findFirst({
    where: { slug, isPublished: true, deletedAt: null },
    include: {
      category: true,
      gallery: { orderBy: { sortOrder: "asc" } },
    },
  });
  return row ? mapPortfolioItem(row) : null;
}

export async function getPortfolioCategories() {
  const rows = await prisma.portfolioCategory.findMany({ orderBy: { name: "asc" } });
  return rows.map((c) => c.name);
}
