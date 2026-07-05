"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BlogCategoryFilterProps {
  categories: string[];
  selected: string | null;
  onSelect: (category: string | null) => void;
}

export function BlogCategoryFilter({
  categories,
  selected,
  onSelect,
}: BlogCategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        size="sm"
        variant={selected === null ? "default" : "outline"}
        onClick={() => onSelect(null)}
      >
        همه
      </Button>
      {categories.map((cat) => (
        <Button
          key={cat}
          type="button"
          size="sm"
          variant={selected === cat ? "default" : "outline"}
          className={cn(selected === cat && "shadow-sm")}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </Button>
      ))}
    </div>
  );
}
