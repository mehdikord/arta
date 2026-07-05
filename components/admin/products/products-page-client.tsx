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
import { deleteProductAction } from "@/lib/actions/admin/products";
import { formatPriceToman } from "@/lib/admin/format";
import type { Product, ProductCategory } from "@/lib/generated/prisma/client";

type ProductRow = Product & {
  category: ProductCategory;
  _count: { chapters: number };
};

export function ProductsPageClient({ products }: { products: ProductRow[] }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const columns: ColumnDef<ProductRow>[] = [
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
      id: "price",
      header: "قیمت",
      cell: ({ row }) => formatPriceToman(row.original.discountPrice ?? row.original.price),
    },
    {
      accessorKey: "isFeatured",
      header: "ویژه",
      cell: ({ row }) =>
        row.original.isFeatured ? (
          <StatusBadge variant="featured" />
        ) : null,
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
    {
      id: "chapters",
      header: "سرفصل‌ها",
      cell: ({ row }) => row.original._count.chapters,
    },
  ];

  async function handleDelete() {
    if (!deleteId) return;
    setLoading(true);
    const result = await deleteProductAction(deleteId);
    setLoading(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("پکیج حذف شد");
    setDeleteId(null);
    router.refresh();
  }

  return (
    <>
      <PageHeader
        title="پکیج‌ها"
        description="مدیریت پکیج‌های آموزشی"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/admins/products/categories">
                <FolderTree className="size-4" />
                دسته‌بندی‌ها
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admins/products/new">
                <Plus className="size-4" />
                پکیج جدید
              </Link>
            </Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={products}
        searchPlaceholder="جستجو در پکیج‌ها..."
        rowActions={[
          {
            label: "ویرایش",
            onClick: (row) => router.push(`/admins/products/${row.id}/edit`),
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
        title="حذف پکیج"
        description="آیا از حذف این پکیج مطمئن هستید؟"
        confirmLabel="حذف"
        variant="destructive"
        loading={loading}
        onConfirm={handleDelete}
      />
    </>
  );
}
