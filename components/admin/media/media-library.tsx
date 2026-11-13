"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleSlash,
  Clipboard,
  Copy,
  FileText,
  FolderOpen,
  ImageIcon,
  LayoutGrid,
  List,
  Loader2,
  Music,
  RotateCw,
  Search,
  Trash2,
  UploadCloud,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { MediaPreviewDialog } from "@/components/admin/media/media-preview-dialog";
import {
  useMediaUploads,
  validateMediaFile,
  type UploadItem,
} from "@/components/admin/media/use-media-uploads";
import {
  deleteMediaFilesAction,
  type MediaFile,
  type MediaUsage,
} from "@/lib/actions/admin/media";
import { MEDIA_ACCEPT, MEDIA_KIND_LABELS, type MediaKind } from "@/lib/media-types";
import { formatFileSize } from "@/lib/product-file-types";
import { cn } from "@/lib/utils";

type Filter = "all" | MediaKind | "unused";
type Sort = "newest" | "oldest" | "largest" | "name";
type View = "grid" | "list";

const PAGE_SIZE = 60;
const fa = (n: number) => n.toLocaleString("fa-IR");
const shortDate = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Tehran",
});

const KIND_ICON: Record<MediaFile["type"], LucideIcon> = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  document: FileText,
  other: FileText,
};

const KIND_TINT: Record<MediaFile["type"], string> = {
  image: "bg-sky-50 text-sky-600",
  video: "bg-violet-50 text-violet-600",
  audio: "bg-amber-50 text-amber-600",
  document: "bg-rose-50 text-rose-600",
  other: "bg-slate-100 text-slate-500",
};

/* ------------------------------------------------------------------ */

function Thumb({ file, className }: { file: MediaFile; className?: string }) {
  const Icon = KIND_ICON[file.type];
  if (file.type === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={file.url} alt="" loading="lazy" decoding="async" className={cn("size-full object-cover", className)} />
    );
  }
  if (file.type === "video") {
    return (
      <div className={cn("relative size-full bg-slate-900", className)}>
        <video src={`${file.url}#t=0.5`} preload="metadata" muted className="size-full object-cover opacity-80" />
        <span className="absolute inset-0 m-auto flex size-9 items-center justify-center rounded-full bg-white/90 text-violet-600 shadow">
          <Video className="size-4" />
        </span>
      </div>
    );
  }
  return (
    <div className={cn("flex size-full flex-col items-center justify-center gap-2", KIND_TINT[file.type], className)}>
      <Icon className="size-8" />
      <span className="rounded bg-white/70 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide" dir="ltr">
        {file.name.split(".").pop()}
      </span>
    </div>
  );
}

