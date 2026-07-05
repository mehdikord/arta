"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, User, Calendar, Package, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export function UserMenu() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  function handleLogout() {
    logout();
    toast.success("با موفقیت خارج شدید");
    router.push("/");
  }

  if (!isAuthenticated || !user) {
    return (
      <Button asChild variant="outline" size="sm" className="gap-1.5">
        <Link href="/auth/login">
          <LogIn className="size-4" />
          <span className="hidden sm:inline">ورود</span>
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <User className="size-4" />
          <span className="hidden max-w-24 truncate sm:inline">{user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground" dir="ltr">
            {user.mobile}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile/settings">
            <Settings className="size-4" />
            تنظیمات
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile/purchases">
            <Package className="size-4" />
            پکیج‌های من
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile/appointments">
            <Calendar className="size-4" />
            نوبت‌های من
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
          <LogOut className="size-4" />
          خروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
