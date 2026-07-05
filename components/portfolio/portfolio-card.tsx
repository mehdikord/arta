import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryBadge } from "@/components/shared/category-badge";
import { PortfolioImage } from "./portfolio-image";
import type { PortfolioItem } from "@/types";

interface PortfolioCardProps {
  item: PortfolioItem;
}

export function PortfolioCard({ item }: PortfolioCardProps) {
  return (
    <Link href={`/portfolio/${item.slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden border-none bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
        <div className="relative aspect-[16/10] overflow-hidden">
          <PortfolioImage
            src={item.image}
            alt={item.title}
            category={item.category}
            className="absolute inset-0"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {item.year && (
            <span className="absolute top-3 start-3 z-10 rounded-full bg-card/90 px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm">
              {item.year}
            </span>
          )}
        </div>
        <CardContent className="p-5">
          <CategoryBadge label={item.category} />
          <h3 className="mt-3 line-clamp-2 font-semibold leading-snug transition-colors group-hover:text-primary">
            {item.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {item.shortDescription}
          </p>
          {item.client && (
            <p className="mt-3 text-xs text-muted-foreground">
              مشتری: {item.client}
            </p>
          )}
          <p className="mt-4 flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            مشاهده جزئیات
            <ArrowLeft className="size-4" />
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
