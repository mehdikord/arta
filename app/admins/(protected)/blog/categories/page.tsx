import { BlogCategoriesPageClient } from "@/components/admin/blog/blog-categories-page-client";
import { getBlogCategoriesAction } from "@/lib/actions/admin/blog-categories";

export const metadata = { title: "دسته‌بندی وبلاگ" };

export default async function BlogCategoriesPage() {
  const categories = await getBlogCategoriesAction();
  return <BlogCategoriesPageClient categories={categories} />;
}
