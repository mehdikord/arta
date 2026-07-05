"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BlogCard } from "./blog-card";
import { BlogCategoryFilter } from "./blog-category-filter";
import { AnimateIn } from "@/components/shared/animate-in";
import { filterBlogPosts } from "@/lib/blog";
import type { BlogPost } from "@/types";

interface BlogGridProps {
  posts: BlogPost[];
  categories: string[];
}

export function BlogGrid({ posts, categories }: BlogGridProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const filtered = useMemo(
    () => filterBlogPosts(posts, query, category),
    [posts, query, category],
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="جستجو در عنوان و خلاصه..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="ps-10"
          />
        </div>
        <BlogCategoryFilter
          categories={categories}
          selected={category}
          onSelect={setCategory}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/30 p-12 text-center">
          <p className="font-medium">مقاله‌ای یافت نشد</p>
          <p className="mt-2 text-sm text-muted-foreground">
            عبارت جستجو یا دسته‌بندی را تغییر دهید
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post, i) => (
            <AnimateIn key={post.id} delay={((i % 3) + 1) as 1 | 2 | 3}>
              <BlogCard post={post} />
            </AnimateIn>
          ))}
        </div>
      )}
    </div>
  );
}
