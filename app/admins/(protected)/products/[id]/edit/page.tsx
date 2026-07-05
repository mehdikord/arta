import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/shared/page-header";
import { ProductForm } from "@/components/admin/products/product-form";
import { getProductAction } from "@/lib/actions/admin/products";
import { getProductCategoriesAction } from "@/lib/actions/admin/product-categories";

export const metadata = { title: "ویرایش پکیج" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductAction(id),
    getProductCategoriesAction(),
  ]);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="ویرایش پکیج" description={product.title} />
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <ProductForm product={product} categories={categories} />
      </div>
    </div>
  );
}
