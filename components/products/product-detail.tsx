"use client";

import Link from "next/link";
import { ArrowRight, FileText, Play, Layers, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PriceDisplay } from "@/components/shared/price-display";
import { SectionContainer } from "@/components/shared/section-container";
import { CtaBanner } from "@/components/shared/cta-banner";
import { ProductImage } from "./product-image";
import { ProductBadges } from "./product-badges";
import { ProductContentList } from "./product-content-list";
import { PurchaseButton, ProductAccessButton } from "./purchase-button";
import { ProductAccess } from "./product-access";
import { useAuth } from "@/hooks/use-auth";
import { isPurchased, FILE_TYPE_LABELS } from "@/lib/product";
import type { Product } from "@/types";

const fileTypeIcons = {
  pdf: FileText,
  video: Play,
  mixed: Layers,
};

interface ProductDetailProps {
  product: Product;
  chapters?: { title: string; sortOrder: number }[];
}

export function ProductDetail({ product, chapters = [] }: ProductDetailProps) {
  const { user } = useAuth();
  const purchased = isPurchased(user, product.id);
  const syllabus = chapters.map((c) => c.title);
  const FileIcon = fileTypeIcons[product.fileType];

  return (
    <>
      <section className="relative border-b">
        <div className="relative aspect-[21/9] max-h-[420px] w-full overflow-hidden">
          <ProductImage
            src={product.image}
            alt={product.title}
            category={product.category}
            className="absolute inset-0"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
            <Breadcrumb
              items={[
                { label: "پکیج‌ها", href: "/products" },
                { label: product.title },
              ]}
              className="mb-4 text-primary-foreground/80 [&_a]:text-primary-foreground/80 [&_a:hover]:text-primary-foreground [&_span]:text-primary-foreground"
            />
            <ProductBadges product={product} className="mb-3" />
            <h1 className="max-w-3xl text-2xl font-bold text-primary-foreground md:text-4xl">
              {product.title}
            </h1>
            <p className="mt-2 max-w-2xl text-primary-foreground/80">
              {product.shortDescription}
            </p>
          </div>
        </div>
      </section>

      <SectionContainer>
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <BookOpen className="size-5 text-primary" />
                درباره این پکیج
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {product.fullDescription}
              </p>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-semibold">فهرست محتوا</h2>
              <ProductContentList chapters={syllabus} />
            </div>

            {purchased && <ProductAccess product={product} />}
          </div>

          <aside className="space-y-6">
            <div className="sticky top-24 rounded-2xl border bg-card p-6 shadow-lg">
              <div className="mb-4">
                <PriceDisplay
                  price={product.price}
                  discountPrice={product.discountPrice}
                  size="lg"
                />
              </div>

              <Separator className="my-4" />

              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">دسته‌بندی</dt>
                  <dd className="font-medium">{product.category}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">نوع فایل</dt>
                  <dd className="flex items-center gap-1.5 font-medium">
                    <FileIcon className="size-4 text-primary" />
                    {FILE_TYPE_LABELS[product.fileType]}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">تعداد فصل</dt>
                  <dd className="font-medium">{syllabus.length} فصل</dd>
                </div>
              </dl>

              <div className="mt-6 space-y-3">
                {purchased ? (
                  <>
                    <Badge className="w-full justify-center py-1.5 bg-primary/10 text-primary">
                      ✓ در کتابخانه شما
                    </Badge>
                    <ProductAccessButton product={product} size="lg" className="w-full" />
                  </>
                ) : (
                  <PurchaseButton product={product} className="w-full" />
                )}
              </div>
            </div>

            <Button asChild variant="outline" className="w-full">
              <Link href="/products">
                <ArrowRight className="size-4" />
                بازگشت به لیست
              </Link>
            </Button>
          </aside>
        </div>
      </SectionContainer>

      <SectionContainer>
        <CtaBanner
          title="سوالی درباره پکیج‌ها دارید؟"
          description="تیم پشتیبانی ما آماده راهنمایی شماست."
          primaryLabel="تماس با ما"
          primaryHref="/contact"
          secondaryLabel="سوالات متداول"
          secondaryHref="/faq"
        />
      </SectionContainer>
    </>
  );
}
