"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/admin/shared/page-header";
import { DataTable } from "@/components/admin/shared/data-table";
import { DataTableColumnHeader } from "@/components/admin/shared/data-table-column-header";
import { StatusBadge, type StatusBadgeVariant } from "@/components/admin/shared/status-badge";
import {
  formatPriceToman,
  PURCHASE_STATUS_LABELS,
} from "@/lib/admin/format";
import type {
  Product,
  Purchase,
  PurchaseStatus,
  User,
} from "@/lib/generated/prisma/client";

type PurchaseRow = Purchase & { user: User; product: Product };

function purchaseStatusVariant(status: PurchaseStatus): StatusBadgeVariant {
  switch (status) {
    case "PENDING":
      return "in_progress";
    case "COMPLETED":
      return "completed";
    case "FAILED":
      return "cancelled";
    case "REFUNDED":
      return "draft";
  }
}

export function PurchasesPageClient({
  purchases,
}: {
  purchases: PurchaseRow[];
}) {
  const columns: ColumnDef<PurchaseRow>[] = [
    {
      accessorKey: "user.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="کاربر" />
      ),
      cell: ({ row }) => row.original.user.name,
    },
    {
      accessorKey: "product.title",
      header: "پکیج",
      cell: ({ row }) => row.original.product.title,
    },
    {
      id: "price",
      header: "مبلغ",
      cell: ({ row }) => formatPriceToman(row.original.pricePaid),
    },
    {
      accessorKey: "status",
      header: "وضعیت",
      cell: ({ row }) => (
        <StatusBadge
          variant={purchaseStatusVariant(row.original.status)}
          label={PURCHASE_STATUS_LABELS[row.original.status]}
        />
      ),
    },
    {
      accessorKey: "purchasedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="تاریخ" />
      ),
      cell: ({ row }) =>
        new Date(row.original.purchasedAt).toLocaleDateString("fa-IR"),
    },
  ];

  return (
    <>
      <PageHeader
        title="خریدها"
        description="لیست خریدهای کاربران (فقط مشاهده)"
      />

      <DataTable
        columns={columns}
        data={purchases}
        searchPlaceholder="جستجو در خریدها..."
      />
    </>
  );
}
