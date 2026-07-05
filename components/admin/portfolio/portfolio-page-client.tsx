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
import { deletePortfolioItemAction } from "@/lib/actions/admin/portfolio";
import type {
  PortfolioCategory,
  PortfolioItem,
} from "@/lib/generated/prisma/client";

type PortfolioRow = PortfolioItem & { category: PortfolioCategory };

export function PortfolioPageClient({ items }: { items: PortfolioRow[] }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const columns: ColumnDef<PortfolioRow>[] = [
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
      accessorKey: "year",
      header: "سال",
      cell: ({ row }) => row.original.year ?? "—",
    },
    {
      accessorKey: "sortOrder",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ترتیب" />
      ),
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
    const result = await deletePortfolioItemAction(deleteId);
    setLoading(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("نمونه‌کار حذف شد");
    setDeleteId(null);
    router.refresh();
  }

  return (
    <>
      <PageHeader
        title="نمونه‌کارها"
        description="مدیریت نمونه‌کارها"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/admins/portfolio/categories">
                <FolderTree className="size-4" />
                دسته‌بندی‌ها
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admins/portfolio/new">
                <Plus className="size-4" />
                نمونه‌کار جدید
              </Link>
            </Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={items}
        searchPlaceholder="جستجو در نمونه‌کارها..."
        rowActions={[
          {
            label: "ویرایش",
            onClick: (row) => router.push(`/admins/portfolio/${row.id}/edit`),
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
        title="حذف نمونه‌کار"
        description="آیا از حذف این نمونه‌کار مطمئن هستید؟"
        confirmLabel="حذف"
        variant="destructive"
        loading={loading}
        onConfirm={handleDelete}
      />
    </>
  );
}
