"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Calendar,
  Mail,
  ShoppingBag,
  UserPlus,
} from "lucide-react";
import { DataTableColumnHeader } from "@/components/admin/shared/data-table-column-header";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { cn } from "@/lib/utils";

export interface ActivityRow {
  id: string;
  type: "purchase" | "appointment" | "contact" | "register";
  title: string;
  description: string;
  time: string;
}

const ACTIVITY_ICONS = {
  purchase: ShoppingBag,
  appointment: Calendar,
  contact: Mail,
  register: UserPlus,
} as const;

const ACTIVITY_STATUS = {
  purchase: "paid" as const,
  appointment: "confirmed" as const,
  contact: "new" as const,
  register: "active" as const,
};

export const recentActivityColumns: ColumnDef<ActivityRow>[] = [
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="نوع" />
    ),
    cell: ({ row }) => {
      const type = row.original.type;
      const Icon = ACTIVITY_ICONS[type];
      return (
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-9 items-center justify-center rounded-lg",
              type === "purchase" && "bg-primary/10 text-primary",
              type === "appointment" && "bg-blue-100 text-blue-700",
              type === "contact" && "bg-amber-100 text-amber-700",
              type === "register" && "bg-violet-100 text-violet-700",
            )}
          >
            <Icon className="size-4" />
          </div>
          <StatusBadge variant={ACTIVITY_STATUS[type]} label={row.original.title} />
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="توضیحات" />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.description}
      </span>
    ),
  },
  {
    accessorKey: "time",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="زمان" />
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {row.original.time}
      </span>
    ),
  },
];
