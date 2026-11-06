"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Archive,
  Download,
  FileText,
  Loader2,
  Music,
  Play,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProductFileDownloadLinkAction } from "@/lib/actions/products";
import { PRODUCT_FILE_KIND_LABELS } from "@/lib/product";
import { cn } from "@/lib/utils";
import type { Product, ProductFileSummary } from "@/types";

const KIND_ICONS = {
  text: FileText,
  video: Play,
  audio: Music,
  archive: Archive,
} as const;

interface ProductFileDownloadListProps {
  product: Product;
  /** Smaller rows for card layouts (user panel). */
  compact?: boolean;
  /** Show the expiry/security footnote under the list. */
  showNote?: boolean;
}

/**
 * Purchaser-only file list with time-limited, user-specific download
 * links. Each click requests a fresh signed link (valid for the
 * configured TTL, default 4 hours) bound to the logged-in user.
 */
export function ProductFileDownloadList({
  product,
  compact = false,
  showNote = false,
}: ProductFileDownloadListProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const files = product.files ?? [];

  async function handleDownload(file: ProductFileSummary) {
    setDownloadingId(file.id);
    const result = await getProductFileDownloadLinkAction(product.id, file.id);
    setDownloadingId(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    // Trigger the download through a programmatic anchor click; the
    // signed, time-limited link is served with Content-Disposition.
    const anchor = document.createElement("a");
    anchor.href = result.data.url;
    anchor.setAttribute("aria-hidden", "true");
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  return (
    <div className={cn("space-y-2", compact ? "space-y-1.5" : "space-y-2.5")}>
      {files.map((file) => {
        const Icon = KIND_ICONS[file.kind];
        const downloading = downloadingId === file.id;
        return (
          <div
            key={file.id}
            className={cn(
              "flex items-center justify-between gap-3 rounded-xl border bg-background/70 p-3 backdrop-blur-sm",
              compact && "p-2.5",
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={cn(
                  "flex shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary",
                  compact ? "size-8" : "size-10",
                )}
              >
                <Icon className={compact ? "size-4" : "size-5"} />
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    "truncate font-medium",
                    compact ? "text-sm" : "text-base",
                  )}
                >
                  {file.displayName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {PRODUCT_FILE_KIND_LABELS[file.kind]}
                </p>
              </div>
            </div>
            <Button
              size={compact ? "sm" : "default"}
              variant={compact ? "outline" : "default"}
              className="shrink-0"
              disabled={downloadingId !== null}
              onClick={() => handleDownload(file)}
            >
              {downloading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              دانلود
            </Button>
          </div>
        );
      })}

      {showNote && (
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" />
          <p className="text-xs leading-5">
            لینک هر دانلود فقط مخصوص حساب شما ساخته می‌شود و مدت محدود (پیش‌فرض ۴
            ساعت) معتبر است؛ پس از انقضای آن، لینک جدیدی دریافت می‌کنید.
          </p>
        </div>
      )}
    </div>
  );
}
