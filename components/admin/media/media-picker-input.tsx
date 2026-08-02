"use client";

import * as React from "react";
import { Check, Images, Loader2, RefreshCw, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MediaThumbnail } from "@/components/admin/media/media-thumbnail";
import {
  getMediaFilesAction,
  type MediaFile,
} from "@/lib/actions/admin/media";
import { cn } from "@/lib/utils";

type MediaPickerInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "readOnly" | "value"
> & {
  value?: string | null;
  onValueChange: (value: string) => void;
  allowClear?: boolean;
};

let cachedImageFiles: MediaFile[] | null = null;

export const MediaPickerInput = React.forwardRef<
  HTMLInputElement,
  MediaPickerInputProps
>(function MediaPickerInput(
  {
    value,
    onValueChange,
    allowClear = false,
    disabled,
    className,
    placeholder = "برای انتخاب تصویر از رسانه کلیک کنید",
    ...inputProps
  },
  ref,
) {
  const [open, setOpen] = React.useState(false);
  const [files, setFiles] = React.useState<MediaFile[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const normalizedValue = value ?? "";

  const loadFiles = React.useCallback(async () => {
    setLoading(true);
    try {
      const mediaFiles = await getMediaFilesAction();
      const imageFiles = mediaFiles.filter((file) => file.type === "image");
      cachedImageFiles = imageFiles;
      setFiles(imageFiles);
    } catch {
      toast.error("دریافت رسانه‌ها ناموفق بود");
    } finally {
      setLoading(false);
    }
  }, []);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen && files === null && !loading) {
      if (cachedImageFiles) {
        setFiles(cachedImageFiles);
      } else {
        void loadFiles();
      }
    }
  }

  const visibleFiles = React.useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fa");
    if (!normalizedQuery) return files ?? [];
    return (files ?? []).filter(
      (file) =>
        file.name.toLocaleLowerCase("fa").includes(normalizedQuery) ||
        file.url.toLocaleLowerCase("fa").includes(normalizedQuery),
    );
  }, [files, query]);

  function selectFile(file: MediaFile) {
    onValueChange(file.url);
    setOpen(false);
  }

  return (
    <>
      <div className="flex gap-2" dir="ltr">
        <Input
          {...inputProps}
          ref={ref}
          value={normalizedValue}
          readOnly
          disabled={disabled}
          placeholder={placeholder}
          title={normalizedValue || undefined}
          className={cn("cursor-pointer text-left", className)}
          onClick={() => !disabled && handleOpenChange(true)}
        />
        {allowClear && normalizedValue ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled}
            aria-label="پاک کردن تصویر"
            title="پاک کردن تصویر"
            onClick={() => onValueChange("")}
          >
            <X className="size-4" />
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => handleOpenChange(true)}
          dir="rtl"
        >
          <Images className="size-4" />
          انتخاب
        </Button>
      </div>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="flex max-h-[88vh] flex-col gap-4 p-4 sm:max-w-5xl"
          dir="rtl"
        >
          <DialogHeader className="shrink-0 text-right sm:text-right">
            <DialogTitle>انتخاب از رسانه‌ها</DialogTitle>
            <DialogDescription>
              با انتخاب هر تصویر، آدرس آن به‌صورت خودکار در فرم قرار می‌گیرد.
            </DialogDescription>
          </DialogHeader>

          <div className="flex shrink-0 gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="جستجو در رسانه‌ها..."
                className="ps-9"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={loading}
              aria-label="بروزرسانی رسانه‌ها"
              title="بروزرسانی رسانه‌ها"
              onClick={() => void loadFiles()}
            >
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            </Button>
          </div>

          <div className="min-h-56 flex-1 overflow-y-auto rounded-lg border bg-muted/20 p-2">
            {loading && files === null ? (
              <div className="flex h-56 items-center justify-center">
                <Loader2 className="size-7 animate-spin text-muted-foreground" />
              </div>
            ) : visibleFiles.length === 0 ? (
              <div className="flex h-56 flex-col items-center justify-center gap-2 text-center">
                <Images className="size-8 text-muted-foreground" />
                <p className="text-sm font-medium">تصویری پیدا نشد</p>
                <p className="text-xs text-muted-foreground">
                  ابتدا تصویر را در بخش رسانه آپلود کنید.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8">
                {visibleFiles.map((file) => {
                  const selected = normalizedValue === file.url;
                  return (
                    <button
                      key={file.url}
                      type="button"
                      title={file.url}
                      onClick={() => selectFile(file)}
                      className={cn(
                        "group relative overflow-hidden rounded-md border bg-background text-start outline-none transition hover:border-primary hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring",
                        selected && "border-primary ring-2 ring-primary/20",
                      )}
                    >
                      <div className="aspect-square">
                        <MediaThumbnail file={file} sizes="120px" />
                      </div>
                      {selected ? (
                        <span className="absolute end-1 top-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                          <Check className="size-3" />
                        </span>
                      ) : null}
                      <p
                        className="truncate border-t px-1.5 py-1 text-[10px] font-medium"
                        dir="ltr"
                      >
                        {file.name}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});
