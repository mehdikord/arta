import Link from "next/link";
import { ArrowLeft, ExternalLink, Package, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/shared/category-badge";
import { ProductImage } from "@/components/products/product-image";
import { ProductFileDownloadList } from "@/components/products/product-file-download-list";
import { isFree } from "@/lib/product";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

function FileTypeChip({ type }: { type: Product["fileType"] }) {
  const config = {
    pdf: { label: "فایل PDF", color: "bg-destructive/10 text-destructive" },
    video: { label: "ویدیوی آموزشی", color: "bg-primary/10 text-primary" },
    mixed: { label: "PDF + ویدیو", color: "bg-accent/15 text-accent" },
  } as const;

  const { label, color } = config[type];

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium", color)}>
      <Sparkles className="size-3.5" />
      {label}
    </span>
  );
}

interface PurchaseCardProps {
  product: Product;
}

export function PurchaseCard({ product }: PurchaseCardProps) {
  const free = isFree(product);

  return (
    <article className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/5">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-l from-accent via-primary to-secondary" />

      <div className="flex flex-col gap-0 sm:flex-row sm:items-stretch">
        <div className="relative shrink-0 p-4 pb-0 sm:w-52 sm:p-5 sm:pe-0">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-md ring-1 ring-border/50">
            <ProductImage
              src={product.image}
              alt={product.title}
              category={product.category}
              className="absolute inset-0"
              sizes="(max-width: 640px) 100vw, 208px"
            />
            {free && (
              <span className="absolute top-2.5 start-2.5 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold text-primary-foreground shadow-sm">
                رایگان
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between gap-4 p-5 sm:py-6 sm:ps-2">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <CategoryBadge label={product.category} variant="outline" />
              <FileTypeChip type={product.fileType} />
            </div>

            <div>
              <h3 className="text-lg font-bold leading-snug transition-colors group-hover:text-primary">
                {product.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {product.shortDescription}
              </p>
            </div>

            {(product.files?.length ?? 0) > 0 && (
              <ProductFileDownloadList product={product} compact />
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-dashed pt-4">
            <Button asChild size="sm" variant="outline" className="shadow-sm">
              <Link href={`/products/${product.slug}`}>
                <ExternalLink className="size-4" />
                جزئیات پکیج
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

interface PurchasesListProps {
  products: Product[];
}

export function PurchasesList({ products }: PurchasesListProps) {
  if (products.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-dashed bg-gradient-to-bl from-muted/50 via-background to-primary/5 p-12 text-center">
        <div className="absolute -end-8 -top-8 size-32 rounded-full bg-accent/10 blur-2xl" />
        <div className="absolute -bottom-8 -start-8 size-32 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-muted">
            <Package className="size-8 text-muted-foreground/60" />
          </div>
          <p className="text-lg font-semibold">هنوز پکیجی ندارید</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            پکیج‌های آموزشی رایگان و پولی را کشف کنید و یادگیری را شروع کنید
          </p>
          <Button asChild className="mt-8 shadow-md" size="lg">
            <Link href="/products">
              مشاهده پکیج‌ها
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      {products.map((product) => (
        <PurchaseCard key={product.id} product={product} />
      ))}
    </div>
  );
}
