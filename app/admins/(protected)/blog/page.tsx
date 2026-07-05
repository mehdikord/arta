import { BlogPageClient } from "@/components/admin/blog/blog-page-client";
import { getBlogPostsAction } from "@/lib/actions/admin/blog";

export const metadata = { title: "وبلاگ" };

export default async function AdminBlogPage() {
  const posts = await getBlogPostsAction();
  return <BlogPageClient posts={posts} />;
}
