import Image from "next/image";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getProductGradient,
  PRODUCT_BLUR_DATA_URL,
} from "@/lib/product";

interface ProductImageProps {
  src: string;
  alt: string;
  category: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export function ProductImage({
  src,
  alt,
  category,
  className,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 33vw",
}: ProductImageProps) {
  const gradient = getProductGradient(category);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-bl",
        gradient,
        className,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        placeholder="blur"
        blurDataURL={PRODUCT_BLUR_DATA_URL}
        sizes={sizes}
        priority={priority}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent" />
      <div className="pointer-events-none absolute top-3 end-3 rounded-lg bg-card/80 p-2 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
        <Package className="size-4 text-primary" />
      </div>
    </div>
  );
}
