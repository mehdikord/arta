import Link from "next/link";
import { ArrowLeft, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/shared/category-badge";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { SectionContainer } from "@/components/shared/section-container";
import { formatJalaliDate } from "@/lib/format";
import { BlogImage } from "./blog-image";
import { BlogContent } from "./blog-content";
import { RelatedPosts } from "./related-posts";
import type { BlogPost } from "@/types";

interface BlogDetailProps {
  post: BlogPost;
  related: BlogPost[];
}

export function BlogDetail({ post, related }: BlogDetailProps) {
  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-bl from-secondary/30 via-background to-primary/5">
        <div className="section-pattern absolute inset-0 opacity-20" />
        <SectionContainer className="relative py-10 md:py-14">
          <Breadcrumb
            items={[
              { label: "وبلاگ", href: "/blog" },
              { label: post.title },
            ]}
          />
          <div className="mt-6 max-w-3xl">
            <CategoryBadge label={post.category} />
            <h1 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
              {post.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="size-4" />
                {post.author}
              </span>
              <span>{formatJalaliDate(post.publishedAt)}</span>
              <span className="flex items-center gap-1.5">
                <Clock className="size-4" />
                {post.readTime} دقیقه مطالعه
              </span>
            </div>
          </div>
        </SectionContainer>
      </div>

      <SectionContainer className="py-10">
        <div className="mx-auto max-w-3xl">
          <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl shadow-lg">
            <BlogImage
              src={post.image}
              alt={post.title}
              category={post.category}
              className="absolute inset-0"
              priority
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>

          <BlogContent content={post.content} />

          <div className="mt-10 flex items-center justify-between border-t pt-8">
            <Button asChild variant="outline">
              <Link href="/blog">
                <ArrowLeft className="size-4" />
                بازگشت به وبلاگ
              </Link>
            </Button>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mx-auto mt-16 max-w-5xl">
            <RelatedPosts posts={related} />
          </div>
        )}
      </SectionContainer>
    </>
  );
}
