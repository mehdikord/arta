"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/admin/shared/page-header";
import { DataTable } from "@/components/admin/shared/data-table";
import { DataTableColumnHeader } from "@/components/admin/shared/data-table-column-header";
import { StatusBadge, type StatusBadgeVariant } from "@/components/admin/shared/status-badge";
import {
  CONTACT_STATUS_LABELS,
  formatRelativeTime,
} from "@/lib/admin/format";
import type { ContactStatus, ContactSubmission } from "@/lib/generated/prisma/client";

function contactStatusVariant(status: ContactStatus): StatusBadgeVariant {
  switch (status) {
    case "NEW":
      return "new";
    case "IN_PROGRESS":
      return "in_progress";
    case "RESOLVED":
      return "resolved";
  }
}

export function ContactsPageClient({
  contacts,
}: {
  contacts: ContactSubmission[];
}) {
  const router = useRouter();

  const columns: ColumnDef<ContactSubmission>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="نام" />
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
      accessorKey: "subject",
      header: "موضوع",
    },
    {
      accessorKey: "status",
      header: "وضعیت",
      cell: ({ row }) => (
        <StatusBadge
          variant={contactStatusVariant(row.original.status)}
          label={CONTACT_STATUS_LABELS[row.original.status]}
        />
      ),
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="تاریخ" />
      ),
      cell: ({ row }) => formatRelativeTime(row.original.createdAt),
    },
  ];

  return (
    <>
      <PageHeader
        title="پیام‌های تماس"
        description="صندوق ورودی پیام‌های تماس"
      />

      <DataTable
        columns={columns}
        data={contacts}
        searchPlaceholder="جستجو در پیام‌ها..."
        rowActions={[
          {
            label: "مشاهده",
            onClick: (row) => router.push(`/admins/contacts/${row.id}`),
          },
        ]}
      />
    </>
  );
}
