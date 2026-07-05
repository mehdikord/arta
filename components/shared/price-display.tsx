import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  price: number | null;
  discountPrice?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PriceDisplay({
  price,
  discountPrice = null,
  size = "md",
  className,
}: PriceDisplayProps) {
  const isFree = price === null || price === 0;
  const hasDiscount =
    !isFree && discountPrice != null && discountPrice < (price ?? 0);

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl font-bold",
  };

  if (isFree) {
    return (
      <Badge
        variant="secondary"
        className={cn("bg-accent/20 text-accent", sizeClasses[size], className)}
      >
        رایگان
      </Badge>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {hasDiscount ? (
        <>
          <span
            className={cn(
              "font-bold text-primary",
              sizeClasses[size],
            )}
          >
            {formatPrice(discountPrice)}
          </span>
          <span className="text-sm text-muted-foreground line-through">
            {formatPrice(price)}
          </span>
          <Badge variant="destructive" className="text-xs">
            تخفیف
          </Badge>
        </>
      ) : (
        <span
          className={cn("font-bold text-primary", sizeClasses[size])}
        >
          {formatPrice(price)}
        </span>
      )}
    </div>
  );
}
