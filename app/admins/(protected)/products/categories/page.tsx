import { ProductCategoriesPageClient } from "@/components/admin/products/product-categories-page-client";
import { getProductCategoriesAction } from "@/lib/actions/admin/product-categories";

export const metadata = { title: "دسته‌بندی پکیج‌ها" };

export default async function ProductCategoriesPage() {
  const categories = await getProductCategoriesAction();
  return <ProductCategoriesPageClient categories={categories} />;
}
