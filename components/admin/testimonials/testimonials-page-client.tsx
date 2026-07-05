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
import { deleteTestimonialAction } from "@/lib/actions/admin/testimonials";
import type { Testimonial } from "@/lib/generated/prisma/client";

export function TestimonialsPageClient({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const columns: ColumnDef<Testimonial>[] = [
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
      accessorKey: "rating",
      header: "امتیاز",
      cell: ({ row }) => `${row.original.rating}/۵`,
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
    const result = await deleteTestimonialAction(deleteId);
    setLoading(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("نظر حذف شد");
    setDeleteId(null);
    router.refresh();
  }

  return (
    <>
      <PageHeader
        title="نظرات مشتریان"
        description="مدیریت نظرات و بازخوردها"
        actions={
          <Button asChild>
            <Link href="/admins/testimonials/new">
              <Plus className="size-4" />
              نظر جدید
            </Link>
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={testimonials}
        searchPlaceholder="جستجو..."
        rowActions={[
          {
            label: "ویرایش",
            onClick: (row) =>
              router.push(`/admins/testimonials/${row.id}/edit`),
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
        title="حذف نظر"
        description="آیا از حذف این نظر مطمئن هستید؟"
        confirmLabel="حذف"
        variant="destructive"
        loading={loading}
        onConfirm={handleDelete}
      />
    </>
  );
}
