import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Briefcase,
  Calendar,
  FileText,
  HelpCircle,
  Image,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Package,
  Settings,
  ShoppingBag,
  Shield,
  Users,
  UsersRound,
} from "lucide-react";

/** Base path for the admin panel. */
export const ADMIN_BASE_PATH = "/admins";

export const ADMIN_LOGIN_PATH = `${ADMIN_BASE_PATH}/login`;
export const ADMIN_DASHBOARD_PATH = `${ADMIN_BASE_PATH}/dashboard`;

export const PAGINATION_DEFAULT = 10;
export const PAGINATION_OPTIONS = [10, 20, 50] as const;

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "EDITOR";

export const ADMIN_ROLES_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: "مدیر ارشد",
  ADMIN: "مدیر",
  EDITOR: "ویرایشگر",
};

export type AdminNavGroup = "main" | "content" | "site" | "operations" | "system";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  group: AdminNavGroup;
  /** Roles allowed to see this item. Empty = all roles. */
  roles?: AdminRole[];
  badge?: number;
}

export const ADMIN_NAV_GROUP_LABELS: Record<AdminNavGroup, string> = {
  main: "اصلی",
  content: "محتوا",
  site: "سایت",
  operations: "عملیات",
  system: "سیستم",
};

/** Sidebar navigation items — used from phase 1 onward. */
export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    label: "داشبورد",
    href: ADMIN_DASHBOARD_PATH,
    icon: LayoutDashboard,
    group: "main",
  },
  {
    label: "خدمات",
    href: `${ADMIN_BASE_PATH}/services`,
    icon: Briefcase,
    group: "content",
    roles: ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  },
  {
    label: "پکیج‌ها",
    href: `${ADMIN_BASE_PATH}/products`,
    icon: Package,
    group: "content",
    roles: ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  },
  {
    label: "نمونه‌کارها",
    href: `${ADMIN_BASE_PATH}/portfolio`,
    icon: Image,
    group: "content",
    roles: ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  },
  {
    label: "وبلاگ",
    href: `${ADMIN_BASE_PATH}/blog`,
    icon: FileText,
    group: "content",
    roles: ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  },
  {
    label: "سوالات متداول",
    href: `${ADMIN_BASE_PATH}/faq`,
    icon: HelpCircle,
    group: "content",
    roles: ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  },
  {
    label: "تیم",
    href: `${ADMIN_BASE_PATH}/team`,
    icon: UsersRound,
    group: "content",
    roles: ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  },
  {
    label: "نظرات مشتریان",
    href: `${ADMIN_BASE_PATH}/testimonials`,
    icon: MessageSquare,
    group: "site",
    roles: ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  },
  {
    label: "آمار صفحه اصلی",
    href: `${ADMIN_BASE_PATH}/site-stats`,
    icon: BarChart3,
    group: "site",
    roles: ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  },
  {
    label: "تنظیمات سایت",
    href: `${ADMIN_BASE_PATH}/settings`,
    icon: Settings,
    group: "site",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    label: "پیام‌های تماس",
    href: `${ADMIN_BASE_PATH}/contacts`,
    icon: Mail,
    group: "operations",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    label: "نوبت‌ها",
    href: `${ADMIN_BASE_PATH}/appointments`,
    icon: Calendar,
    group: "operations",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    label: "کاربران",
    href: `${ADMIN_BASE_PATH}/users`,
    icon: Users,
    group: "operations",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    label: "خریدها",
    href: `${ADMIN_BASE_PATH}/purchases`,
    icon: ShoppingBag,
    group: "operations",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    label: "مدیران",
    href: `${ADMIN_BASE_PATH}/staff`,
    icon: Shield,
    group: "system",
    roles: ["SUPER_ADMIN"],
  },
  {
    label: "رسانه",
    href: `${ADMIN_BASE_PATH}/media`,
    icon: Image,
    group: "system",
    roles: ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  },
];

export const ADMIN_PANEL_NAME = "پنل مدیریت آرتا";
export const ADMIN_BRAND_NAME = "آکادمی توانمندسازی آرتا";

/** Routes with implemented pages. */
export const ADMIN_IMPLEMENTED_ROUTES = new Set<string>([
  ADMIN_DASHBOARD_PATH,
  `${ADMIN_BASE_PATH}/services`,
  `${ADMIN_BASE_PATH}/products`,
  `${ADMIN_BASE_PATH}/products/categories`,
  `${ADMIN_BASE_PATH}/portfolio`,
  `${ADMIN_BASE_PATH}/portfolio/categories`,
  `${ADMIN_BASE_PATH}/blog`,
  `${ADMIN_BASE_PATH}/blog/categories`,
  `${ADMIN_BASE_PATH}/faq`,
  `${ADMIN_BASE_PATH}/team`,
  `${ADMIN_BASE_PATH}/testimonials`,
  `${ADMIN_BASE_PATH}/site-stats`,
  `${ADMIN_BASE_PATH}/settings`,
  `${ADMIN_BASE_PATH}/contacts`,
  `${ADMIN_BASE_PATH}/appointments`,
  `${ADMIN_BASE_PATH}/users`,
  `${ADMIN_BASE_PATH}/purchases`,
  `${ADMIN_BASE_PATH}/staff`,
  `${ADMIN_BASE_PATH}/media`,
]);
