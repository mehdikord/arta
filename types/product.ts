/** Educational package / digital product */
export interface Product {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  image: string;
  fileType: "pdf" | "video" | "mixed";
  /** Mock download URL */
  fileUrl: string;
  /** null = free */
  price: number | null;
  discountPrice: number | null;
  isFeatured?: boolean;
  createdAt: string;
}
