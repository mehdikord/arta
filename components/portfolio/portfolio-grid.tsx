"use client";

import { useMemo, useState } from "react";
import { PortfolioCard } from "./portfolio-card";
import { PortfolioFilter } from "./portfolio-filter";
import { EmptyState } from "@/components/shared/empty-state";
import { AnimateIn } from "@/components/shared/animate-in";
import { Briefcase } from "lucide-react";
import type { PortfolioItem } from "@/types";

interface PortfolioGridProps {
  items: PortfolioItem[];
  categories: string[];
}

export function PortfolioGrid({ items, categories }: PortfolioGridProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const counts = useMemo(() => {
    return items.reduce<Record<string, number>>((acc, item) => {
      acc[item.category] = (acc[item.category] ?? 0) + 1;
      return acc;
    }, {});
  }, [items]);

  const filtered = useMemo(() => {
    if (activeCategory === "all") return items;
    return items.filter((item) => item.category === activeCategory);
  }, [items, activeCategory]);

  return (
    <div className="space-y-10">
      <PortfolioFilter
        categories={categories}
        active={activeCategory}
        onChange={setActiveCategory}
        counts={counts}
      />

      {filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, i) => (
            <AnimateIn key={item.id} delay={(i % 3 + 1) as 1 | 2 | 3}>
              <PortfolioCard item={item} />
            </AnimateIn>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="نمونه‌کاری یافت نشد"
          description="در این دسته‌بندی نمونه‌کاری ثبت نشده است. فیلتر را تغییر دهید."
        />
      )}
    </div>
  );
}
