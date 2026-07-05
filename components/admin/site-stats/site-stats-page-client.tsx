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
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { deleteSiteStatAction } from "@/lib/actions/admin/site-stats";
import type { SiteStat } from "@/lib/generated/prisma/client";

export function SiteStatsPageClient({ stats }: { stats: SiteStat[] }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const columns: ColumnDef<SiteStat>[] = [
    {
      accessorKey: "label",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="برچسب" />
      ),
    },
    {
      accessorKey: "value",
      header: "مقدار",
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
    const result = await deleteSiteStatAction(deleteId);
    setLoading(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("آمار حذف شد");
    setDeleteId(null);
    router.refresh();
  }

  return (
    <>
      <PageHeader
        title="آمار صفحه اصلی"
        description="مدیریت آمار نمایش داده‌شده در صفحه اصلی"
        actions={
          <Button asChild>
            <Link href="/admins/site-stats/new">
              <Plus className="size-4" />
              آمار جدید
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={stats}
        searchPlaceholder="جستجو..."
        rowActions={[
          {
            label: "ویرایش",
            onClick: (row) => router.push(`/admins/site-stats/${row.id}/edit`),
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
        title="حذف آمار"
        description="آیا از حذف این آمار مطمئن هستید؟"
        confirmLabel="حذف"
        variant="destructive"
        loading={loading}
        onConfirm={handleDelete}
      />
    </>
  );
}
