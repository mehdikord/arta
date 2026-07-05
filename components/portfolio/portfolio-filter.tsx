"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PortfolioFilterProps {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
  counts?: Record<string, number>;
}

export function PortfolioFilter({
  categories,
  active,
  onChange,
  counts,
}: PortfolioFilterProps) {
  const allCount = counts
    ? Object.values(counts).reduce((a, b) => a + b, 0)
    : undefined;

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button
        variant={active === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("all")}
        className={cn("rounded-full px-5", active === "all" && "shadow-md")}
      >
        همه
        {allCount !== undefined && (
          <span className="ms-1.5 text-xs opacity-70">({allCount})</span>
        )}
      </Button>
      {categories.map((cat) => (
        <Button
          key={cat}
          variant={active === cat ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(cat)}
          className={cn("rounded-full px-5", active === cat && "shadow-md")}
        >
          {cat}
          {counts?.[cat] !== undefined && (
            <span className="ms-1.5 text-xs opacity-70">({counts[cat]})</span>
          )}
        </Button>
      ))}
    </div>
  );
}
