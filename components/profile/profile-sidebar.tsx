"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  ChevronLeft,
  Package,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { href: "/profile/settings", label: "تنظیمات", icon: Settings, desc: "اطلاعات حساب" },
  { href: "/profile/purchases", label: "پکیج‌های من", icon: Package, desc: "دسترسی به محتوا" },
  { href: "/profile/appointments", label: "نوبت‌های من", icon: Calendar, desc: "مدیریت نوبت" },
] as const;

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

export function ProfileSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  return (
    <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
      {/* User card */}
      <div className="relative overflow-hidden rounded-2xl border-none bg-gradient-to-bl from-primary via-primary/90 to-primary/75 p-px shadow-xl shadow-primary/15">
        <div className="relative overflow-hidden rounded-[calc(1rem-1px)] bg-gradient-to-bl from-primary/95 to-primary">
          <div className="absolute -end-6 -top-6 size-28 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-4 -start-4 size-20 rounded-full bg-accent/20 blur-xl" />

          <div className="relative p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-white/15 text-xl font-bold text-primary-foreground ring-2 ring-white/25 backdrop-blur-sm">
                  {getInitials(user.name) || "؟"}
                </div>
                <span className="absolute -bottom-1 -end-1 flex size-6 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-md">
                  <Sparkles className="size-3" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-bold text-primary-foreground">
                  {user.name}
                </p>
                <p
                  className="mt-0.5 truncate text-sm text-primary-foreground/70"
                  dir="ltr"
                >
                  {user.mobile}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur-sm">
                <p className="text-2xl font-bold text-primary-foreground">
                  {user.purchases.length}
                </p>
                <p className="text-xs text-primary-foreground/70">پکیج فعال</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3 text-center backdrop-blur-sm">
                <p className="text-2xl font-bold text-primary-foreground">
                  {user.activeAppointmentCount}
                </p>
                <p className="text-xs text-primary-foreground/70">نوبت فعال</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop nav */}
      <nav className="hidden space-y-1.5 rounded-2xl border bg-card p-2 shadow-sm lg:block">
        {navItems.map(({ href, label, icon: Icon, desc }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all duration-200",
                active
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              )}
            >
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg transition-colors",
                  active
                    ? "bg-primary-foreground/15"
                    : "bg-muted group-hover:bg-background",
                )}
              >
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{label}</p>
                <p
                  className={cn(
                    "text-xs",
                    active
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground",
                  )}
                >
                  {desc}
                </p>
              </div>
              <ChevronLeft
                className={cn(
                  "size-4 opacity-0 transition-all group-hover:opacity-60",
                  active && "opacity-80",
                )}
              />
            </Link>
          );
        })}
      </nav>

      {/* Mobile tabs */}
      <nav className="flex gap-2 overflow-x-auto rounded-2xl border bg-card p-2 shadow-sm lg:hidden">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
