"use client";

import { FileText, Play, Layers, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Product } from "@/types";

interface ProductAccessProps {
  product: Product;
}

export function ProductAccess({ product }: ProductAccessProps) {
  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-bl from-primary/5 to-accent/5">
      <CardContent className="p-6">
        <h3 className="mb-4 flex items-center gap-2 font-semibold text-primary">
          <Download className="size-5" />
          دسترسی به محتوا
        </h3>

        <div className="space-y-4">
          {(product.fileType === "pdf" || product.fileType === "mixed") && (
            <div className="flex items-center justify-between rounded-xl border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <FileText className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">فایل PDF</p>
                  <p className="text-xs text-muted-foreground">
                    دانلود و مطالعه آفلاین
                  </p>
                </div>
              </div>
              <Button asChild size="sm">
                <a
                  href={product.fileUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="size-4" />
                  دانلود
                </a>
              </Button>
            </div>
          )}

          {(product.fileType === "video" || product.fileType === "mixed") && (
            <div className="overflow-hidden rounded-xl border bg-card">
              <div className="relative aspect-video bg-gradient-to-bl from-foreground/80 to-foreground/60">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-primary-foreground">
                  <div className="flex size-16 items-center justify-center rounded-full bg-primary-foreground/20 backdrop-blur-sm">
                    <Play className="size-8 fill-current" />
                  </div>
                  <p className="text-sm font-medium">پلیر ویدیو (Mock)</p>
                  <p className="text-xs opacity-70">
                    پخش آنلاین — فاز Backend
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Play className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">ویدیوی آموزشی</p>
                    <p className="text-xs text-muted-foreground">
                      دسترسی آنلاین
                    </p>
                  </div>
                </div>
                <Button asChild size="sm" variant="outline">
                  <a href={product.fileUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-4" />
                    مشاهده
                  </a>
                </Button>
              </div>
            </div>
          )}

          {product.fileType === "mixed" && (
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              <Layers className="size-4 shrink-0" />
              این پکیج شامل فایل PDF و ویدیوی آموزشی است.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
