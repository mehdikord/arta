import { prisma } from "@/lib/prisma";
import { mapProduct } from "./mappers";

const PRODUCT_FILE_SELECT = {
  id: true,
  displayName: true,
  kind: true,
  sortOrder: true,
} as const;

function decodeSlug(slug: string) {
  try {
    return decodeURIComponent(slug).normalize("NFC");
  } catch {
    return slug.normalize("NFC");
  }
}

export async function getProducts() {
  const rows = await prisma.product.findMany({
    where: { isPublished: true, deletedAt: null },
    include: {
      category: true,
      files: { orderBy: { sortOrder: "asc" }, select: PRODUCT_FILE_SELECT },
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapProduct);
}

export async function getProductBySlug(slug: string) {
  const decodedSlug = decodeSlug(slug);
  const row = await prisma.product.findFirst({
    where: { slug: decodedSlug, isPublished: true, deletedAt: null },
    include: {
      category: true,
      chapters: { orderBy: { sortOrder: "asc" } },
      files: { orderBy: { sortOrder: "asc" }, select: PRODUCT_FILE_SELECT },
    },
  });
  if (!row) return null;
  return {
    ...mapProduct(row),
    chapters: row.chapters.map((c) => ({ title: c.title, sortOrder: c.sortOrder })),
  };
}

export async function getFeaturedProducts() {
  const rows = await prisma.product.findMany({
    where: { isFeatured: true, isPublished: true, deletedAt: null },
    include: { category: true },
    take: 6,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapProduct);
}

export async function getProductCategories() {
  const rows = await prisma.productCategory.findMany({ orderBy: { name: "asc" } });
  return rows.map((c) => c.name);
}
