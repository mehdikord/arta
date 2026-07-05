import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryBadge } from "@/components/shared/category-badge";
import { formatJalaliDate } from "@/lib/format";
import { BlogImage } from "./blog-image";
import type { BlogPost } from "@/types";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden border-none bg-card shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
        <div className="relative aspect-[16/10] overflow-hidden">
          <BlogImage
            src={post.image}
            alt={post.title}
            category={post.category}
            className="absolute inset-0"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        <CardContent className="p-5">
          <CategoryBadge label={post.category} variant="outline" />
          <h3 className="mt-3 line-clamp-2 font-semibold leading-snug transition-colors group-hover:text-primary">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
            {post.excerpt}
          </p>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatJalaliDate(post.publishedAt)}</span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {post.readTime} دقیقه
            </span>
          </div>
          <span className="mt-3 flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            مطالعه مقاله
            <ArrowLeft className="size-3.5" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
