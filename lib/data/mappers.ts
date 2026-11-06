import type {
  ServiceCategory as PrismaServiceCategory,
  ProductFileType,
  ProductFileKind as PrismaProductFileKind,
} from "@/lib/generated/prisma/client";
import type { Service, ServiceCategory } from "@/types/service";
import type { Product, ProductFileSummary } from "@/types/product";
import type { PortfolioItem } from "@/types/portfolio";
import type { BlogPost } from "@/types/blog";
import type { FAQ } from "@/types/faq";
import type { TeamMember } from "@/types/team";

const SERVICE_CATEGORY_TO_FRONT: Record<PrismaServiceCategory, ServiceCategory> = {
  INDIVIDUAL: "individual",
  COUPLE: "couple",
  ORGANIZATIONAL: "organizational",
  EDUCATIONAL: "educational",
};

const FILE_TYPE_TO_FRONT: Record<ProductFileType, Product["fileType"]> = {
  PDF: "pdf",
  VIDEO: "video",
  MIXED: "mixed",
};

const PRODUCT_FILE_KIND_TO_FRONT: Record<PrismaProductFileKind, ProductFileSummary["kind"]> = {
  TEXT: "text",
  VIDEO: "video",
  AUDIO: "audio",
  ARCHIVE: "archive",
};

export function mapProductFile(f: {
  id: string;
  displayName: string;
  kind: PrismaProductFileKind;
  sortOrder: number;
}): ProductFileSummary {
  return {
    id: f.id,
    displayName: f.displayName,
    kind: PRODUCT_FILE_KIND_TO_FRONT[f.kind],
    sortOrder: f.sortOrder,
  };
}

export function mapService(s: {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: PrismaServiceCategory;
  icon: string;
  image: string | null;
}): Service {
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    shortDescription: s.shortDescription,
    fullDescription: s.fullDescription,
    category: SERVICE_CATEGORY_TO_FRONT[s.category],
    icon: s.icon,
    image: s.image ?? undefined,
  };
}

export function mapProduct(p: {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  image: string;
  fileType: ProductFileType;
  price: number | null;
  discountPrice: number | null;
  isFeatured: boolean;
  createdAt: Date;
  category: { name: string };
  files?: {
    id: string;
    displayName: string;
    kind: PrismaProductFileKind;
    sortOrder: number;
  }[];
}): Product {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    shortDescription: p.shortDescription,
    fullDescription: p.fullDescription,
    category: p.category.name,
    image: p.image,
    fileType: FILE_TYPE_TO_FRONT[p.fileType],
    price: p.price,
    discountPrice: p.discountPrice,
    isFeatured: p.isFeatured,
    createdAt: p.createdAt.toISOString().slice(0, 10),
    files: p.files?.map(mapProductFile),
  };
}

export function mapPortfolioItem(p: {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  image: string;
  year: number | null;
  client: string | null;
  category: { name: string };
  gallery?: { url: string }[];
}): PortfolioItem {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    shortDescription: p.shortDescription,
    fullDescription: p.fullDescription,
    image: p.image,
    category: p.category.name,
    year: p.year ?? undefined,
    client: p.client ?? undefined,
    gallery: p.gallery?.map((g) => g.url),
  };
}

export function mapBlogPost(p: {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  readTime: number;
  publishedAt: Date;
  category: { name: string };
}): BlogPost {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    category: p.category.name,
    image: p.image,
    author: p.author,
    readTime: p.readTime,
    publishedAt: p.publishedAt.toISOString().slice(0, 10),
  };
}

export function mapFaq(f: {
  id: string;
  question: string;
  answer: string;
  category: string;
}): FAQ {
  return {
    id: f.id,
    question: f.question,
    answer: f.answer,
    category: f.category,
  };
}

export function mapTeamMember(m: {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  isManagement: boolean;
}): TeamMember {
  return {
    id: m.id,
    name: m.name,
    role: m.role,
    bio: m.bio,
    image: m.image,
    isManagement: m.isManagement,
  };
}
