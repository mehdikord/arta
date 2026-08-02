import { prisma } from "@/lib/prisma";

export type SiteConfig = Awaited<ReturnType<typeof getSiteConfig>>;

export async function getSiteStats() {
  return prisma.siteStat.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getTestimonials() {
  return prisma.testimonial.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getSiteConfig() {
  const rows = await prisma.siteSetting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return {
    name: map.name ?? "آکادمی رشد و توانمندسازی آرتا",
    shortName: map.shortName ?? "آرتا",
    tagline: map.tagline ?? "مسیر رشد، از آگاهی تا توانمندی",
    description:
      map.description ??
      "آکادمی توانمندسازی آرتا با ارائه خدمات مشاوره، کوچینگ و آموزش، همراه شما در مسیر رشد فردی و سازمانی است.",
    phone: map.phone ?? "۰۱۷۳۲۲۳۷۷۲۴",
    email: map.email ?? "info@arta-academy.ir",
    address:
      map.address ??
      "تهران، خیابان ولیعصر، بالاتر از پارک ساعی، پلاک ۱۲۳۴، واحد ۵",
    workingHours: map.workingHours ?? "شنبه تا چهارشنبه، ۸:۰۰ تا ۱۴:۰۰",
    social: {
      instagram: map.instagram ?? "",
      telegram: map.telegram ?? "",
      linkedin: map.linkedin ?? "",
      whatsapp: map.whatsapp ?? "",
    },
  };
}
