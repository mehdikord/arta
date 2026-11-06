"use server";

import { revalidatePath } from "next/cache";
import { readdir, stat, unlink } from "fs/promises";
import path from "path";
import { requireAdmin } from "@/lib/admin/auth";
import { actionSuccess, type ActionResult } from "@/lib/admin/action-result";

export interface MediaFile {
  url: string;
  name: string;
  size: number;
  type: "image" | "document" | "video" | "other";
  createdAt: Date;
}

const UPLOADS_DIR = path.join(process.cwd(), "storage", "web");

function getMediaType(mimeOrExt: string): MediaFile["type"] {
  if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(mimeOrExt) || mimeOrExt.startsWith("image/")) {
    return "image";
  }
  if (/\.(pdf|doc|docx)$/i.test(mimeOrExt) || mimeOrExt.includes("pdf")) {
    return "document";
  }
  if (/\.(mp4|webm|mov)$/i.test(mimeOrExt) || mimeOrExt.startsWith("video/")) {
    return "video";
  }
  return "other";
}

async function scanDir(dir: string, baseUrl: string): Promise<MediaFile[]> {
  const files: MediaFile[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await scanDir(fullPath, `${baseUrl}/${entry.name}`)));
      } else if (entry.isFile()) {
        const stats = await stat(fullPath);
        files.push({
          url: `${baseUrl}/${entry.name}`,
          name: entry.name,
          size: stats.size,
          type: getMediaType(entry.name),
          createdAt: stats.birthtime,
        });
      }
    }
  } catch {
    // uploads dir may not exist yet
  }
  return files;
}

export async function getMediaFilesAction(): Promise<MediaFile[]> {
  await requireAdmin();
  const files = await scanDir(UPLOADS_DIR, "/api/media");
  return files.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function deleteMediaFileAction(
  url: string,
): Promise<ActionResult> {
  await requireAdmin();
  if (!url.startsWith("/uploads/")) {
    return { success: false, error: "مسیر نامعتبر" };
  }
  const filePath = path.join(process.cwd(), "public", url);
  await unlink(filePath);
  revalidatePath("/admins/media");
  return actionSuccess(undefined);
}
