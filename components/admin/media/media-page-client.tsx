"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/shared/page-header";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { MediaThumbnail } from "@/components/admin/media/media-thumbnail";
import {
  deleteMediaFileAction,
  type MediaFile,
} from "@/lib/actions/admin/media";
import { cn } from "@/lib/utils";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaPageClient({ files }: { files: MediaFile[] }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deleteUrl, setDeleteUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error ?? "خطا در آپلود");
          return;
        }
        toast.success("فایل آپلود شد");
        router.refresh();
      } catch {
        toast.error("خطا در آپلود");
      } finally {
        setUploading(false);
      }
    },
    [router],
  );

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) await uploadFile(file);
  }

  async function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) await uploadFile(file);
    e.target.value = "";
  }

  async function handleDelete() {
    if (!deleteUrl) return;
    setLoading(true);
    const result = await deleteMediaFileAction(deleteUrl);
    setLoading(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("فایل حذف شد");
    setDeleteUrl(null);
    router.refresh();
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    toast.success("آدرس کپی شد");
  }

  return (
    <>
      <PageHeader
        title="رسانه"
        description="مدیریت فایل‌های آپلود شده"
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "mb-5 flex flex-wrap items-center gap-3 rounded-lg border border-dashed bg-white p-3 transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25",
        )}
      >
        {uploading ? (
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        ) : (
          <Upload className="size-6 text-muted-foreground" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">آپلود رسانه جدید</p>
          <p className="text-xs text-muted-foreground">
            فایل را اینجا رها کنید یا انتخاب کنید
          </p>
        </div>
        <label>
          <input
            type="file"
            className="sr-only"
            accept="image/*,application/pdf,video/mp4,video/webm"
            onChange={handleFileInput}
            disabled={uploading}
          />
          <Button type="button" variant="outline" asChild disabled={uploading}>
            <span>انتخاب فایل</span>
          </Button>
        </label>
      </div>

      {files.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          هنوز فایلی آپلود نشده است
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12">
          {files.map((file) => (
            <div
              key={file.url}
              className="group relative overflow-hidden rounded-md border bg-white"
            >
              <div className="aspect-square">
                <MediaThumbnail
                  file={file}
                  sizes="(max-width: 640px) 33vw, (max-width: 1024px) 16vw, 10vw"
                />
              </div>
              <div className="border-t px-1.5 py-1">
                <p
                  className="truncate text-[10px] font-medium"
                  title={file.name}
                  dir="ltr"
                >
                  {file.name}
                </p>
                <p className="text-[9px] text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <div className="absolute end-1 top-1 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon-xs"
                  className="shadow"
                  title="کپی آدرس"
                  aria-label="کپی آدرس"
                  onClick={() => copyUrl(file.url)}
                >
                  <Copy className="size-3" />
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-xs"
                  className="shadow"
                  title="حذف فایل"
                  aria-label="حذف فایل"
                  onClick={() => setDeleteUrl(file.url)}
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteUrl}
        onOpenChange={(o) => !o && setDeleteUrl(null)}
        title="حذف فایل"
        description="آیا از حذف این فایل مطمئن هستید؟"
        confirmLabel="حذف"
        variant="destructive"
        loading={loading}
        onConfirm={handleDelete}
      />
    </>
  );
}
