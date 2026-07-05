import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryBadge } from "@/components/shared/category-badge";
import { PriceDisplay } from "@/components/shared/price-display";
import { ProductImage } from "./product-image";
import { ProductBadges } from "./product-badges";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden border-none bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
        <div className="relative aspect-[4/3] overflow-hidden">
          <ProductImage
            src={product.image}
            alt={product.title}
            category={product.category}
            className="absolute inset-0"
            sizes="(max-width: 768px) 100vw, 25vw"
          />
          <div className="absolute top-3 start-3 z-10">
            <ProductBadges product={product} />
          </div>
        </div>
        <CardContent className="p-5">
          <CategoryBadge label={product.category} variant="outline" />
          <h3 className="mt-3 line-clamp-2 font-semibold leading-snug transition-colors group-hover:text-primary">
            {product.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {product.shortDescription}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <PriceDisplay
              price={product.price}
              discountPrice={product.discountPrice}
            />
            <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
              مشاهده
              <ArrowLeft className="size-3.5" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
