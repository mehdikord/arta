"use server";

import { revalidatePath } from "next/cache";
import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/auth";
import { actionError, actionSuccess, type ActionResult } from "@/lib/admin/action-result";
import { getMediaTypeInfo, mediaDisplayName } from "@/lib/media-types";

export interface MediaFile {
  url: string;
  /** Display name (without the stored UUID prefix). */
  name: string;
  size: number;
  type: "image" | "document" | "video" | "audio" | "other";
  createdAt: Date;
}

export interface MediaUsage {
  label: string;
  href: string;
}

const STORAGE_ROOT = path.resolve(process.cwd(), "storage", "web");
const URL_PREFIX = "/api/media/";

async function scanDir(dir: string, baseUrl: string): Promise<MediaFile[]> {
  const files: MediaFile[] = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return files;
  }
  await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...(await scanDir(fullPath, `${baseUrl}/${entry.name}`)));
      } else if (entry.isFile() && !entry.name.startsWith(".")) {
        const stats = await stat(fullPath).catch(() => null);
        if (!stats) return;
        files.push({
          url: `${baseUrl}/${entry.name}`,
          name: mediaDisplayName(entry.name),
          size: stats.size,
          type: getMediaTypeInfo(entry.name)?.kind ?? "other",
          createdAt: stats.birthtime.getTime() ? stats.birthtime : stats.mtime,
        });
      }
    }),
  );
  return files;
}

async function listMediaFiles(): Promise<MediaFile[]> {
  const files = await scanDir(STORAGE_ROOT, "/api/media");
  return files.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/** Map of media URL → where it is used on the site. */
async function getMediaUsageMap(): Promise<Record<string, MediaUsage[]>> {
  const has = { contains: URL_PREFIX };
  const [products, posts, services, portfolio, portfolioImages, team] = await Promise.all([
    prisma.product.findMany({
      where: { deletedAt: null, OR: [{ image: has }, { fullDescription: has }] },
      select: { id: true, title: true, image: true, fullDescription: true },
    }),
    prisma.blogPost.findMany({
      where: { deletedAt: null, OR: [{ image: has }, { content: has }] },
      select: { id: true, title: true, image: true, content: true },
    }),
    prisma.service.findMany({
      where: { deletedAt: null, OR: [{ image: has }, { fullDescription: has }] },
      select: { id: true, title: true, image: true, fullDescription: true },
    }),
    prisma.portfolioItem.findMany({
      where: { deletedAt: null, OR: [{ image: has }, { fullDescription: has }] },
      select: { id: true, title: true, image: true, fullDescription: true },
    }),
    prisma.portfolioImage.findMany({
      where: { url: has },
      select: { url: true, portfolioItem: { select: { id: true, title: true, deletedAt: true } } },
    }),
    prisma.teamMember.findMany({
      where: { image: has },
      select: { id: true, name: true, image: true },
    }),
  ]);

  const sources: { text: string; usage: MediaUsage }[] = [
    ...products.map((p) => ({
      text: `${p.image}\n${p.fullDescription}`,
      usage: { label: `پکیج «${p.title}»`, href: `/admins/products/${p.id}/edit` },
    })),
    ...posts.map((p) => ({
      text: `${p.image}\n${p.content}`,
      usage: { label: `مقاله «${p.title}»`, href: `/admins/blog/${p.id}/edit` },
    })),
    ...services.map((s) => ({
      text: `${s.image ?? ""}\n${s.fullDescription}`,
      usage: { label: `خدمت «${s.title}»`, href: `/admins/services/${s.id}/edit` },
    })),
    ...portfolio.map((p) => ({
      text: `${p.image}\n${p.fullDescription}`,
      usage: { label: `نمونه‌کار «${p.title}»`, href: `/admins/portfolio/${p.id}/edit` },
    })),
    ...portfolioImages
      .filter((i) => !i.portfolioItem.deletedAt)
      .map((i) => ({
        text: i.url,
        usage: { label: `گالری «${i.portfolioItem.title}»`, href: `/admins/portfolio/${i.portfolioItem.id}/edit` },
      })),
    ...team.map((t) => ({
      text: t.image ?? "",
      usage: { label: `عضو تیم «${t.name}»`, href: `/admins/team/${t.id}/edit` },
    })),
  ];

  const map: Record<string, MediaUsage[]> = {};
  const pattern = /\/api\/media\/[^\s"'<>)]+/g;
  for (const source of sources) {
    const found = new Set(source.text.match(pattern) ?? []);
    for (const url of found) {
      const list = (map[url] ??= []);
      if (!list.some((u) => u.href === source.usage.href)) list.push(source.usage);
    }
  }
  return map;
}

/** Media picker: files only. */
export async function getMediaFilesAction(): Promise<MediaFile[]> {
  await requireAdmin();
  return listMediaFiles();
}

/** Media library page: files + where each one is used. */
export async function getMediaLibraryAction() {
  await requireAdmin();
  const [files, usage] = await Promise.all([listMediaFiles(), getMediaUsageMap()]);
  return { files, usage };
}

function resolveMediaUrl(url: string): string | null {
  if (!url.startsWith(URL_PREFIX)) return null;
  let relative: string;
  try {
    relative = decodeURIComponent(url.slice(URL_PREFIX.length));
  } catch {
    return null;
  }
  const filePath = path.resolve(STORAGE_ROOT, relative);
  return filePath.startsWith(STORAGE_ROOT + path.sep) ? filePath : null;
}

export async function deleteMediaFilesAction(
  urls: string[],
): Promise<ActionResult<{ deleted: string[]; failed: string[] }>> {
  await requireAdmin();
  if (!Array.isArray(urls) || urls.length === 0 || urls.length > 500) {
    return actionError("فایلی انتخاب نشده است");
  }
  const deleted: string[] = [];
  const failed: string[] = [];
  for (const url of urls) {
    const filePath = typeof url === "string" ? resolveMediaUrl(url) : null;
    if (!filePath) {
      failed.push(String(url));
      continue;
    }
    try {
      await unlink(filePath);
      deleted.push(url);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") deleted.push(url);
      else failed.push(url);
    }
  }
  revalidatePath("/admins/media");
  if (deleted.length === 0) return actionError("حذف فایل ناموفق بود");
  return actionSuccess({ deleted, failed });
}
