import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/shared/page-header";
import { ProductForm } from "@/components/admin/products/product-form";
import { getProductAction } from "@/lib/actions/admin/products";
import { getProductCategoriesAction } from "@/lib/actions/admin/product-categories";
import { getProductFileMaxSize } from "@/lib/product-files";

export const metadata = { title: "ویرایش پکیج" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, maxUploadSize] = await Promise.all([
    getProductAction(id),
    getProductCategoriesAction(),
    getProductFileMaxSize(),
  ]);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="ویرایش پکیج"
        description={product.title}
        actions={
          <>
            {product.isPublished && (
              <Button variant="ghost" asChild>
                <Link href={`/products/${product.slug}`} target="_blank">
                  <ExternalLink className="size-4" />
                  مشاهده در سایت
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href="/admins/products">
                <ArrowRight className="size-4" />
                بازگشت به پکیج‌ها
              </Link>
            </Button>
          </>
        }
      />
      <ProductForm
        product={product}
        categories={categories}
        maxUploadSize={maxUploadSize}
      />
    </div>
  );
}
