"use client";

import {
  CheckCircle2,
  Download,
  HardDriveDownload,
  PackageOpen,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

interface ProductAccessProps {
  product: Product;
}

export function ProductAccess({ product }: ProductAccessProps) {
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
                  دانلود پکیج
                </h2>
                <Badge className="gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  <CheckCircle2 className="size-3.5" />
                  خریداری‌شده
                </Badge>
              </div>
              <p className="mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
                فایل اصلی «{product.title}» آماده دریافت است. این فایل فقط از
                مسیر امن حساب شما قابل دانلود خواهد بود.
              </p>
            </div>
          </div>

          <Button
            asChild
            size="lg"
            className="h-12 shrink-0 rounded-xl px-6 shadow-lg shadow-primary/20"
          >
            <a href={`/api/products/${product.id}/download`}>
              <Download className="size-5" />
              دانلود فایل پکیج
            </a>
          </Button>
        </div>

        <div className="mt-6 grid gap-3 border-t border-primary/10 pt-5 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl bg-background/70 p-3 backdrop-blur-sm">
            <HardDriveDownload className="size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium">یک فایل کامل و دانلودی</p>
              <p className="text-xs text-muted-foreground">
                همان فایل اصلی ثبت‌شده توسط مدیریت
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-background/70 p-3 backdrop-blur-sm">
            <ShieldCheck className="size-5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-medium">دسترسی اختصاصی و امن</p>
              <p className="text-xs text-muted-foreground">
                دانلود فقط برای حساب خریدار فعال است
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
