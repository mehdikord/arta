"use client";

import {
  CheckCircle2,
  Files,
  PackageOpen,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/types";
import { ProductFileDownloadList } from "./product-file-download-list";

interface ProductAccessProps {
  product: Product;
}

/** Download section shown to purchasers on the product detail page. */
export function ProductAccess({ product }: ProductAccessProps) {
  const fileCount = product.files?.length ?? 0;

  return (
    <section
      id="product-download"
      className="relative scroll-mt-28 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-bl from-primary/10 via-card to-accent/10 shadow-sm"
    >
      <div className="pointer-events-none absolute -start-16 -top-20 size-52 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -end-16 size-52 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <PackageOpen className="size-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold sm:text-2xl">
                  دانلود فایل‌های پکیج
                </h2>
                <Badge className="gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  <CheckCircle2 className="size-3.5" />
                  خریداری‌شده
                </Badge>
              </div>
              <p className="mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
                فایل‌های «{product.title}» آماده دریافت است. هر فایل با لینک
                اختصاصی و زمان‌محدود فقط برای حساب شما در دسترس است.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-xl bg-primary/10 px-4 py-3 text-primary">
            <Files className="size-5" />
            <div>
              <p className="text-sm font-medium">
                {fileCount.toLocaleString("fa-IR")} فایل
              </p>
              <p className="text-xs opacity-80">قابل دانلود اختصاصی</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <ProductFileDownloadList product={product} showNote />
        </div>

        <div className="mt-6 grid gap-3 border-t border-primary/10 pt-5 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl bg-background/70 p-3 backdrop-blur-sm">
            <Files className="size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium">محتوای کامل پکیج</p>
              <p className="text-xs text-muted-foreground">
                همه فایل‌های ثبت‌شده توسط مدیریت، در همین‌جا
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-background/70 p-3 backdrop-blur-sm">
            <ShieldCheck className="size-5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-medium">دسترسی اختصاصی و امن</p>
              <p className="text-xs text-muted-foreground">
                لینک دانلود فقط برای حساب خریدار ساخته می‌شود
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
