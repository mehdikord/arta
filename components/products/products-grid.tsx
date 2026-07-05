"use client";

import { useMemo, useState } from "react";
import { Package } from "lucide-react";
import { ProductCard } from "./product-card";
import { ProductFilters } from "./product-filters";
import { EmptyState } from "@/components/shared/empty-state";
import { AnimateIn } from "@/components/shared/animate-in";
import { sortProducts, type ProductSortOption } from "@/lib/product";
import type { Product } from "@/types";

interface ProductsGridProps {
  products: Product[];
  categories: string[];
}

export function ProductsGrid({ products, categories }: ProductsGridProps) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [sort, setSort] = useState<ProductSortOption>("newest");

  const counts = useMemo(() => {
    return products.reduce<Record<string, number>>((acc, p) => {
      acc[p.category] = (acc[p.category] ?? 0) + 1;
      return acc;
    }, {});
  }, [products]);

  const filtered = useMemo(() => {
    const byCategory =
      activeCategory === "all"
        ? products
        : products.filter((p) => p.category === activeCategory);
    return sortProducts(byCategory, sort);
  }, [products, activeCategory, sort]);

  return (
    <div className="space-y-8">
      <ProductFilters
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        sort={sort}
        onSortChange={setSort}
        counts={counts}
      />

      {filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product, i) => (
            <AnimateIn key={product.id} delay={(i % 3 + 1) as 1 | 2 | 3}>
              <ProductCard product={product} />
            </AnimateIn>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="پکیجی یافت نشد"
          description="در این دسته‌بندی پکیج آموزشی موجود نیست."
        />
      )}
    </div>
  );
}
