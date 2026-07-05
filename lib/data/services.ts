import { prisma } from "@/lib/prisma";
import { mapService } from "./mappers";

export async function getServices() {
  const rows = await prisma.service.findMany({
    where: { isPublished: true, deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return rows.map(mapService);
}

export async function getServiceBySlug(slug: string) {
  const row = await prisma.service.findFirst({
    where: { slug, isPublished: true, deletedAt: null },
  });
  return row ? mapService(row) : null;
}
