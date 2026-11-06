/** Per-file content type, auto-detected on upload. */
export type ProductFileKind = "text" | "video" | "audio" | "archive";

/** Downloadable file attached to a product (course). */
export interface ProductFileSummary {
  id: string;
  displayName: string;
  kind: ProductFileKind;
  sortOrder: number;
}

/** Educational package / digital product */
export interface Product {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  image: string;
  /** Product-level delivery format badge (kept for backward compatibility). */
  fileType: "pdf" | "video" | "mixed";
  /** null = free */
  price: number | null;
  discountPrice: number | null;
  isFeatured?: boolean;
  createdAt: string;
  /** Downloadable content files (order = sortOrder). */
  files?: ProductFileSummary[];
}
