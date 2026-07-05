"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { FolderTree, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/shared/page-header";
import { DataTable } from "@/components/admin/shared/data-table";
import { DataTableColumnHeader } from "@/components/admin/shared/data-table-column-header";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { deleteBlogPostAction } from "@/lib/actions/admin/blog";
import type { BlogCategory, BlogPost } from "@/lib/generated/prisma/client";

type BlogRow = BlogPost & { category: BlogCategory };

export function BlogPageClient({ posts }: { posts: BlogRow[] }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const columns: ColumnDef<BlogRow>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="عنوان" />
      ),
    },
    {
      accessorKey: "category.name",
      header: "دسته",
      cell: ({ row }) => row.original.category.name,
    },
    {
      accessorKey: "author",
      header: "نویسنده",
    },
    {
      accessorKey: "publishedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="تاریخ انتشار" />
      ),
      cell: ({ row }) =>
        new Date(row.original.publishedAt).toLocaleDateString("fa-IR"),
    },
    {
      accessorKey: "isPublished",
      header: "وضعیت",
      cell: ({ row }) => (
        <StatusBadge
          variant={row.original.isPublished ? "published" : "draft"}
        />
      ),
    },
  ];

  async function handleDelete() {
    if (!deleteId) return;
    setLoading(true);
    const result = await deleteBlogPostAction(deleteId);
    setLoading(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("مقاله حذف شد");
    setDeleteId(null);
    router.refresh();
  }

  return (
    <>
      <PageHeader
        title="وبلاگ"
        description="مدیریت مقالات وبلاگ"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/admins/blog/categories">
                <FolderTree className="size-4" />
                دسته‌بندی‌ها
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admins/blog/new">
                <Plus className="size-4" />
                مقاله جدید
              </Link>
            </Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={posts}
        searchPlaceholder="جستجو در مقالات..."
        rowActions={[
          {
            label: "ویرایش",
            onClick: (row) => router.push(`/admins/blog/${row.id}/edit`),
          },
          {
            label: "حذف",
            variant: "destructive",
            onClick: (row) => setDeleteId(row.id),
          },
        ]}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="حذف مقاله"
        description="آیا از حذف این مقاله مطمئن هستید؟"
        confirmLabel="حذف"
        variant="destructive"
        loading={loading}
        onConfirm={handleDelete}
      />
    </>
  );
}
