"use client";

import { useRouter } from "next/navigation";
import { Bell, LogOut, Menu, PanelRightClose, PanelRightOpen, Search, Settings, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AdminBreadcrumb } from "@/components/admin/layout/admin-breadcrumb";
import { useAdminShell } from "@/components/admin/layout/admin-shell-context";
import { useAdminSession } from "@/components/admin/layout/admin-session-context";
import { logoutAdminAction } from "@/lib/actions/admin/auth";
import { ADMIN_ROLES_LABELS } from "@/lib/admin/constants";
import { getAdminInitials } from "@/lib/admin/format";

export function AdminTopbar({ newContactsCount = 0 }: { newContactsCount?: number }) {
  const router = useRouter();
  const admin = useAdminSession();
  const { sidebarCollapsed, toggleSidebarCollapsed, toggleMobileOpen } =
    useAdminShell();

  async function handleLogout() {
    await logoutAdminAction();
    toast.success("با موفقیت خارج شدید");
    router.push("/admins/login");
    router.refresh();
  }

  return (
    <header className="admin-topbar sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b px-4 backdrop-blur-xl md:px-6">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={toggleMobileOpen}
        aria-label="باز کردن منو"
      >
        <Menu className="size-5" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="hidden lg:inline-flex"
        onClick={toggleSidebarCollapsed}
        aria-label={sidebarCollapsed ? "باز کردن منو" : "جمع کردن منو"}
      >
        {sidebarCollapsed ? (
          <PanelRightOpen className="size-5" />
        ) : (
          <PanelRightClose className="size-5" />
        )}
      </Button>

      <div className="hidden min-w-0 flex-1 md:block">
        <AdminBreadcrumb />
      </div>

      <div className="relative ms-auto hidden w-full max-w-xs sm:block md:max-w-sm">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="جستجو در پنل..."
          className="h-9 bg-white/80 ps-9"
          disabled
        />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative shrink-0"
        aria-label="اعلان‌ها"
      >
        <Bell className="size-5" />
        {newContactsCount > 0 && (
          <Badge className="absolute -top-0.5 -start-0.5 flex size-4 items-center justify-center rounded-full p-0 text-[10px]">
            {newContactsCount}
          </Badge>
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-9 gap-2 px-2 hover:bg-white/60">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {getAdminInitials(admin.name)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden text-sm font-medium md:inline">
              {admin.name}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col gap-0.5">
              <span>{admin.name}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {ADMIN_ROLES_LABELS[admin.role]}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <User className="size-4" />
            پروفایل
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <Settings className="size-4" />
            تنظیمات
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="size-4" />
            خروج
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
