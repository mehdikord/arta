"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { FolderTree, ImageIcon, ListOrdered, Paperclip, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/shared/page-header";
import { DataTable } from "@/components/admin/shared/data-table";
import { DataTableColumnHeader } from "@/components/admin/shared/data-table-column-header";
import { StatusBadge } from "@/components/admin/shared/status-badge";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { deleteProductAction } from "@/lib/actions/admin/products";
import { formatPriceToman } from "@/lib/admin/format";
import type { Product, ProductCategory } from "@/lib/generated/prisma/client";

type ProductRow = Product & {
  category: ProductCategory;
  _count: { chapters: number; files: number };
};

export function ProductsPageClient({ products }: { products: ProductRow[] }) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const columns: ColumnDef<ProductRow>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="پکیج" />
      ),
      cell: ({ row }) => {
        const product = row.original;
        return (
          <Link
            href={`/admins/products/${product.id}/edit`}
            className="group flex min-w-56 items-center gap-3"
          >
            <span className="relative flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/50">
              {product.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.image} alt="" className="size-full object-cover" loading="lazy" />
              ) : (
                <ImageIcon className="size-4 text-muted-foreground" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-medium group-hover:text-primary">
                {product.title}
              </span>
              <span className="block truncate text-xs text-muted-foreground" dir="ltr">
                /{product.slug}
              </span>
            </span>
          </Link>
        );
      },
    },
    {
      accessorKey: "category.name",
      header: "دسته",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm">{row.original.category.name}</span>
      ),
    },
    {
      id: "price",
      header: "قیمت",
      cell: ({ row }) => {
        const { price, discountPrice } = row.original;
        if (!price) {
          return <span className="font-medium text-emerald-700">رایگان</span>;
        }
        if (discountPrice != null && discountPrice < price) {
          return (
            <span className="flex flex-col whitespace-nowrap">
              <span className="font-medium">{formatPriceToman(discountPrice)}</span>
              <span className="text-xs text-muted-foreground line-through">
                {formatPriceToman(price)}
              </span>
            </span>
          );
        }
        return <span className="whitespace-nowrap">{formatPriceToman(price)}</span>;
      },
    },
    {
      id: "content",
      header: "محتوا",
      cell: ({ row }) => {
        const { chapters, files } = row.original._count;
        return (
          <span className="flex flex-wrap gap-1.5 text-xs">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
              <ListOrdered className="size-3" />
              {chapters.toLocaleString("fa-IR")} سرفصل
            </span>
            <span
              className={
                files === 0
                  ? "inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-800"
                  : "inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5"
              }
            >
              <Paperclip className="size-3" />
              {files.toLocaleString("fa-IR")} فایل
            </span>
          </span>
        );
      },
    },
    {
      accessorKey: "isPublished",
      header: "وضعیت",
      cell: ({ row }) => (
        <span className="flex flex-wrap gap-1.5">
          <StatusBadge variant={row.original.isPublished ? "published" : "draft"} />
          {row.original.isFeatured && <StatusBadge variant="featured" />}
        </span>
      ),
    },
  ];

  async function handleDelete() {
    if (!deleteId) return;
    setLoading(true);
    const result = await deleteProductAction(deleteId);
    setLoading(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("پکیج حذف شد");
    setDeleteId(null);
    router.refresh();
  }

  return (
    <>
      <PageHeader
        title="پکیج‌ها"
        description={`${products.length.toLocaleString("fa-IR")} پکیج آموزشی`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href="/admins/products/categories">
                <FolderTree className="size-4" />
                دسته‌بندی‌ها
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admins/products/new">
                <Plus className="size-4" />
                پکیج جدید
              </Link>
            </Button>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={products}
        searchPlaceholder="جستجو در پکیج‌ها..."
        rowActions={[
          {
            label: "ویرایش",
            onClick: (row) => router.push(`/admins/products/${row.id}/edit`),
          },
          {
            label: "مشاهده در سایت",
            onClick: (row) => window.open(`/products/${row.slug}`, "_blank", "noopener"),
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
        title="حذف پکیج"
        description="پکیج از سایت حذف می‌شود؛ خریداران فعلی دیگر به فایل‌های آن دسترسی نخواهند داشت."
        confirmLabel="حذف"
        variant="destructive"
        loading={loading}
        onConfirm={handleDelete}
      />
    </>
  );
}
