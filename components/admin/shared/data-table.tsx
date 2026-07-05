"use client";

import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { MoreHorizontal, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTablePagination } from "@/components/admin/shared/data-table-pagination";
import { EmptyState } from "@/components/admin/shared/empty-state";
import { PAGINATION_DEFAULT } from "@/lib/admin/constants";
import { cn } from "@/lib/utils";

export interface DataTableRowAction<TData> {
  label: string;
  onClick: (row: TData) => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  searchColumn?: string;
  isLoading?: boolean;
  rowActions?: DataTableRowAction<TData>[];
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

function DataTableSkeleton({ columns }: { columns: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "جستجو...",
  searchColumn,
  isLoading = false,
  rowActions,
  emptyTitle = "موردی یافت نشد",
  emptyDescription = "داده‌ای برای نمایش وجود ندارد.",
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const tableColumns: ColumnDef<TData, TValue>[] = rowActions?.length
    ? [
        ...columns,
        {
          id: "actions",
          enableHiding: false,
          header: () => (
            <span className="block w-full text-center font-medium">عملیات</span>
          ),
          cell: ({ row }) => (
            <div className="flex justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8"
                  >
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">عملیات</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>عملیات</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {rowActions.map((action) => (
                    <DropdownMenuItem
                      key={action.label}
                      disabled={action.disabled}
                      variant={action.variant}
                      onClick={() => action.onClick(row.original)}
                    >
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ),
        } as ColumnDef<TData, TValue>,
      ]
    : columns;

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: PAGINATION_DEFAULT },
    },
    globalFilterFn: (row, _columnId, filterValue) => {
      if (!searchColumn) {
        const search = String(filterValue).toLowerCase();
        return Object.values(row.original as Record<string, unknown>).some(
          (value) =>
            value != null && String(value).toLowerCase().includes(search),
        );
      }
      const value = row.getValue(searchColumn);
      return String(value ?? "")
        .toLowerCase()
        .includes(String(filterValue).toLowerCase());
    },
  });

  const columnCount = tableColumns.length;
  const hasRows = table.getRowModel().rows.length > 0;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="h-9 bg-white ps-9"
        />
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/30 hover:bg-muted/30">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "whitespace-nowrap text-start",
                      header.column.id === "actions" && "admin-table-actions",
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <DataTableSkeleton columns={columnCount} />
            ) : hasRows ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "text-start",
                        cell.column.id === "actions" && "admin-table-actions",
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columnCount} className="h-48 p-0">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    className="border-0 bg-transparent"
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {hasRows && !isLoading && <DataTablePagination table={table} />}
    </div>
  );
}
