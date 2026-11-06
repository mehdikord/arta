import type {
  AppointmentSlot,
  AppointmentStatus,
  ContactStatus,
  ProductFileType,
  ProductFileKind,
  PurchaseStatus,
  ServiceCategory,
} from "@/lib/generated/prisma/client";

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  INDIVIDUAL: "فردی",
  COUPLE: "زوجی و خانواده",
  ORGANIZATIONAL: "سازمانی",
  EDUCATIONAL: "آموزشی",
};

export const PRODUCT_FILE_TYPE_LABELS: Record<ProductFileType, string> = {
  PDF: "PDF",
  VIDEO: "ویدئو",
  MIXED: "ترکیبی",
};

export const PRODUCT_FILE_KIND_LABELS: Record<ProductFileKind, string> = {
  TEXT: "متنی",
  VIDEO: "ویدیو",
  AUDIO: "صوتی",
  ARCHIVE: "بسته‌بندی‌شده",
};

export const CONTACT_STATUS_LABELS: Record<ContactStatus, string> = {
  NEW: "جدید",
  IN_PROGRESS: "در حال بررسی",
  RESOLVED: "حل‌شده",
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  CONFIRMED: "تأییدشده",
  CANCELLED: "لغوشده",
  COMPLETED: "تکمیل‌شده",
};

export const PURCHASE_STATUS_LABELS: Record<PurchaseStatus, string> = {
  PENDING: "در انتظار",
  COMPLETED: "تکمیل‌شده",
  FAILED: "ناموفق",
  REFUNDED: "استرداد شده",
};

export const APPOINTMENT_SLOT_LABELS: Record<AppointmentSlot, string> = {
  SLOT_08_09: "۰۸:۰۰–۰۹:۰۰",
  SLOT_09_10: "۰۹:۰۰–۱۰:۰۰",
  SLOT_10_11: "۱۰:۰۰–۱۱:۰۰",
  SLOT_11_12: "۱۱:۰۰–۱۲:۰۰",
  SLOT_12_13: "۱۲:۰۰–۱۳:۰۰",
  SLOT_13_14: "۱۳:۰۰–۱۴:۰۰",
};

export function formatPriceToman(price: number | null | undefined): string {
  if (price == null || price === 0) return "رایگان";
  return `${price.toLocaleString("fa-IR")} تومان`;
}

export function getAdminInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes || 1} دقیقه پیش`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ساعت پیش`;
  const days = Math.floor(hours / 24);
  return `${days} روز پیش`;
}
