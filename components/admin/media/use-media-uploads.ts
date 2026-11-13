"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MediaFile } from "@/lib/actions/admin/media";
import { getMediaTypeInfo } from "@/lib/media-types";

const CONCURRENCY = 3;

export type UploadStatus = "queued" | "uploading" | "done" | "error" | "canceled";

export type UploadItem = {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  /** Incremented on retry so the scheduler can start the item again. */
  attempt: number;
  error?: string;
  /** Object URL for image previews (revoked when the item is cleared). */
  previewUrl?: string;
  result?: MediaFile;
};

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function errorFor(status: number): string {
  if (status === 401) return "نشست منقضی شده؛ دوباره وارد شوید";
  if (status === 413) return "حجم فایل بیش از حد مجاز است";
  if (status === 415) return "نوع یا محتوای فایل مجاز نیست";
  return "آپلود ناموفق بود";
}

export function validateMediaFile(file: File): string | null {
  const info = getMediaTypeInfo(file.name);
  if (!info) return "این نوع فایل مجاز نیست";
  if (file.size === 0) return "فایل خالی است";
  if (file.size > info.maxBytes) return `حداکثر ${Math.round(info.maxBytes / 1024 / 1024)} مگابایت`;
  return null;
}

export function useMediaUploads(onUploaded: (file: MediaFile) => void) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const requests = useRef(new Map<string, XMLHttpRequest>());
  /** Attempt keys already sent — guards against double-starting an item. */
  const started = useRef(new Set<string>());
  const onUploadedRef = useRef(onUploaded);

  useEffect(() => {
    onUploadedRef.current = onUploaded;
  }, [onUploaded]);

  const patch = useCallback((id: string, update: Partial<UploadItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...update } : item)));
  }, []);

  const start = useCallback(
    (item: UploadItem) => {
      const request = new XMLHttpRequest();
      requests.current.set(item.id, request);
      patch(item.id, { status: "uploading", progress: 0, error: undefined });

      request.open("POST", "/api/admin/upload");
      request.setRequestHeader("Content-Type", "application/octet-stream");
      request.setRequestHeader("X-File-Name", encodeURIComponent(item.file.name));
      request.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          patch(item.id, { progress: Math.min(99, Math.round((event.loaded / event.total) * 100)) });
        }
      });
      request.addEventListener("load", () => {
        requests.current.delete(item.id);
        let body: { file?: MediaFile & { createdAt: string }; error?: string } = {};
        try {
          body = JSON.parse(request.responseText);
        } catch {
          /* non-JSON (e.g. proxy error page) */
        }
        if (request.status >= 200 && request.status < 300 && body.file) {
          const file: MediaFile = { ...body.file, createdAt: new Date(body.file.createdAt) };
          patch(item.id, { status: "done", progress: 100, result: file });
          onUploadedRef.current(file);
        } else {
          patch(item.id, { status: "error", progress: 0, error: body.error ?? errorFor(request.status) });
        }
      });
      request.addEventListener("error", () => {
        requests.current.delete(item.id);
        patch(item.id, { status: "error", progress: 0, error: "ارتباط قطع شد" });
      });
      request.addEventListener("abort", () => {
        requests.current.delete(item.id);
      });
      request.send(item.file);
    },
    [patch],
  );

  // Scheduler: keep up to CONCURRENCY uploads running.
  useEffect(() => {
    const running = items.filter((i) => i.status === "uploading").length;
    const slots = CONCURRENCY - running;
    if (slots <= 0) return;
    items
      .filter((i) => i.status === "queued" && !started.current.has(`${i.id}:${i.attempt}`))
      .slice(0, slots)
      .forEach((item) => {
        started.current.add(`${item.id}:${item.attempt}`);
        start(item);
      });
  }, [items, start]);

  useEffect(() => {
    const active = requests.current;
    return () => active.forEach((request) => request.abort());
  }, []);

  const addFiles = useCallback((files: File[]) => {
    const next: UploadItem[] = files.map((file) => {
      const error = validateMediaFile(file);
      const isImage = getMediaTypeInfo(file.name)?.kind === "image";
      return {
        id: createId(),
        file,
        status: error ? "error" : "queued",
        progress: 0,
        attempt: 0,
        error: error ?? undefined,
        previewUrl: isImage && !error ? URL.createObjectURL(file) : undefined,
      };
    });
    setItems((prev) => [...prev, ...next]);
    return next.filter((i) => i.status === "queued").length;
  }, []);

  const cancel = useCallback(
    (id: string) => {
      requests.current.get(id)?.abort();
      patch(id, { status: "canceled", progress: 0 });
    },
    [patch],
  );

  const retry = useCallback(
    (id: string) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id && !validateMediaFile(item.file)
            ? { ...item, status: "queued", progress: 0, error: undefined, attempt: item.attempt + 1 }
            : item,
        ),
      );
    },
    [],
  );

  const clearFinished = useCallback(() => {
    setItems((prev) => {
      prev
        .filter((i) => i.status !== "queued" && i.status !== "uploading")
        .forEach((i) => i.previewUrl && URL.revokeObjectURL(i.previewUrl));
      return prev.filter((i) => i.status === "queued" || i.status === "uploading");
    });
  }, []);

  const cancelAll = useCallback(() => {
    requests.current.forEach((request) => request.abort());
    setItems((prev) =>
      prev.map((item) =>
        item.status === "queued" || item.status === "uploading"
          ? { ...item, status: "canceled", progress: 0 }
          : item,
      ),
    );
  }, []);

  return { items, addFiles, cancel, retry, clearFinished, cancelAll };
}
