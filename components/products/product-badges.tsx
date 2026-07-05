import { Badge } from "@/components/ui/badge";
import {
  getDiscountPercent,
  hasDiscount,
  isFree,
  isNewProduct,
} from "@/lib/product";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

interface ProductBadgesProps {
  product: Product;
  className?: string;
}

export function ProductBadges({ product, className }: ProductBadgesProps) {
  const discount = getDiscountPercent(product);

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {isFree(product) && (
        <Badge className="bg-accent text-accent-foreground shadow-sm">
          رایگان
        </Badge>
      )}
      {hasDiscount(product) && discount && (
        <Badge variant="destructive" className="shadow-sm">
          {discount}٪ تخفیف
        </Badge>
      )}
      {isNewProduct(product) && (
        <Badge variant="secondary" className="bg-primary/15 text-primary">
          جدید
        </Badge>
      )}
      {product.isFeatured && (
        <Badge variant="outline" className="border-accent/50 text-accent">
          پرفروش
        </Badge>
      )}
    </div>
  );
}
