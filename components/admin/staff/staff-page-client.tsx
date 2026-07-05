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
import { useAdminSession } from "@/components/admin/layout/admin-session-context";
import {
  deactivateStaffAction,
} from "@/lib/actions/admin/staff";
import { ADMIN_ROLES_LABELS } from "@/lib/admin/constants";
import type { AdminRole } from "@/lib/admin/constants";

type StaffRow = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
};

export function StaffPageClient({ staff }: { staff: StaffRow[] }) {
  const router = useRouter();
  const admin = useAdminSession();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const columns: ColumnDef<StaffRow>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="نام" />
      ),
    },
    {
      accessorKey: "email",
      header: "ایمیل",
      cell: ({ row }) => (
        <span dir="ltr">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "mobile",
      header: "موبایل",
      cell: ({ row }) => (
        <span dir="ltr">{row.original.mobile}</span>
      ),
    },
    {
      accessorKey: "role",
      header: "نقش",
      cell: ({ row }) => ADMIN_ROLES_LABELS[row.original.role],
    },
    {
      accessorKey: "isActive",
      header: "وضعیت",
      cell: ({ row }) => (
        <StatusBadge
          variant={row.original.isActive ? "active" : "inactive"}
        />
      ),
    },
  ];

  async function handleDelete() {
    if (!deleteId) return;
    setLoading(true);
    const result = await deactivateStaffAction(deleteId, admin.adminId);
    setLoading(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("مدیر غیرفعال شد");
    setDeleteId(null);
    router.refresh();
  }

  return (
    <>
      <PageHeader
        title="مدیران"
        description="مدیریت حساب‌های پنل (فقط مدیر ارشد)"
        actions={
          <Button asChild>
            <Link href="/admins/staff/new">
              <Plus className="size-4" />
              مدیر جدید
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={staff}
        searchPlaceholder="جستجو..."
        rowActions={[
          {
            label: "ویرایش",
            onClick: (row) => router.push(`/admins/staff/${row.id}/edit`),
          },
          {
            label: "غیرفعال‌سازی",
            variant: "destructive",
            onClick: (row) => setDeleteId(row.id),
            disabled: false,
          },
        ]}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="غیرفعال‌سازی مدیر"
        description="آیا از غیرفعال‌سازی این حساب مطمئن هستید؟"
        confirmLabel="غیرفعال‌سازی"
        variant="destructive"
        loading={loading}
        onConfirm={handleDelete}
      />
    </>
  );
}