function UploadPanel({
  items,
  onCancel,
  onRetry,
  onClear,
  onCancelAll,
}: {
  items: UploadItem[];
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  onClear: () => void;
  onCancelAll: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  if (!items.length) return null;
  const active = items.filter((i) => i.status === "queued" || i.status === "uploading");
  const done = items.filter((i) => i.status === "done").length;
  const failed = items.filter((i) => i.status === "error").length;
  const overall = Math.round(items.reduce((sum, i) => sum + (i.status === "done" ? 100 : i.progress), 0) / items.length);

  return (
    <div className="fixed bottom-4 end-4 z-40 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border bg-white shadow-2xl" role="region" aria-label="صف آپلود">
      <div className="flex items-center gap-3 bg-[#1e1e2d] px-4 py-3 text-white">
        {active.length ? <Loader2 className="size-4 animate-spin text-[#3fd0c6]" /> : failed ? <AlertCircle className="size-4 text-rose-300" /> : <CheckCircle2 className="size-4 text-emerald-300" />}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {active.length ? `در حال آپلود ${fa(active.length)} فایل` : `${fa(done)} فایل آپلود شد`}
          </p>
          <p className="text-[11px] text-white/60">
            {fa(done)} از {fa(items.length)} کامل{failed ? ` · ${fa(failed)} ناموفق` : ""}
          </p>
        </div>
        <button type="button" onClick={() => setCollapsed((v) => !v)} aria-label={collapsed ? "باز کردن" : "جمع کردن"} className="rounded-md p-1 hover:bg-white/10">
          <ChevronDown className={cn("size-4 transition-transform", collapsed && "rotate-180")} />
        </button>
        {active.length ? (
          <button type="button" onClick={onCancelAll} aria-label="لغو همه" className="rounded-md p-1 hover:bg-white/10">
            <X className="size-4" />
          </button>
        ) : (
          <button type="button" onClick={onClear} aria-label="بستن" className="rounded-md p-1 hover:bg-white/10">
            <X className="size-4" />
          </button>
        )}
      </div>
      {active.length > 0 && (
        <div className="h-1 bg-slate-100">
          <div className="h-full bg-[#0f9690] transition-[width] duration-300" style={{ width: `${overall}%` }} />
        </div>
      )}
      {!collapsed && (
        <ul className="max-h-72 divide-y overflow-y-auto">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 px-4 py-2.5">
              <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                {item.previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.previewUrl} alt="" className="size-full object-cover" />
                ) : (
                  <FileText className="size-4 text-slate-400" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium" dir="auto" title={item.file.name}>{item.file.name}</p>
                {item.status === "uploading" || item.status === "queued" ? (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-[#0f9690] transition-[width] duration-300" style={{ width: `${item.progress}%` }} />
                    </div>
                    <span className="w-8 text-left text-[10px] tabular-nums text-muted-foreground">
                      {item.status === "queued" ? "صف" : `${fa(item.progress)}٪`}
                    </span>
                  </div>
                ) : (
                  <p className={cn("mt-0.5 text-[11px]", item.status === "done" ? "text-emerald-700" : item.status === "error" ? "text-rose-600" : "text-muted-foreground")}>
                    {item.status === "done" ? `آپلود شد · ${formatFileSize(item.file.size)}` : item.status === "error" ? item.error : "لغو شد"}
                  </p>
                )}
              </div>
              {(item.status === "uploading" || item.status === "queued") && (
                <button type="button" onClick={() => onCancel(item.id)} aria-label="لغو" className="rounded-md p-1 text-muted-foreground hover:bg-slate-100">
                  <X className="size-3.5" />
                </button>
              )}
              {(item.status === "error" || item.status === "canceled") && !validateMediaFile(item.file) && (
                <button type="button" onClick={() => onRetry(item.id)} aria-label="تلاش مجدد" className="rounded-md p-1 text-muted-foreground hover:bg-slate-100">
                  <RotateCw className="size-3.5" />
                </button>
              )}
              {item.status === "done" && <CheckCircle2 className="size-4 text-emerald-500" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function MediaLibrary({
  files: serverFiles,
  usage,
}: {
  files: MediaFile[];
  usage: Record<string, MediaUsage[]>;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [added, setAdded] = useState<MediaFile[]>([]);
  const [removed, setRemoved] = useState<Set<string>>(() => new Set());
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [view, setView] = useState<View>("grid");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string[] | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragDepth = useRef(0);

  const onUploaded = useCallback((file: MediaFile) => {
    setAdded((prev) => [file, ...prev]);
  }, []);
  const uploads = useMediaUploads(onUploaded);

  const files = useMemo(() => {
    const known = new Set(serverFiles.map((f) => f.url));
    return [...added.filter((f) => !known.has(f.url)), ...serverFiles].filter((f) => !removed.has(f.url));
  }, [serverFiles, added, removed]);

  const counts = useMemo(() => {
    const c = { all: files.length, image: 0, video: 0, audio: 0, document: 0, unused: 0, bytes: 0 };
    for (const f of files) {
      if (f.type !== "other") c[f.type] += 1;
      if (!usage[f.url]?.length) c.unused += 1;
      c.bytes += f.size;
    }
    return c;
  }, [files, usage]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = files.filter((f) => {
      if (filter === "unused" && usage[f.url]?.length) return false;
      if (filter !== "all" && filter !== "unused" && f.type !== filter) return false;
      return !q || f.name.toLowerCase().includes(q);
    });
    const sorted = [...list];
    if (sort === "oldest") sorted.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
    else if (sort === "largest") sorted.sort((a, b) => b.size - a.size);
    else if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name, "fa"));
    else sorted.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return sorted;
  }, [files, filter, query, sort, usage]);

  const shown = visible.slice(0, limit);
  const previewIndex = previewUrl ? visible.findIndex((f) => f.url === previewUrl) : -1;
  const previewFile = previewIndex >= 0 ? visible[previewIndex]! : null;

  const { addFiles } = uploads;
  const startUpload = useCallback(
    (list: FileList | File[] | null) => {
      if (!list || !list.length) return;
      const queued = addFiles(Array.from(list));
      if (queued < list.length) toast.error(`${fa(list.length - queued)} فایل مجاز نبود و رد شد`);
    },
    [addFiles],
  );

  // Page-wide drag & drop + paste.
  useEffect(() => {
    const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");
    const onEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepth.current += 1;
      setDragging(true);
    };
    const onOver = (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault();
    };
    const onLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setDragging(false);
    };
    const onDrop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      startUpload(e.dataTransfer?.files ?? null);
    };
    const onPaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      const pasted = Array.from(e.clipboardData?.files ?? []);
      if (!pasted.length) return;
      e.preventDefault();
      startUpload(
        pasted.map((f) =>
          f.name && f.name !== "image.png"
            ? f
            : new File([f], `pasted-${Date.now()}.${f.type.split("/")[1] ?? "png"}`, { type: f.type }),
        ),
      );
    };
    window.addEventListener("dragenter", onEnter);
    window.addEventListener("dragover", onOver);
    window.addEventListener("dragleave", onLeave);
    window.addEventListener("drop", onDrop);
    window.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("dragenter", onEnter);
      window.removeEventListener("dragover", onOver);
      window.removeEventListener("dragleave", onLeave);
      window.removeEventListener("drop", onDrop);
      window.removeEventListener("paste", onPaste);
    };
  }, [startUpload]);

  function copyLinks(urls: string[]) {
    const text = urls.map((u) => `${window.location.origin}${u}`).join("\n");
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(urls.length > 1 ? `${fa(urls.length)} آدرس کپی شد` : "آدرس کپی شد"))
      .catch(() => toast.error("کپی ناموفق بود"));
  }

  function toggleSelect(url: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    const result = await deleteMediaFilesAction(pendingDelete);
    setDeleting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    const { deleted, failed } = result.data;
    setRemoved((prev) => new Set([...prev, ...deleted]));
    setSelected((prev) => new Set([...prev].filter((u) => !deleted.includes(u))));
    if (previewUrl && deleted.includes(previewUrl)) setPreviewUrl(null);
    setPendingDelete(null);
    toast.success(deleted.length > 1 ? `${fa(deleted.length)} فایل حذف شد` : "فایل حذف شد");
    if (failed.length) toast.error(`${fa(failed.length)} فایل حذف نشد`);
    router.refresh();
  }

  const pendingInUse = (pendingDelete ?? []).filter((u) => usage[u]?.length);
  const selectionMode = selected.size > 0;

  const FILTERS: { id: Filter; label: string; count: number; icon: LucideIcon }[] = [
    { id: "all", label: "همه", count: counts.all, icon: FolderOpen },
    { id: "image", label: "تصویر", count: counts.image, icon: ImageIcon },
    { id: "video", label: "ویدیو", count: counts.video, icon: Video },
    { id: "audio", label: "صوت", count: counts.audio, icon: Music },
    { id: "document", label: "سند", count: counts.document, icon: FileText },
    { id: "unused", label: "بدون استفاده", count: counts.unused, icon: CircleSlash },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 pb-24">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={MEDIA_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          startUpload(e.target.files);
          e.target.value = "";
        }}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight md:text-3xl">کتابخانهٔ رسانه</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {fa(counts.all)} فایل · {formatFileSize(counts.bytes)} فضای مصرفی
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 text-xs text-muted-foreground md:inline-flex">
            <Clipboard className="size-3.5" />
            می‌توانید تصویر را با <kbd className="rounded border bg-white px-1 font-sans" dir="ltr">Ctrl+V</kbd> هم آپلود کنید
          </span>
          <Button type="button" className="h-10 rounded-xl bg-[#2d6a6a] px-5 hover:bg-[#245858]" onClick={() => inputRef.current?.click()}>
            <UploadCloud className="size-4" />
            آپلود فایل
          </Button>
        </div>
      </div>

      {/* Drop zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group relative flex w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border-2 border-dashed px-6 text-center transition-colors",
          "border-slate-300 bg-white hover:border-[#2d6a6a]/60 hover:bg-[#2d6a6a]/[0.03] focus-visible:border-[#2d6a6a] focus-visible:outline-none",
          counts.all === 0 ? "py-16" : "py-7 sm:flex-row sm:gap-5 sm:text-start",
        )}
      >
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2d6a6a] to-[#6f63a8] text-white shadow-lg shadow-[#2d6a6a]/25 transition-transform group-hover:-translate-y-0.5">
          <UploadCloud className="size-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-bold">
            {counts.all === 0 ? "اولین فایل‌ها را آپلود کنید" : "فایل‌ها را بکشید و اینجا رها کنید"}
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">
            یا کلیک کنید و چند فایل را هم‌زمان انتخاب کنید · تصویر تا ۱۰ مگابایت، ویدیو تا ۲۰۰، صوت و PDF تا ۵۰ مگابایت
          </span>
        </span>
        <span className="hidden shrink-0 flex-wrap justify-center gap-1.5 sm:flex">
          {(["image", "video", "audio", "document"] as const).map((k) => {
            const Icon = KIND_ICON[k];
            return (
              <span key={k} className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium", KIND_TINT[k])}>
                <Icon className="size-3" />
                {MEDIA_KIND_LABELS[k]}
              </span>
            );
          })}
        </span>
      </button>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border bg-white p-2 shadow-xs lg:flex-row lg:items-center">
        <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="نوع فایل">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => {
                setFilter(f.id);
                setLimit(PAGE_SIZE);
              }}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                filter === f.id ? "bg-[#1e1e2d] text-white" : "text-muted-foreground hover:bg-slate-100 hover:text-foreground",
              )}
            >
              <f.icon className="size-4" />
              {f.label}
              <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", filter === f.id ? "bg-white/15" : "bg-slate-100")}>
                {fa(f.count)}
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-1 items-center gap-2 lg:justify-end">
          <div className="relative min-w-0 flex-1 lg:max-w-64">
            <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setLimit(PAGE_SIZE);
              }}
              placeholder="جستجوی نام فایل…"
              className="h-9 rounded-xl ps-9"
            />
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger className="h-9 w-36 shrink-0 rounded-xl" aria-label="مرتب‌سازی">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">جدیدترین</SelectItem>
              <SelectItem value="oldest">قدیمی‌ترین</SelectItem>
              <SelectItem value="largest">بزرگ‌ترین</SelectItem>
              <SelectItem value="name">نام</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex shrink-0 rounded-xl border p-0.5" role="group" aria-label="نحوهٔ نمایش">
            {([["grid", LayoutGrid, "شبکه‌ای"], ["list", List, "فهرستی"]] as const).map(([id, Icon, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={view === id}
                aria-label={label}
                title={label}
                onClick={() => setView(id)}
                className={cn("flex size-8 items-center justify-center rounded-lg transition-colors", view === id ? "bg-slate-100 text-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                <Icon className="size-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed bg-white py-16 text-center">
          <FolderOpen className="size-8 text-slate-300" />
          <p className="text-sm font-medium">{files.length ? "فایلی با این مشخصات پیدا نشد" : "کتابخانه خالی است"}</p>
          {files.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => { setQuery(""); setFilter("all"); }}>
              پاک کردن فیلترها
            </Button>
          )}
        </div>
      ) : view === "grid" ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {shown.map((file) => {
            const isSelected = selected.has(file.url);
            const used = usage[file.url]?.length ?? 0;
            return (
              <li key={file.url} className="group relative">
                <button
                  type="button"
                  onClick={() => (selectionMode ? toggleSelect(file.url) : setPreviewUrl(file.url))}
                  className={cn(
                    "block w-full overflow-hidden rounded-2xl border bg-white text-start shadow-xs transition-[box-shadow,border-color,transform] hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#2d6a6a]/40",
                    isSelected && "border-[#2d6a6a] ring-2 ring-[#2d6a6a]",
                  )}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <Thumb file={file} className="transition-transform duration-300 group-hover:scale-[1.03]" />
                    {used > 0 && (
                      <span className="absolute bottom-2 start-2 inline-flex items-center gap-1 rounded-full bg-emerald-600/90 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
                        <Check className="size-3" />
                        در حال استفاده
                      </span>
                    )}
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="truncate text-[13px] font-medium" dir="auto" title={file.name}>{file.name}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {formatFileSize(file.size)} · {shortDate.format(new Date(file.createdAt))}
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isSelected}
                  aria-label={`انتخاب ${file.name}`}
                  onClick={() => toggleSelect(file.url)}
                  className={cn(
                    "absolute start-2 top-2 flex size-6 items-center justify-center rounded-lg border-2 shadow transition-opacity",
                    isSelected ? "border-[#2d6a6a] bg-[#2d6a6a] text-white opacity-100" : "border-white bg-black/20 text-transparent backdrop-blur",
                    !isSelected && !selectionMode && "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100",
                  )}
                >
                  <Check className="size-3.5" />
                </button>
                {!selectionMode && (
                  <div className="absolute end-2 top-2 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                    <button type="button" onClick={() => copyLinks([file.url])} aria-label="کپی آدرس" title="کپی آدرس" className="flex size-7 items-center justify-center rounded-lg bg-white/95 text-slate-700 shadow hover:bg-white">
                      <Copy className="size-3.5" />
                    </button>
                    <button type="button" onClick={() => setPendingDelete([file.url])} aria-label="حذف" title="حذف" className="flex size-7 items-center justify-center rounded-lg bg-white/95 text-rose-600 shadow hover:bg-white">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b bg-slate-50/80 text-xs text-muted-foreground">
                  <th className="w-10 px-4 py-2.5">
                    <input
                      type="checkbox"
                      aria-label="انتخاب همه"
                      className="size-4 accent-[#2d6a6a]"
                      checked={shown.length > 0 && shown.every((f) => selected.has(f.url))}
                      onChange={(e) => setSelected(e.target.checked ? new Set(shown.map((f) => f.url)) : new Set())}
                    />
                  </th>
                  <th className="px-2 py-2.5 text-start font-medium">فایل</th>
                  <th className="px-3 py-2.5 text-start font-medium">نوع</th>
                  <th className="px-3 py-2.5 text-start font-medium">حجم</th>
                  <th className="px-3 py-2.5 text-start font-medium">تاریخ</th>
                  <th className="px-3 py-2.5 text-start font-medium">استفاده</th>
                  <th className="w-24 px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {shown.map((file) => {
                  const used = usage[file.url] ?? [];
                  return (
                    <tr key={file.url} className={cn("transition-colors hover:bg-slate-50/70", selected.has(file.url) && "bg-[#2d6a6a]/5")}>
                      <td className="px-4 py-2">
                        <input type="checkbox" aria-label={`انتخاب ${file.name}`} className="size-4 accent-[#2d6a6a]" checked={selected.has(file.url)} onChange={() => toggleSelect(file.url)} />
                      </td>
                      <td className="px-2 py-2">
                        <button type="button" onClick={() => setPreviewUrl(file.url)} className="flex max-w-80 items-center gap-3 text-start">
                          <span className="size-10 shrink-0 overflow-hidden rounded-lg bg-slate-100"><Thumb file={file} /></span>
                          <span className="truncate font-medium hover:text-[#2d6a6a]" dir="auto">{file.name}</span>
                        </button>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{file.type === "other" ? "—" : MEDIA_KIND_LABELS[file.type]}</td>
                      <td className="whitespace-nowrap px-3 py-2 tabular-nums">{formatFileSize(file.size)}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{shortDate.format(new Date(file.createdAt))}</td>
                      <td className="px-3 py-2">
                        {used.length ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700" title={used.map((u) => u.label).join("\n")}>
                            <Check className="size-3" />
                            {fa(used.length)} مورد
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">بدون استفاده</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex justify-end gap-1">
                          <Button type="button" variant="ghost" size="icon-sm" aria-label="کپی آدرس" onClick={() => copyLinks([file.url])}><Copy className="size-4" /></Button>
                          <Button type="button" variant="ghost" size="icon-sm" aria-label="حذف" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => setPendingDelete([file.url])}><Trash2 className="size-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {visible.length > shown.length && (
        <div className="flex justify-center">
          <Button variant="outline" className="rounded-xl bg-white" onClick={() => setLimit((l) => l + PAGE_SIZE)}>
            نمایش بیشتر ({fa(visible.length - shown.length)} فایل دیگر)
          </Button>
        </div>
      )}

      {/* Selection bar */}
      {selectionMode && (
        <div className="fixed inset-x-0 bottom-4 z-30 mx-auto flex w-fit max-w-[calc(100vw-2rem)] items-center gap-2 rounded-2xl bg-[#1e1e2d] p-2 ps-4 text-white shadow-2xl">
          <span className="text-sm font-medium">{fa(selected.size)} فایل انتخاب شده</span>
          <span className="mx-1 h-5 w-px bg-white/15" />
          <Button type="button" size="sm" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={() => setSelected(new Set(visible.map((f) => f.url)))}>
            انتخاب همه
          </Button>
          <Button type="button" size="sm" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={() => copyLinks([...selected])}>
            <Copy className="size-4" />
            کپی آدرس‌ها
          </Button>
          <Button type="button" size="sm" className="bg-rose-500 text-white hover:bg-rose-600" onClick={() => setPendingDelete([...selected])}>
            <Trash2 className="size-4" />
            حذف
          </Button>
          <button type="button" aria-label="لغو انتخاب" onClick={() => setSelected(new Set())} className="rounded-lg p-1.5 hover:bg-white/10">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Full-page drop overlay */}
      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-[#1e1e2d]/70 p-6 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-white/40 px-16 py-14 text-center text-white">
            <span className="flex size-16 animate-bounce items-center justify-center rounded-2xl bg-white/15 motion-reduce:animate-none">
              <UploadCloud className="size-8" />
            </span>
            <p className="text-xl font-bold">رها کنید تا آپلود شود</p>
            <p className="text-sm text-white/70">می‌توانید چند فایل را هم‌زمان رها کنید</p>
          </div>
        </div>
      )}

      <UploadPanel
        items={uploads.items}
        onCancel={uploads.cancel}
        onRetry={uploads.retry}
        onClear={uploads.clearFinished}
        onCancelAll={uploads.cancelAll}
      />

      <MediaPreviewDialog
        file={previewFile}
        usage={previewFile ? usage[previewFile.url] ?? [] : []}
        position={{ index: previewIndex, total: visible.length }}
        onClose={() => setPreviewUrl(null)}
        onPrev={previewIndex > 0 ? () => setPreviewUrl(visible[previewIndex - 1]!.url) : undefined}
        onNext={previewIndex >= 0 && previewIndex < visible.length - 1 ? () => setPreviewUrl(visible[previewIndex + 1]!.url) : undefined}
        onDelete={(file) => setPendingDelete([file.url])}
        onCopy={(url) => copyLinks([url])}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title={pendingDelete && pendingDelete.length > 1 ? `حذف ${fa(pendingDelete.length)} فایل` : "حذف فایل"}
        description={
          pendingInUse.length
            ? `${pendingInUse.length > 1 ? `${fa(pendingInUse.length)} فایل از این موارد` : "این فایل"} در سایت استفاده شده است (${pendingInUse
                .flatMap((u) => usage[u] ?? [])
                .slice(0, 3)
                .map((u) => u.label)
                .join("، ")}). با حذف، تصویر در آن بخش‌ها نمایش داده نمی‌شود. این کار قابل بازگشت نیست.`
            : "فایل برای همیشه از سرور حذف می‌شود و قابل بازگشت نیست."
        }
        confirmLabel="حذف"
        variant="destructive"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
