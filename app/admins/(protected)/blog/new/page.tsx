import { PageHeader } from "@/components/admin/shared/page-header";
import { BlogForm } from "@/components/admin/blog/blog-form";
import { getBlogCategoriesAction } from "@/lib/actions/admin/blog-categories";

export const metadata = { title: "مقاله جدید" };

export default async function NewBlogPage() {
  const categories = await getBlogCategoriesAction();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="مقاله جدید" description="ایجاد مقاله جدید" />
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <BlogForm categories={categories} />
      </div>
    </div>
  );
}
