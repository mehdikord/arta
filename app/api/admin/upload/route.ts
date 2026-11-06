import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { getAdminSessionFromCookie } from "@/lib/admin/session";
import { revalidatePath } from "next/cache";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_DOC_SIZE = 20 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, { max: number; ext: string }> = {
  "image/jpeg": { max: MAX_IMAGE_SIZE, ext: ".jpg" },
  "image/png": { max: MAX_IMAGE_SIZE, ext: ".png" },
  "image/webp": { max: MAX_IMAGE_SIZE, ext: ".webp" },
  "image/gif": { max: MAX_IMAGE_SIZE, ext: ".gif" },
  "image/svg+xml": { max: MAX_IMAGE_SIZE, ext: ".svg" },
  "application/pdf": { max: MAX_DOC_SIZE, ext: ".pdf" },
  "video/mp4": { max: MAX_DOC_SIZE, ext: ".mp4" },
  "video/webm": { max: MAX_DOC_SIZE, ext: ".webm" },
};

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
}

export async function POST(request: NextRequest) {
  const session = await getAdminSessionFromCookie();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "فایل یافت نشد" }, { status: 400 });
  }

  const typeConfig = ALLOWED_TYPES[file.type];
  if (!typeConfig) {
    return NextResponse.json({ error: "نوع فایل مجاز نیست" }, { status: 400 });
  }
  if (file.size > typeConfig.max) {
    return NextResponse.json({ error: "حجم فایل بیش از حد مجاز است" }, { status: 400 });
  }

  const now = new Date();
  const year = now.getFullYear().toString();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const dir = path.join(process.cwd(), "storage", "web", year, month);
  await mkdir(dir, { recursive: true });

  const baseName = sanitizeFilename(file.name.replace(/\.[^.]+$/, ""));
  const filename = `${randomUUID()}-${baseName}${typeConfig.ext}`;
  const filePath = path.join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const url = `/api/media/${year}/${month}/${filename}`;
  revalidatePath("/admins/media");
  return NextResponse.json({ url });
}
