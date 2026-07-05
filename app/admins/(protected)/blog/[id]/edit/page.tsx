import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/shared/page-header";
import { BlogForm } from "@/components/admin/blog/blog-form";
import { getBlogPostAction } from "@/lib/actions/admin/blog";
import { getBlogCategoriesAction } from "@/lib/actions/admin/blog-categories";

export const metadata = { title: "ویرایش مقاله" };

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, categories] = await Promise.all([
    getBlogPostAction(id),
    getBlogCategoriesAction(),
  ]);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="ویرایش مقاله" description={post.title} />
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <BlogForm post={post} categories={categories} />
      </div>
    </div>
  );
}
