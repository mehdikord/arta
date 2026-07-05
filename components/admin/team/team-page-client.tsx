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
import { deleteTeamMemberAction } from "@/lib/actions/admin/team";
import type { TeamMember } from "@/lib/generated/prisma/client";

export function TeamPageClient({ members }: { members: TeamMember[] }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const columns: ColumnDef<TeamMember>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="نام" />
      ),
    },
    {
      accessorKey: "role",
      header: "سمت",
    },
    {
      accessorKey: "isManagement",
      header: "مدیریت",
      cell: ({ row }) =>
        row.original.isManagement ? (
          <StatusBadge variant="featured" label="مدیریت" />
        ) : null,
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
    const result = await deleteTeamMemberAction(deleteId);
    setLoading(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("عضو تیم حذف شد");
    setDeleteId(null);
    router.refresh();
  }

  return (
    <>
      <PageHeader
        title="تیم"
        description="مدیریت اعضای تیم"
        actions={
          <Button asChild>
            <Link href="/admins/team/new">
              <Plus className="size-4" />
              عضو جدید
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={members}
        searchPlaceholder="جستجو..."
        rowActions={[
          {
            label: "ویرایش",
            onClick: (row) => router.push(`/admins/team/${row.id}/edit`),
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
        title="حذف عضو"
        description="آیا از حذف این عضو مطمئن هستید؟"
        confirmLabel="حذف"
        variant="destructive"
        loading={loading}
        onConfirm={handleDelete}
      />
    </>
  );
}
