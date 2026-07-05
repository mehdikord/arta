"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProductSortOption } from "@/lib/product";

interface ProductFiltersProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  sort: ProductSortOption;
  onSortChange: (sort: ProductSortOption) => void;
  counts?: Record<string, number>;
}

const sortOptions: { value: ProductSortOption; label: string }[] = [
  { value: "newest", label: "جدیدترین" },
  { value: "cheapest", label: "ارزان‌ترین" },
  { value: "bestseller", label: "پرفروش‌ترین" },
];

export function ProductFilters({
  categories,
  activeCategory,
  onCategoryChange,
  sort,
  onSortChange,
  counts,
}: ProductFiltersProps) {
  const allCount = counts
    ? Object.values(counts).reduce((a, b) => a + b, 0)
    : undefined;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryChange("all")}
          className={cn("rounded-full px-4", activeCategory === "all" && "shadow-md")}
        >
          همه
          {allCount !== undefined && (
            <span className="ms-1 opacity-70">({allCount})</span>
          )}
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryChange(cat)}
            className={cn(
              "rounded-full px-4",
              activeCategory === cat && "shadow-md",
            )}
          >
            {cat}
            {counts?.[cat] !== undefined && (
              <span className="ms-1 opacity-70">({counts[cat]})</span>
            )}
          </Button>
        ))}
      </div>

      <Select
        value={sort}
        onValueChange={(v) => onSortChange(v as ProductSortOption)}
      >
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue placeholder="مرتب‌سازی" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
