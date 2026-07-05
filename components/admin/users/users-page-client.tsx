"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/admin/shared/page-header";
import { DataTable } from "@/components/admin/shared/data-table";
import { DataTableColumnHeader } from "@/components/admin/shared/data-table-column-header";
import type { User } from "@/lib/generated/prisma/client";

type UserRow = User & {
  _count: { purchases: number; appointments: number };
};

export function UsersPageClient({ users }: { users: UserRow[] }) {
  const columns: ColumnDef<UserRow>[] = [
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
      accessorKey: "email",
      header: "ایمیل",
      cell: ({ row }) =>
        row.original.email ? (
          <span dir="ltr">{row.original.email}</span>
        ) : (
          "—"
        ),
    },
    {
      id: "purchases",
      header: "خریدها",
      cell: ({ row }) => row.original._count.purchases,
    },
    {
      id: "appointments",
      header: "نوبت‌ها",
      cell: ({ row }) => row.original._count.appointments,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="تاریخ عضویت" />
      ),
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString("fa-IR"),
    },
  ];

  return (
    <>
      <PageHeader
        title="کاربران"
        description="لیست کاربران سایت (فقط مشاهده)"
      />

      <DataTable
        columns={columns}
        data={users}
        searchPlaceholder="جستجو در کاربران..."
      />
    </>
  );
}
