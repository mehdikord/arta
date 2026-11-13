"use client";

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";
import { useFieldArray, useWatch, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import {
  AlertCircle,
  Archive,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  FileText,
  Loader2,
  Lock,
  Music,
  Play,
  RefreshCw,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { PRODUCT_FILE_KIND_LABELS } from "@/lib/admin/format";
import {
  PRODUCT_FILE_ACCEPT,
  PRODUCT_FILE_GROUPS,
  formatFileSize,
  getProductFileTypeInfo,
  type ProductFileKindValue,
} from "@/lib/product-file-types";
import type { ProductInput } from "@/lib/validations/admin/product";
import { cn } from "@/lib/utils";

const UPLOAD_ENDPOINT = "/api/admin/products/upload";
const PRIVATE_FILE_KEY_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-[a-zA-Z0-9._-]{1,120}$/;

const KIND_STYLES: Record<
  ProductFileKindValue,
  { icon: typeof FileText; className: string }
> = {
  TEXT: { icon: FileText, className: "bg-sky-50 text-sky-600 ring-sky-100" },
  VIDEO: { icon: Play, className: "bg-violet-50 text-violet-600 ring-violet-100" },
  AUDIO: { icon: Music, className: "bg-amber-50 text-amber-600 ring-amber-100" },
  ARCHIVE: { icon: Archive, className: "bg-slate-100 text-slate-600 ring-slate-200" },
};

type UploadResponse = {
  storageKey?: string;
  filename?: string;
  size?: number;
  kind?: ProductFileKindValue;
  error?: string;
};

type RowUpload = {
  status: "uploading" | "done" | "error";
  progress: number;
  fileName: string;
  size: number;
  error?: string;
  /** Kept for "retry" after a failed upload. */
  file?: File;
};

export function createClientId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Original file name as shown in the admin UI. */
function originalNameOf(storageKey: string): string {
  if (PRIVATE_FILE_KEY_PATTERN.test(storageKey)) return storageKey.slice(37);
  if (storageKey.startsWith("/files/") || storageKey.startsWith("/uploads/")) {
    return storageKey.split("/").pop() ?? storageKey;
  }
  return storageKey;
}

/** "my_lesson-01.pdf" → "my lesson 01" */
function displayNameFromFile(name: string): string {
  const dot = name.lastIndexOf(".");
  const stem = dot > 0 ? name.slice(0, dot) : name;
  return stem.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 191) || name;
}

function httpErrorMessage(status: number): string {
  if (status === 401) return "نشست شما منقضی شده؛ دوباره وارد شوید";
  if (status === 413) return "حجم فایل بیش از حد مجاز سرور است";
  if (status === 415) return "این نوع فایل مجاز نیست";
  if (status >= 500) return "خطای سرور هنگام ذخیرهٔ فایل";
  return "آپلود فایل ناموفق بود";
}

function discardUnsavedUpload(storageKey: string) {
  void fetch(`${UPLOAD_ENDPOINT}?key=${encodeURIComponent(storageKey)}`, {
    method: "DELETE",
    keepalive: true,
  }).catch(() => undefined);
}

export function ProductFilesField({
  form,
  disabled,
  maxUploadSize,
  freshKeysRef,
  onBusyChange,
}: {
  form: UseFormReturn<ProductInput>;
  disabled: boolean;
  maxUploadSize: number;
  /** Storage keys uploaded in this session and not yet saved to the package. */
  freshKeysRef: MutableRefObject<Set<string>>;
  onBusyChange: (busy: boolean) => void;
}) {
  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "files",
  });
  const rows = useWatch({ control: form.control, name: "files" }) ?? [];
  const [uploads, setUploads] = useState<Record<string, RowUpload>>({});
  const [dragActive, setDragActive] = useState(false);
  const requests = useRef(new Map<string, XMLHttpRequest>());
  const dragDepth = useRef(0);

  const uploadingCount = Object.values(uploads).filter(
    (u) => u.status === "uploading",
  ).length;

  useEffect(() => {
    onBusyChange(uploadingCount > 0);
  }, [uploadingCount, onBusyChange]);

  useEffect(() => {
    const active = requests.current;
    return () => active.forEach((request) => request.abort());
  }, []);

  const patchUpload = useCallback((clientId: string, patch: Partial<RowUpload> | null) => {
    setUploads((prev) => {
      const next = { ...prev };
      if (patch === null) {
        delete next[clientId];
      } else {
        const base: RowUpload = prev[clientId] ?? {
          status: "uploading",
          progress: 0,
          fileName: "",
          size: 0,
        };
        next[clientId] = { ...base, ...patch };
      }
      return next;
    });
  }, []);

  const discardIfFresh = useCallback(
    (storageKey: string | undefined) => {
      if (storageKey && freshKeysRef.current.delete(storageKey)) {
        discardUnsavedUpload(storageKey);
      }
    },
    [freshKeysRef],
  );

  function validateFile(file: File): string | null {
    if (!getProductFileTypeInfo(file.name)) {
      return `نوع فایل «${file.name}» مجاز نیست`;
    }
    if (file.size === 0) return `فایل «${file.name}» خالی است`;
    if (file.size > maxUploadSize) {
      return `حجم «${file.name}» بیشتر از ${formatFileSize(maxUploadSize)} است`;
    }
    return null;
  }

  function findRowIndex(clientId: string): number {
    return (form.getValues("files") ?? []).findIndex((f) => f.clientId === clientId);
  }

  function startUpload(clientId: string, file: File) {
    requests.current.get(clientId)?.abort();

    const request = new XMLHttpRequest();
    requests.current.set(clientId, request);
    patchUpload(clientId, {
      status: "uploading",
      progress: 0,
      fileName: file.name,
      size: file.size,
      error: undefined,
      file,
    });

    request.open("POST", UPLOAD_ENDPOINT);
    request.setRequestHeader("Content-Type", "application/octet-stream");
    request.setRequestHeader("X-File-Name", encodeURIComponent(file.name));

    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        patchUpload(clientId, {
          progress: Math.min(99, Math.round((event.loaded / event.total) * 100)),
        });
      }
    });

    request.addEventListener("load", () => {
      requests.current.delete(clientId);
      let response: UploadResponse = {};
      try {
        response = JSON.parse(request.responseText) as UploadResponse;
      } catch {
        response = {};
      }

      const ok =
        request.status >= 200 &&
        request.status < 300 &&
        response.storageKey &&
        response.kind;
      if (!ok) {
        const message = response.error ?? httpErrorMessage(request.status);
        patchUpload(clientId, { status: "error", progress: 0, error: message });
        toast.error(message);
        return;
      }

      const index = findRowIndex(clientId);
      if (index < 0) {
        // Row was removed while uploading.
        discardUnsavedUpload(response.storageKey!);
        return;
      }

      const previousKey = form.getValues(`files.${index}.storageKey`);
      freshKeysRef.current.add(response.storageKey!);
      form.setValue(`files.${index}.storageKey`, response.storageKey!, {
        shouldDirty: true,
        shouldValidate: true,
      });
      form.setValue(`files.${index}.kind`, response.kind!, { shouldDirty: true });
      if (previousKey && previousKey !== response.storageKey) {
        discardIfFresh(previousKey);
      }
      patchUpload(clientId, { status: "done", progress: 100, file: undefined });
    });

    request.addEventListener("error", () => {
      requests.current.delete(clientId);
      const message = "ارتباط هنگام آپلود قطع شد";
      patchUpload(clientId, { status: "error", progress: 0, error: message });
      toast.error(`${message}: ${file.name}`);
    });

    request.addEventListener("abort", () => {
      requests.current.delete(clientId);
    });

    request.send(file);
  }

  function addFiles(list: FileList | File[]) {
    const incoming = Array.from(list);
    if (incoming.length === 0) return;

    const errors: string[] = [];
    let added = 0;
    for (const file of incoming) {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
        continue;
      }
      const clientId = createClientId();
      append(
        {
          clientId,
          displayName: displayNameFromFile(file.name),
          storageKey: "",
          kind: getProductFileTypeInfo(file.name)!.kind,
          sortOrder: (form.getValues("files")?.length ?? 0),
        },
        { shouldFocus: false },
      );
      startUpload(clientId, file);
      added += 1;
    }
    if (errors.length) toast.error(errors.join("\n"));
    if (added > 0) form.clearErrors("files");
  }

  function replaceFile(clientId: string, file: File | undefined) {
    if (!file) return;
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    const index = findRowIndex(clientId);
    if (index >= 0) {
      form.setValue(
        `files.${index}.kind`,
        getProductFileTypeInfo(file.name)!.kind,
      );
    }
    startUpload(clientId, file);
  }

  function cancelUpload(clientId: string, index: number) {
    requests.current.get(clientId)?.abort();
    requests.current.delete(clientId);
    const storageKey = form.getValues(`files.${index}.storageKey`);
    if (!storageKey) {
      remove(index);
      patchUpload(clientId, null);
    } else {
      // Keep the previous (still valid) file of this row.
      patchUpload(clientId, null);
    }
  }

  function removeRow(index: number, clientId: string | undefined) {
    if (clientId) {
      requests.current.get(clientId)?.abort();
      requests.current.delete(clientId);
      patchUpload(clientId, null);
    }
    discardIfFresh(form.getValues(`files.${index}.storageKey`));
    remove(index);
  }

  const rootError = form.formState.errors.files?.root?.message ??
    form.formState.errors.files?.message;

  return (
    <div className="space-y-4">
      <label
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
          "hover:border-primary/60 hover:bg-primary/5 focus-within:border-primary focus-within:ring-3 focus-within:ring-ring/20",
          dragActive ? "border-primary bg-primary/10" : "border-border bg-muted/20",
          rootError && "border-destructive/60 bg-destructive/5",
          disabled && "pointer-events-none opacity-60",
        )}
        onDragEnter={(event) => {
          event.preventDefault();
          dragDepth.current += 1;
          setDragActive(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => {
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (dragDepth.current === 0) setDragActive(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          dragDepth.current = 0;
          setDragActive(false);
          if (!disabled) addFiles(event.dataTransfer.files);
        }}
      >
        <input
          type="file"
          multiple
          className="sr-only"
          accept={PRODUCT_FILE_ACCEPT}
          disabled={disabled}
          onChange={(event) => {
            if (event.target.files) addFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UploadCloud className="size-6" />
        </span>
        <span className="text-sm font-semibold">
          {dragActive ? "فایل‌ها را رها کنید" : "فایل‌ها را اینجا بکشید یا برای انتخاب کلیک کنید"}
        </span>
        <span className="text-xs text-muted-foreground">
          امکان انتخاب چند فایل هم‌زمان · حداکثر {formatFileSize(maxUploadSize)} برای هر فایل
        </span>
        <span className="mt-1 flex flex-wrap justify-center gap-1.5">
          {PRODUCT_FILE_GROUPS.map((group) => {
            const Icon = KIND_STYLES[group.kind].icon;
            return (
              <span
                key={group.kind}
                title={group.extensions.join("، ")}
                className="inline-flex items-center gap-1 rounded-full border bg-white px-2.5 py-1 text-[11px] text-muted-foreground"
              >
                <Icon className="size-3" />
                {group.label}
              </span>
            );
          })}
        </span>
      </label>

      {rootError && (
        <p className="flex items-center gap-1.5 text-sm text-destructive">
          <AlertCircle className="size-4" />
          {rootError}
        </p>
      )}

      {fields.length > 0 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {fields.length.toLocaleString("fa-IR")} فایل
            {uploadingCount > 0 &&
              ` · ${uploadingCount.toLocaleString("fa-IR")} فایل در حال آپلود`}
          </span>
          <span>ترتیب نمایش با دکمه‌های بالا/پایین تغییر می‌کند</span>
        </div>
      )}

      <ul className="space-y-3">
        {fields.map((field, index) => {
          const row = rows[index];
          const clientId = row?.clientId ?? field.clientId;
          const upload = clientId ? uploads[clientId] : undefined;
          const kind = (row?.kind ?? "TEXT") as ProductFileKindValue;
          const { icon: KindIcon, className: kindClass } = KIND_STYLES[kind];
          const storageKey = row?.storageKey ?? "";
          const isUploading = upload?.status === "uploading";
          const isError = upload?.status === "error";
          // Uploaded in this session but not yet saved to the package.
          const isFresh = Boolean(storageKey) && upload?.status === "done";
          const fileName = upload?.fileName || (storageKey ? originalNameOf(storageKey) : "");

          return (
            <li
              key={field.id}
              className={cn(
                "rounded-xl border bg-white p-3 transition-colors sm:p-4",
                isError && "border-destructive/40 bg-destructive/[0.02]",
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "relative flex size-11 shrink-0 items-center justify-center rounded-lg ring-1",
                    kindClass,
                  )}
                >
                  <KindIcon className="size-5" />
                  <span className="absolute -top-1.5 -start-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                    {(index + 1).toLocaleString("fa-IR")}
                  </span>
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <FormField
                    control={form.control}
                    name={`files.${index}.displayName`}
                    render={({ field: input }) => (
                      <FormItem className="gap-1">
                        <FormControl>
                          <Input
                            {...input}
                            aria-label={`نام نمایشی فایل ${index + 1}`}
                            placeholder="عنوانی که به خریدار نمایش داده می‌شود"
                            disabled={disabled}
                            className="h-9 font-medium"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <span className="rounded bg-muted px-1.5 py-0.5 font-medium text-foreground/70">
                      {PRODUCT_FILE_KIND_LABELS[kind]}
                    </span>
                    {fileName && (
                      <span className="max-w-full truncate sm:max-w-72" dir="ltr" title={fileName}>
                        {fileName}
                      </span>
                    )}
                    {upload?.size ? <span>· {formatFileSize(upload.size)}</span> : null}
                    {!isUploading && !isError && storageKey && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1",
                          isFresh ? "text-amber-700" : "text-emerald-700",
                        )}
                      >
                        {isFresh ? <CheckCircle2 className="size-3.5" /> : <Lock className="size-3.5" />}
                        {isFresh ? "آپلود شد · پس از ذخیره فعال می‌شود" : "ذخیره‌شده در فضای خصوصی"}
                      </span>
                    )}
                  </div>

                  {isUploading && (
                    <div className="flex items-center gap-3" role="status" aria-live="polite">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-[width] duration-300"
                          style={{ width: `${upload.progress}%` }}
                        />
                      </div>
                      <span className="w-10 text-left text-xs font-semibold tabular-nums text-primary">
                        {upload.progress.toLocaleString("fa-IR")}٪
                      </span>
                    </div>
                  )}

                  {isError && (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-destructive">
                      <AlertCircle className="size-3.5" />
                      <span>{upload.error}</span>
                      {upload.file && (
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          disabled={disabled}
                          onClick={() => clientId && startUpload(clientId, upload.file!)}
                        >
                          <RefreshCw className="size-3" />
                          تلاش مجدد
                        </Button>
                      )}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name={`files.${index}.storageKey`}
                    render={() => (
                      <FormItem className={cn((isUploading || isError) && "hidden")}>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-center">
                  {isUploading ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      title="لغو آپلود"
                      aria-label="لغو آپلود"
                      onClick={() => clientId && cancelUpload(clientId, index)}
                    >
                      <X className="size-4" />
                    </Button>
                  ) : (
                    <>
                      <div className="flex items-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          title="انتقال به بالا"
                          aria-label="انتقال به بالا"
                          disabled={disabled || index === 0}
                          onClick={() => move(index, index - 1)}
                        >
                          <ArrowUp className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          title="انتقال به پایین"
                          aria-label="انتقال به پایین"
                          disabled={disabled || index === fields.length - 1}
                          onClick={() => move(index, index + 1)}
                        >
                          <ArrowDown className="size-4" />
                        </Button>
                      </div>
                      <label
                        title="جایگزینی فایل"
                        className={cn(
                          "relative inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-within:ring-3 focus-within:ring-ring/30",
                          disabled && "pointer-events-none opacity-50",
                        )}
                      >
                        <RefreshCw className="size-4" />
                        <span className="sr-only">جایگزینی فایل</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept={PRODUCT_FILE_ACCEPT}
                          disabled={disabled}
                          onChange={(event) => {
                            if (clientId) replaceFile(clientId, event.target.files?.[0]);
                            event.target.value = "";
                          }}
                        />
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        title="حذف فایل"
                        aria-label="حذف فایل"
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        disabled={disabled}
                        onClick={() => removeRow(index, clientId)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {isAnyUploadRunning(uploads) && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          تا پایان آپلود، این صفحه را نبندید.
        </p>
      )}
    </div>
  );
}

function isAnyUploadRunning(uploads: Record<string, RowUpload>): boolean {
  return Object.values(uploads).some((u) => u.status === "uploading");
}
