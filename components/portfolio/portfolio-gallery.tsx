"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  getPortfolioGradient,
  PORTFOLIO_BLUR_DATA_URL,
} from "@/lib/portfolio";

interface PortfolioGalleryProps {
  images: string[];
  title: string;
  category: string;
}

export function PortfolioGallery({
  images,
  title,
  category,
}: PortfolioGalleryProps) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const gradient = getPortfolioGradient(category);

  if (images.length === 0) return null;

  return (
    <>
      <div
        className={cn(
          "grid gap-4",
          images.length === 1 && "grid-cols-1",
          images.length === 2 && "grid-cols-1 sm:grid-cols-2",
          images.length >= 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setLightbox(src)}
            className={cn(
              "group relative overflow-hidden rounded-2xl bg-gradient-to-bl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              gradient,
              i === 0 && images.length >= 3 && "sm:col-span-2 sm:row-span-1",
            )}
          >
            <div
              className={cn(
                "relative w-full",
                i === 0 && images.length >= 3 ? "aspect-[21/9]" : "aspect-video",
              )}
            >
              <Image
                src={src}
                alt={`${title} — تصویر ${i + 1}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                placeholder="blur"
                blurDataURL={PORTFOLIO_BLUR_DATA_URL}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition-colors group-hover:bg-foreground/20">
                <ZoomIn className="size-8 text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!lightbox} onOpenChange={() => setLightbox(null)}>
        <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">نمایش تصویر</DialogTitle>
          {lightbox && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="absolute -top-2 start-0 z-10 flex size-10 items-center justify-center rounded-full bg-card shadow-lg"
                aria-label="بستن"
              >
                <X className="size-5" />
              </button>
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
                <Image
                  src={lightbox}
                  alt={title}
                  fill
                  className="object-contain"
                  sizes="90vw"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
