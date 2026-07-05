"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/shared/page-header";
import { DataTable } from "@/components/admin/shared/data-table";
import { DataTableColumnHeader } from "@/components/admin/shared/data-table-column-header";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import {
  deleteServiceAction,
} from "@/lib/actions/admin/services";
import { SERVICE_CATEGORY_LABELS } from "@/lib/admin/format";
import type { Service } from "@/lib/generated/prisma/client";

export function ServicesPageClient({ services }: { services: Service[] }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const columns: ColumnDef<Service>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="عنوان" />
      ),
    },
    {
      accessorKey: "category",
      header: "دسته",
      cell: ({ row }) => SERVICE_CATEGORY_LABELS[row.original.category],
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
      accessorKey: "sortOrder",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ترتیب" />
      ),
    },
  ];

  async function handleDelete() {
    if (!deleteId) return;
    setLoading(true);
    const result = await deleteServiceAction(deleteId);
    setLoading(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("خدمت حذف شد");
    setDeleteId(null);
    router.refresh();
  }

  return (
    <>
      <PageHeader
        title="خدمات"
        description="مدیریت خدمات آکادمی"
        actions={
          <Button asChild>
            <Link href="/admins/services/new">
              <Plus className="size-4" />
              خدمت جدید
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={services}
        searchPlaceholder="جستجو در خدمات..."
        rowActions={[
          {
            label: "ویرایش",
            onClick: (row) => router.push(`/admins/services/${row.id}/edit`),
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
        title="حذف خدمت"
        description="آیا از حذف این خدمت مطمئن هستید؟"
        confirmLabel="حذف"
        variant="destructive"
        loading={loading}
        onConfirm={handleDelete}
      />
    </>
  );
}
