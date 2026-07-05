import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
import { SectionContainer } from "@/components/shared/section-container";
import { BlogGrid } from "@/components/blog/blog-grid";
import { SITE_CONFIG } from "@/lib/constants";
import { getBlogPosts } from "@/lib/data";
import { getBlogCategories } from "@/lib/blog";

export const metadata: Metadata = {
  title: "وبلاگ",
  description:
    "مقالات تخصصی آکادمی آرتا در زمینه روانشناسی، رشد فردی و سلامت روان",
  openGraph: {
    title: `وبلاگ | ${SITE_CONFIG.name}`,
    description: "آخرین مطالب آموزشی و تخصصی",
    locale: "fa_IR",
  },
};

export default async function BlogPage() {
  const posts = await getBlogPosts();
  const categories = getBlogCategories(posts);

  return (
    <>
      <PageHero
        title="وبلاگ آرتا"
        description="مطالب تخصصی در زمینه روانشناسی، رشد فردی و سلامت روان"
        breadcrumbs={[{ label: "وبلاگ" }]}
      />
      <SectionContainer>
        <BlogGrid posts={posts} categories={categories} />
      </SectionContainer>
    </>
  );
}
