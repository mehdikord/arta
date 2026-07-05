"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Copy, FileText, Loader2, Trash2, Upload, Video } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/shared/page-header";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
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
          "mb-8 flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-white p-12 transition-colors",
          dragOver
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25",
        )}
      >
        {uploading ? (
          <Loader2 className="size-10 animate-spin text-muted-foreground" />
        ) : (
          <Upload className="size-10 text-muted-foreground" />
        )}
        <p className="mt-4 text-sm font-medium">
          فایل را اینجا رها کنید یا انتخاب کنید
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          تصویر، PDF، ویدئو (حداکثر ۵–۲۰ مگابایت)
        </p>
        <label className="mt-4">
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {files.map((file) => (
            <div
              key={file.url}
              className="group overflow-hidden rounded-xl border bg-white shadow-sm"
            >
              <div className="relative aspect-square bg-muted/30">
                {file.type === "image" ? (
                  <Image
                    src={file.url}
                    alt={file.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    {file.type === "video" ? (
                      <Video className="size-12 text-muted-foreground" />
                    ) : (
                      <FileText className="size-12 text-muted-foreground" />
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2 p-3">
                <p className="truncate text-sm font-medium" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
                <p
                  className="truncate text-xs text-muted-foreground font-mono"
                  dir="ltr"
                  title={file.url}
                >
                  {file.url}
                </p>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => copyUrl(file.url)}
                  >
                    <Copy className="size-3.5" />
                    کپی
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteUrl(file.url)}
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
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
