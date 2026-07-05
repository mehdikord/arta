import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionContainer } from "@/components/shared/section-container";
import { SectionTitle } from "@/components/shared/section-title";
import { CategoryBadge } from "@/components/shared/category-badge";
import { AnimateIn } from "@/components/shared/animate-in";
import { BlogImage } from "@/components/blog/blog-image";
import { formatJalaliDate } from "@/lib/format";
import { getRecentBlogPosts } from "@/lib/data";

export async function LatestBlog() {
  const posts = await getRecentBlogPosts(3);

  return (
    <SectionContainer className="bg-muted/30">
      <SectionTitle
        title="مقالات اخیر"
        subtitle="آخرین مطالب آموزشی و تخصصی"
        centered
      />

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {posts.map((post, i) => (
          <AnimateIn key={post.id} delay={(i + 1) as 1 | 2 | 3}>
            <Link href={`/blog/${post.slug}`} className="group block h-full">
              <Card className="h-full overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <BlogImage
                    src={post.image}
                    alt={post.title}
                    category={post.category}
                    className="absolute inset-0"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>
                <div className="h-1 bg-gradient-to-l from-accent to-primary" />
                <CardContent className="p-6">
                  <CategoryBadge label={post.category} variant="outline" />
                  <h3 className="mt-3 font-semibold leading-snug group-hover:text-primary">
                    {post.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {post.excerpt}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{post.author}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {post.readTime} دقیقه
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatJalaliDate(post.publishedAt)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </AnimateIn>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Button asChild variant="outline" size="lg">
          <Link href="/blog">
            مطالعه وبلاگ
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
      </div>
    </SectionContainer>
  );
}
