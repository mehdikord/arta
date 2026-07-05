import { ProductsPageClient } from "@/components/admin/products/products-page-client";
import { getProductsAction } from "@/lib/actions/admin/products";

export const metadata = { title: "پکیج‌ها" };

export default async function AdminProductsPage() {
  const products = await getProductsAction();
  return <ProductsPageClient products={products} />;
}
