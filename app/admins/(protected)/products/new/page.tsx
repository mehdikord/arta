import { PageHeader } from "@/components/admin/shared/page-header";
import { ProductForm } from "@/components/admin/products/product-form";
import { getProductCategoriesAction } from "@/lib/actions/admin/product-categories";

export const metadata = { title: "پکیج جدید" };

export default async function NewProductPage() {
  const categories = await getProductCategoriesAction();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="پکیج جدید" description="ایجاد پکیج آموزشی جدید" />
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
