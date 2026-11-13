"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  FileText,
  HardDrive,
  Link2,
  Maximize2,
  Music,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MediaFile, MediaUsage } from "@/lib/actions/admin/media";
import { MEDIA_KIND_LABELS, type MediaKind } from "@/lib/media-types";
import { formatFileSize } from "@/lib/product-file-types";
import { cn } from "@/lib/utils";

const dateFormat = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Tehran",
});

export function MediaPreviewDialog({
  file,
  usage,
  onClose,
  onPrev,
  onNext,
  onDelete,
  onCopy,
  position,
}: {
  file: MediaFile | null;
  usage: MediaUsage[];
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onDelete: (file: MediaFile) => void;
  onCopy: (url: string) => void;
  position: { index: number; total: number };
}) {
  const [dimensions, setDimensions] = useState<{ url: string; w: number; h: number } | null>(null);
  const [copied, setCopied] = useState(false);

  // RTL: → goes to the previous item, ← to the next.
  useEffect(() => {
    if (!file) return;
    const handler = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && ["INPUT", "TEXTAREA", "VIDEO", "AUDIO"].includes(event.target.tagName)) return;
      if (event.key === "ArrowLeft" && onNext) onNext();
      if (event.key === "ArrowRight" && onPrev) onPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [file, onNext, onPrev]);

  if (!file) return null;
  const kind = file.type as MediaKind | "other";
  const absoluteUrl = typeof window !== "undefined" ? `${window.location.origin}${file.url}` : file.url;
  const dims = dimensions?.url === file.url ? dimensions : null;

  function copy() {
    onCopy(file!.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Dialog open={Boolean(file)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        dir="rtl"
        className="flex max-h-[92vh] w-[calc(100vw-1.5rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl lg:flex-row"
      >
        {/* Stage */}
        <div className="relative flex min-h-64 flex-1 items-center justify-center bg-[#0f0f17] lg:min-h-[32rem]">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.15] [background-image:linear-gradient(45deg,#fff_25%,transparent_25%),linear-gradient(-45deg,#fff_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#fff_75%),linear-gradient(-45deg,transparent_75%,#fff_75%)] [background-position:0_0,0_8px,8px_-8px,-8px_0] [background-size:16px_16px]"
          />
          {kind === "image" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={file.url}
              src={file.url}
              alt={file.name}
              className="relative max-h-[60vh] max-w-full object-contain lg:max-h-[80vh]"
              onLoad={(e) =>
                setDimensions({ url: file.url, w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })
              }
            />
          )}
          {kind === "video" && (
            <video key={file.url} src={file.url} controls className="relative max-h-[60vh] w-full lg:max-h-[80vh]" />
          )}
          {kind === "audio" && (
            <div className="relative flex w-full max-w-sm flex-col items-center gap-5 p-6">
              <span className="flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#2d6a6a] to-[#9b8ec4] text-white shadow-2xl">
                <Music className="size-9" />
              </span>
              <audio key={file.url} src={file.url} controls className="w-full" />
            </div>
          )}
          {kind === "document" && (
            <iframe key={file.url} src={file.url} title={file.name} className="relative h-[60vh] w-full bg-white lg:h-full" />
          )}
          {kind === "other" && <FileText className="relative size-16 text-white/40" />}

          {(onPrev || onNext) && (
            <>
              <button
                type="button"
                onClick={onPrev}
                disabled={!onPrev}
                aria-label="فایل قبلی"
                className="absolute inset-y-0 start-2 my-auto flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60 disabled:opacity-0"
              >
                <ChevronRight className="size-5" />
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={!onNext}
                aria-label="فایل بعدی"
                className="absolute inset-y-0 end-2 my-auto flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60 disabled:opacity-0"
              >
                <ChevronLeft className="size-5" />
              </button>
            </>
          )}
          <span className="absolute bottom-3 start-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] text-white/80 backdrop-blur">
            {(position.index + 1).toLocaleString("fa-IR")} از {position.total.toLocaleString("fa-IR")}
          </span>
        </div>

        {/* Details */}
        <aside className="flex w-full shrink-0 flex-col overflow-y-auto border-t lg:w-80 lg:border-t-0 lg:border-s">
          <div className="space-y-1 border-b p-5 pe-12">
            <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              {kind === "other" ? "فایل" : MEDIA_KIND_LABELS[kind]}
            </span>
            <DialogTitle className="break-all text-base leading-7" dir="auto">
              {file.name}
            </DialogTitle>
            <DialogDescription className="sr-only">جزئیات و پیش‌نمایش فایل رسانه</DialogDescription>
          </div>

          <dl className="space-y-3 border-b p-5 text-sm">
            <div className="flex items-center gap-2.5">
              <HardDrive className="size-4 text-muted-foreground" />
              <dt className="text-muted-foreground">حجم</dt>
              <dd className="ms-auto font-medium">{formatFileSize(file.size)}</dd>
            </div>
            {dims && (
              <div className="flex items-center gap-2.5">
                <Maximize2 className="size-4 text-muted-foreground" />
                <dt className="text-muted-foreground">ابعاد</dt>
                <dd className="ms-auto font-medium tabular-nums" dir="ltr">
                  {dims.w.toLocaleString("fa-IR")} × {dims.h.toLocaleString("fa-IR")}
                </dd>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <CalendarDays className="size-4 text-muted-foreground" />
              <dt className="text-muted-foreground">آپلود</dt>
              <dd className="ms-auto text-xs font-medium">{dateFormat.format(new Date(file.createdAt))}</dd>
            </div>
          </dl>

          <div className="space-y-2 border-b p-5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Link2 className="size-3.5" />
              آدرس فایل
            </label>
            <div className="flex gap-1.5">
              <input
                readOnly
                dir="ltr"
                value={absoluteUrl}
                onFocus={(e) => e.currentTarget.select()}
                className="h-9 min-w-0 flex-1 rounded-md border bg-slate-50 px-2.5 text-xs text-muted-foreground outline-none focus:border-ring"
              />
              <Button type="button" size="icon" variant="outline" onClick={copy} aria-label="کپی آدرس">
                {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <Button asChild variant="outline" size="sm">
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3.5" />
                  باز کردن
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href={file.url} download={file.name}>
                  <Download className="size-3.5" />
                  دانلود
                </a>
              </Button>
            </div>
          </div>

          <div className="flex-1 space-y-2 p-5">
            <p className="text-xs font-medium text-muted-foreground">محل استفاده</p>
            {usage.length ? (
              <ul className="space-y-1.5">
                {usage.map((u) => (
                  <li key={u.href}>
                    <Link
                      href={u.href}
                      className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/60 px-2.5 py-2 text-xs text-emerald-900 transition-colors hover:bg-emerald-50"
                    >
                      <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span className="truncate">{u.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-muted-foreground">
                این فایل در هیچ بخشی از سایت استفاده نشده است.
              </p>
            )}
          </div>

          <div className="border-t p-4">
            <Button
              type="button"
              variant="ghost"
              className={cn("w-full text-destructive hover:bg-destructive/10 hover:text-destructive")}
              onClick={() => onDelete(file)}
            >
              {usage.length ? <AlertTriangle className="size-4" /> : <Trash2 className="size-4" />}
              حذف فایل
            </Button>
          </div>
        </aside>
      </DialogContent>
    </Dialog>
  );
}
