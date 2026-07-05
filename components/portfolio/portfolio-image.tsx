import Image from "next/image";
import { Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getPortfolioGradient,
  PORTFOLIO_BLUR_DATA_URL,
} from "@/lib/portfolio";

interface PortfolioImageProps {
  src: string;
  alt: string;
  category: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export function PortfolioImage({
  src,
  alt,
  category,
  className,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: PortfolioImageProps) {
  const gradient = getPortfolioGradient(category);

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
        blurDataURL={PORTFOLIO_BLUR_DATA_URL}
        sizes={sizes}
        priority={priority}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent" />
      <div className="pointer-events-none absolute bottom-3 end-3 rounded-lg bg-card/80 p-2 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100">
        <Briefcase className="size-4 text-primary" />
      </div>
    </div>
  );
}
