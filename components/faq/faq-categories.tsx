"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FaqCategoriesProps {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
}

export function FaqCategories({
  categories,
  active,
  onChange,
}: FaqCategoriesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={active === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("all")}
        className={cn("rounded-full", active === "all" && "shadow-sm")}
      >
        همه
      </Button>
      {categories.map((cat) => (
        <Button
          key={cat}
          variant={active === cat ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(cat)}
          className={cn("rounded-full", active === cat && "shadow-sm")}
        >
          {cat}
        </Button>
      ))}
    </div>
  );
}
