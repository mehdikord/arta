"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Home } from "lucide-react";
import { ADMIN_BASE_PATH, ADMIN_DASHBOARD_PATH } from "@/lib/admin/constants";
import { cn } from "@/lib/utils";

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "داشبورد",
  services: "خدمات",
  products: "پکیج‌ها",
  portfolio: "نمونه‌کارها",
  blog: "وبلاگ",
  faq: "سوالات متداول",
  team: "تیم",
  testimonials: "نظرات مشتریان",
  "site-stats": "آمار صفحه اصلی",
  settings: "تنظیمات سایت",
  contacts: "پیام‌های تماس",
  appointments: "نوبت‌ها",
  users: "کاربران",
  purchases: "خریدها",
  staff: "مدیران",
  media: "رسانه",
  new: "ایجاد",
  edit: "ویرایش",
  categories: "دسته‌بندی‌ها",
};

function formatSegment(segment: string): string {
  return ROUTE_LABELS[segment] ?? segment;
}

export function AdminBreadcrumb({ className }: { className?: string }) {
  const pathname = usePathname();

  if (!pathname.startsWith(ADMIN_BASE_PATH)) return null;

  const segments = pathname
    .replace(ADMIN_BASE_PATH, "")
    .split("/")
    .filter(Boolean);

  const crumbs = segments.map((segment, index) => {
    const href = `${ADMIN_BASE_PATH}/${segments.slice(0, index + 1).join("/")}`;
    const isLast = index === segments.length - 1;
    return {
      label: formatSegment(segment),
      href,
      isLast,
    };
  });

  return (
    <nav
      aria-label="مسیر صفحه"
      className={cn("flex items-center gap-1 text-sm", className)}
    >
      <Link
        href={ADMIN_DASHBOARD_PATH}
        className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
      >
        <Home className="size-3.5" />
        <span className="hidden sm:inline">داشبورد</span>
      </Link>

      {crumbs.map((crumb) => (
        <div key={crumb.href} className="flex items-center gap-1">
          <ChevronLeft className="size-3.5 text-muted-foreground/60" />
          {crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
