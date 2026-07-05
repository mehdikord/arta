import Image from "next/image";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { BLOG_BLUR_DATA_URL, getBlogGradient } from "@/lib/blog";

interface BlogImageProps {
  src: string;
  alt: string;
  category: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export function BlogImage({
  src,
  alt,
  category,
  className,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 33vw",
}: BlogImageProps) {
  const gradient = getBlogGradient(category);

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
        blurDataURL={BLOG_BLUR_DATA_URL}
        sizes={sizes}
        priority={priority}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/25 via-transparent to-transparent" />
      <div className="pointer-events-none absolute top-3 end-3 rounded-lg bg-card/80 p-2 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
        <BookOpen className="size-4 text-primary" />
      </div>
    </div>
  );
}
