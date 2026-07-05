import type { Product } from "@/types";
import type { SessionUser } from "@/types/session-user";

/** Product is free when price is null or 0 */
export function isFree(product: Product): boolean {
  return product.price === null || product.price === 0;
}

/** Final price customer pays */
export function getFinalPrice(product: Product): number {
  if (isFree(product)) return 0;
  if (
    product.discountPrice != null &&
    product.discountPrice < (product.price ?? 0)
  ) {
    return product.discountPrice;
  }
  return product.price ?? 0;
}

/** Product has active discount */
export function hasDiscount(product: Product): boolean {
  return (
    !isFree(product) &&
    product.discountPrice != null &&
    product.discountPrice < (product.price ?? 0)
  );
}

/** Check if user already owns the product */
export function isPurchased(
  user: SessionUser | null | undefined,
  productId: string,
): boolean {
  return user?.purchases.includes(productId) ?? false;
}

/** Discount percentage for badge display */
export function getDiscountPercent(product: Product): number | null {
  if (!hasDiscount(product) || product.price == null) return null;
  return Math.round(
    ((product.price - (product.discountPrice ?? 0)) / product.price) * 100,
  );
}

/** Mock bestseller score */
const bestsellerScores: Record<string, number> = {
  "prd-3": 95,
  "prd-6": 90,
  "prd-1": 88,
  "prd-8": 85,
  "prd-4": 80,
  "prd-5": 70,
  "prd-7": 65,
  "prd-2": 60,
};

export function getBestsellerScore(productId: string): number {
  return bestsellerScores[productId] ?? 50;
}

/** Products created after April 2025 are "new" */
export function isNewProduct(product: Product): boolean {
  return new Date(product.createdAt) >= new Date("2025-04-01");
}

export type ProductSortOption = "newest" | "cheapest" | "bestseller";

export function sortProducts(
  items: Product[],
  sort: ProductSortOption,
): Product[] {
  const sorted = [...items];
  switch (sort) {
    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case "cheapest":
      return sorted.sort((a, b) => getFinalPrice(a) - getFinalPrice(b));
    case "bestseller":
      return sorted.sort(
        (a, b) => getBestsellerScore(b.id) - getBestsellerScore(a.id),
      );
    default:
      return sorted;
  }
}

const categoryGradients: Record<string, string> = {
  "مدیریت استرس": "from-primary/80 via-primary/50 to-accent/30",
  "ذهن‌آگاهی": "from-accent/70 via-accent/40 to-secondary/50",
  "رشد فردی": "from-primary/60 via-accent/50 to-primary/30",
  خانواده: "from-secondary/80 via-accent/30 to-primary/20",
  "سلامت روان": "from-accent/60 via-primary/40 to-secondary/40",
};

export function getProductGradient(category: string): string {
  return categoryGradients[category] ?? "from-primary/60 to-accent/40";
}

export const PRODUCT_BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjOWI4RUM0Ii8+PC9zdmc+";

export const FILE_TYPE_LABELS: Record<Product["fileType"], string> = {
  pdf: "فایل PDF",
  video: "ویدیوی آموزشی",
  mixed: "ترکیبی (PDF + ویدیو)",
};
