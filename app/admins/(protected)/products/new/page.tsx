import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/shared/page-header";
import { ProductForm } from "@/components/admin/products/product-form";
import { getProductCategoriesAction } from "@/lib/actions/admin/product-categories";
import { getProductFileMaxSize } from "@/lib/product-files";

export const metadata = { title: "پکیج جدید" };

export default async function NewProductPage() {
  const [categories, maxUploadSize] = await Promise.all([
    getProductCategoriesAction(),
    getProductFileMaxSize(),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="پکیج جدید"
        description="اطلاعات، سرفصل‌ها و فایل‌های پکیج آموزشی را وارد کنید"
        actions={
          <Button variant="outline" asChild>
            <Link href="/admins/products">
              <ArrowRight className="size-4" />
              بازگشت به پکیج‌ها
            </Link>
          </Button>
        }
      />
      <ProductForm categories={categories} maxUploadSize={maxUploadSize} />
    </div>
  );
}
