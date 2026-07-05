"use client";

import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/shared/page-header";
import { DataTable } from "@/components/admin/shared/data-table";
import { DataTableColumnHeader } from "@/components/admin/shared/data-table-column-header";
import { StatusBadge, type StatusBadgeVariant } from "@/components/admin/shared/status-badge";
import { updateAppointmentStatusAction } from "@/lib/actions/admin/operations";
import {
  APPOINTMENT_SLOT_LABELS,
  APPOINTMENT_STATUS_LABELS,
} from "@/lib/admin/format";
import type {
  Appointment,
  AppointmentSlot,
  AppointmentStatus,
  User,
} from "@/lib/generated/prisma/client";

type AppointmentRow = Appointment & { user: User };

function appointmentStatusVariant(
  status: AppointmentStatus,
): StatusBadgeVariant {
  switch (status) {
    case "CONFIRMED":
      return "confirmed";
    case "CANCELLED":
      return "cancelled";
    case "COMPLETED":
      return "completed";
  }
}

export function AppointmentsPageClient({
  appointments,
}: {
  appointments: AppointmentRow[];
}) {
  const router = useRouter();

  async function updateStatus(id: string, status: AppointmentStatus) {
    const result = await updateAppointmentStatusAction(id, status);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("وضعیت به‌روزرسانی شد");
    router.refresh();
  }

  const columns: ColumnDef<AppointmentRow>[] = [
    {
      accessorKey: "user.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="کاربر" />
      ),
      cell: ({ row }) => row.original.user.name,
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="تاریخ" />
      ),
      cell: ({ row }) =>
        new Date(row.original.date).toLocaleDateString("fa-IR"),
    },
    {
      accessorKey: "slot",
      header: "بازه زمانی",
      cell: ({ row }) =>
        APPOINTMENT_SLOT_LABELS[row.original.slot as AppointmentSlot],
    },
    {
      accessorKey: "status",
      header: "وضعیت",
      cell: ({ row }) => (
        <StatusBadge
          variant={appointmentStatusVariant(row.original.status)}
          label={APPOINTMENT_STATUS_LABELS[row.original.status]}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="نوبت‌ها"
        description="لیست نوبت‌های مشاوره"
      />

      <DataTable
        columns={columns}
        data={appointments}
        searchPlaceholder="جستجو در نوبت‌ها..."
        rowActions={[
          {
            label: "تأیید",
            onClick: (row) => updateStatus(row.id, "CONFIRMED"),
            disabled: false,
          },
          {
            label: "تکمیل",
            onClick: (row) => updateStatus(row.id, "COMPLETED"),
          },
          {
            label: "لغو",
            variant: "destructive",
            onClick: (row) => updateStatus(row.id, "CANCELLED"),
          },
        ]}
      />
    </>
  );
}
