import { prisma } from "@/lib/prisma";
import { mapFaq } from "./mappers";

export async function getFaqs() {
  const rows = await prisma.faq.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(mapFaq);
}

export async function getFaqsByCategory(category: string) {
  const rows = await prisma.faq.findMany({
    where: { category, isPublished: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(mapFaq);
}

export async function getFaqCategories() {
  const rows = await prisma.faq.findMany({
    where: { isPublished: true },
    select: { category: true },
    distinct: ["category"],
  });
  return rows.map((r) => r.category);
}
