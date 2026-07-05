import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  label: string;
  variant?: "default" | "secondary" | "outline";
  className?: string;
}

export function CategoryBadge({
  label,
  variant = "secondary",
  className,
}: CategoryBadgeProps) {
  return (
    <Badge
      variant={variant}
      className={cn(
        "rounded-full px-3 py-0.5 text-xs font-medium",
        className,
      )}
    >
      {label}
    </Badge>
  );
}
