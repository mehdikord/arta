"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import {
  ADMIN_BRAND_NAME,
  ADMIN_NAV_GROUP_LABELS,
  ADMIN_NAV_ITEMS,
  ADMIN_PANEL_NAME,
  type AdminNavGroup,
} from "@/lib/admin/constants";
import { canAccessNavItem } from "@/lib/admin/permissions";
import { useAdminSession } from "@/components/admin/layout/admin-session-context";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AdminSidebarProps {
  collapsed?: boolean;
  onNavigate?: () => void;
  contactsBadge?: number;
}

const NAV_GROUP_ORDER: AdminNavGroup[] = [
  "main",
  "content",
  "site",
  "operations",
  "system",
];

export function AdminSidebar({
  collapsed = false,
  onNavigate,
  contactsBadge,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const admin = useAdminSession();

  const sections = NAV_GROUP_ORDER.map((group) => ({
    group,
    label: ADMIN_NAV_GROUP_LABELS[group],
    items: ADMIN_NAV_ITEMS.filter(
      (item) =>
        item.group === group && canAccessNavItem(admin.role, item),
    ),
  })).filter((section) => section.items.length > 0);

  return (
    <aside
      className={cn(
        "admin-sidebar flex h-screen shrink-0 flex-col border-s border-[var(--admin-sidebar-border)] transition-[width] duration-200 ease-in-out",
        collapsed
          ? "w-[var(--admin-sidebar-collapsed-width)]"
          : "w-[var(--admin-sidebar-width)]",
      )}
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center border-b border-[var(--admin-sidebar-border)]",
          collapsed ? "justify-center px-2" : "gap-3 px-5",
        )}
      >
        {!collapsed && (
          <div className="min-w-0 flex-1 text-end">
            <p className="truncate text-sm font-bold text-white">آرتا</p>
            <p className="truncate text-xs text-[var(--admin-sidebar-text)]">
              {ADMIN_PANEL_NAME}
            </p>
          </div>
        )}
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--admin-accent)]/20 text-[var(--admin-accent)]">
          <Shield className="size-5" />
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1 px-3 py-4">
        <nav className="space-y-6">
          {sections.map((section) => (
            <div key={section.group}>
              {!collapsed && (
                <p className="mb-2 px-3 text-end text-[11px] font-semibold tracking-wide text-[var(--admin-sidebar-text)]/70 uppercase">
                  {section.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admins/dashboard" &&
                      pathname.startsWith(item.href));
                  const Icon = item.icon;
                  const badge =
                    item.href.endsWith("/contacts") && contactsBadge
                      ? contactsBadge
                      : item.badge;

                  const link = (
                    <Link
                      href={item.href}
                      data-active={isActive}
                      className={cn(
                        "admin-nav-item flex w-full items-center gap-3 rounded-lg px-3 py-2.5",
                        collapsed && "justify-center px-2",
                      )}
                      onClick={onNavigate}
                    >
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate text-end text-sm font-medium">
                            {item.label}
                          </span>
                          {badge !== undefined && badge > 0 && (
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--admin-accent)] text-[10px] font-bold text-white">
                              {badge}
                            </span>
                          )}
                        </>
                      )}
                      <Icon className="size-[18px] shrink-0" />
                    </Link>
                  );

                  if (collapsed) {
                    return (
                      <li key={item.href}>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>{link}</TooltipTrigger>
                          <TooltipContent side="left">{item.label}</TooltipContent>
                        </Tooltip>
                      </li>
                    );
                  }

                  return <li key={item.href}>{link}</li>;
                })}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {!collapsed && (
        <div className="shrink-0 border-t border-[var(--admin-sidebar-border)] p-4">
          <p className="text-xs text-[var(--admin-sidebar-text)]">
            {ADMIN_BRAND_NAME}
          </p>
          <p className="mt-0.5 text-[10px] text-[var(--admin-sidebar-text)]/60">
            نسخه ۱.۰.۰
          </p>
        </div>
      )}
    </aside>
  );
}
