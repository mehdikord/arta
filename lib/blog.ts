import type { BlogPost } from "@/types";

const categoryGradients: Record<string, string> = {
  "مدیریت استرس": "from-primary/80 via-primary/50 to-accent/40",
  روابط: "from-accent/70 via-accent/40 to-secondary/60",
  "کودک و نوجوان": "from-secondary/80 via-primary/30 to-accent/30",
  "ذهن‌آگاهی": "from-primary/60 via-accent/50 to-secondary/50",
  "سلامت شغلی": "from-accent/60 via-primary/40 to-primary/60",
  "رشد فردی": "from-secondary/70 via-accent/40 to-primary/40",
  "سلامت روان": "from-primary/70 via-secondary/50 to-accent/40",
  خانواده: "from-accent/80 via-secondary/40 to-primary/30",
};

export function getBlogGradient(category: string): string {
  return categoryGradients[category] ?? "from-primary/60 to-accent/40";
}

export const BLOG_BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjOWI4ZWM0Ii8+PC9zdmc+";

export function getBlogCategories(posts: BlogPost[]): string[] {
  return [...new Set(posts.map((p) => p.category))];
}

export function filterBlogPosts(
  posts: BlogPost[],
  query: string,
  category: string | null,
): BlogPost[] {
  const q = query.trim().toLowerCase();
  return posts.filter((post) => {
    const matchesCategory = !category || post.category === category;
    const matchesQuery =
      !q ||
      post.title.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });
}

export function getRelatedPosts(
  posts: BlogPost[],
  currentSlug: string,
  limit = 3,
): BlogPost[] {
  const current = posts.find((p) => p.slug === currentSlug);
  if (!current) return [];
  return posts
    .filter((p) => p.slug !== currentSlug && p.category === current.category)
    .slice(0, limit);
}
