"use client";

import { type ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";
import { AdminTopbar } from "@/components/admin/layout/admin-topbar";
import {
  AdminShellProvider,
  useAdminShell,
} from "@/components/admin/layout/admin-shell-context";
import type { AdminSessionPayload } from "@/lib/admin/session";
import { AdminSessionProvider } from "@/components/admin/layout/admin-session-context";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ADMIN_PANEL_NAME } from "@/lib/admin/constants";

function AdminShellInner({
  children,
  contactsBadge,
}: {
  children: ReactNode;
  contactsBadge?: number;
}) {
  const { sidebarCollapsed, mobileOpen, setMobileOpen } = useAdminShell();

  return (
    <div className="flex h-full min-h-0 overflow-hidden">
      <div className="hidden h-full shrink-0 lg:block">
        <AdminSidebar collapsed={sidebarCollapsed} contactsBadge={contactsBadge} />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="right"
          className="w-[var(--admin-sidebar-width)] border-0 p-0 [&>button]:text-white"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{ADMIN_PANEL_NAME}</SheetTitle>
          </SheetHeader>
          <AdminSidebar
            onNavigate={() => setMobileOpen(false)}
            contactsBadge={contactsBadge}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <AdminTopbar newContactsCount={contactsBadge} />
        <main className="admin-content min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AdminShell({
  admin,
  children,
  contactsBadge,
}: {
  admin: AdminSessionPayload;
  children: ReactNode;
  contactsBadge?: number;
}) {
  return (
    <AdminSessionProvider admin={admin}>
      <AdminShellProvider>
        <AdminShellInner contactsBadge={contactsBadge}>{children}</AdminShellInner>
      </AdminShellProvider>
    </AdminSessionProvider>
  );
}
