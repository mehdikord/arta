"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/admin/shared/page-header";
import { DataTable } from "@/components/admin/shared/data-table";
import { DataTableColumnHeader } from "@/components/admin/shared/data-table-column-header";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { ProductCategoryForm } from "@/components/admin/products/product-category-form";
import {
  deleteProductCategoryAction,
  saveProductCategoryAction,
} from "@/lib/actions/admin/product-categories";
import type { ProductCategoryInput } from "@/lib/validations/admin/product-category";
import type { ProductCategory } from "@/lib/generated/prisma/client";

type CategoryRow = ProductCategory & { _count: { products: number } };

export function ProductCategoriesPageClient({
  categories,
}: {
  categories: CategoryRow[];
}) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const columns: ColumnDef<CategoryRow>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="نام" />
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <span dir="ltr" className="font-mono text-sm">
          {row.original.slug}
        </span>
      ),
    },
    {
      id: "products",
      header: "تعداد پکیج",
      cell: ({ row }) => row.original._count.products,
    },
  ];

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(category: CategoryRow) {
    setEditing(category);
    setDialogOpen(true);
  }

  async function handleSave(values: ProductCategoryInput) {
    const result = await saveProductCategoryAction(values, editing?.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(editing ? "دسته به‌روزرسانی شد" : "دسته ایجاد شد");
    setDialogOpen(false);
    setEditing(null);
    router.refresh();
  }

  async function handleDelete() {
    if (!deleteId) return;
    setLoading(true);
    const result = await deleteProductCategoryAction(deleteId);
    setLoading(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("دسته حذف شد");
    setDeleteId(null);
    router.refresh();
  }

  return (
    <>
      <PageHeader
        title="دسته‌بندی پکیج‌ها"
        description="مدیریت دسته‌بندی پکیج‌های آموزشی"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/admins/products">
                <ArrowRight className="size-4" />
                بازگشت به پکیج‌ها
              </Link>
            </Button>
            <Button onClick={openCreate}>
              <Plus className="size-4" />
              دسته جدید
            </Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={categories}
        searchPlaceholder="جستجو در دسته‌ها..."
        rowActions={[
          { label: "ویرایش", onClick: openEdit },
          {
            label: "حذف",
            variant: "destructive",
            onClick: (row) => setDeleteId(row.id),
          },
        ]}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "ویرایش دسته" : "دسته جدید"}
            </DialogTitle>
          </DialogHeader>
          <ProductCategoryForm
            key={editing?.id ?? "new"}
            category={editing ?? undefined}
            onSubmit={handleSave}
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="حذف دسته"
        description="آیا از حذف این دسته مطمئن هستید؟"
        confirmLabel="حذف"
        variant="destructive"
        loading={loading}
        onConfirm={handleDelete}
      />
    </>
  );
}
