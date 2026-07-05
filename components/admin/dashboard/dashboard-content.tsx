"use client";

import Link from "next/link";
import {
  Calendar,
  Mail,
  Package,
  Plus,
  ShoppingBag,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/shared/page-header";
import { StatCard } from "@/components/admin/shared/stat-card";
import { DataTable } from "@/components/admin/shared/data-table";
import { recentActivityColumns } from "@/components/admin/dashboard/activity-columns";
import { formatRelativeTime } from "@/lib/admin/format";

const QUICK_ACTIONS = [
  { label: "خدمت جدید", href: "/admins/services/new", icon: Plus },
  { label: "پکیج جدید", href: "/admins/products/new", icon: Package },
  { label: "نوبت‌ها", href: "/admins/appointments", icon: Calendar },
  { label: "پیام‌ها", href: "/admins/contacts", icon: Mail },
] as const;

interface DashboardContentProps {
  stats: {
    usersCount: number;
    activeAppointments: number;
    monthlyPurchases: number;
    newContacts: number;
  };
  activity: Array<{
    id: string;
    type: "purchase" | "appointment" | "contact" | "register";
    title: string;
    description: string;
    time: Date;
  }>;
}

export function DashboardContent({ stats, activity }: DashboardContentProps) {
  const statCards = [
    {
      id: "users",
      label: "کاربران ثبت‌نام‌شده",
      value: stats.usersCount.toLocaleString("fa-IR"),
      icon: Users,
    },
    {
      id: "appointments",
      label: "نوبت‌های فعال",
      value: stats.activeAppointments.toLocaleString("fa-IR"),
      icon: Calendar,
    },
    {
      id: "purchases",
      label: "خریدهای این ماه",
      value: stats.monthlyPurchases.toLocaleString("fa-IR"),
      icon: ShoppingBag,
    },
    {
      id: "contacts",
      label: "پیام‌های جدید",
      value: stats.newContacts.toLocaleString("fa-IR"),
      icon: Mail,
    },
  ];

  const tableData = activity.map((a) => ({
    ...a,
    time: formatRelativeTime(a.time),
  }));

  return (
    <div className="animate-fade-in space-y-6 md:space-y-8">
      <PageHeader
        title="داشبورد"
        description="نمای کلی عملکرد آکادمی"
        actions={
          <Button asChild size="sm">
            <Link href="/admins/services/new">
              <Plus className="size-4" />
              افزودن خدمت
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-0 shadow-sm xl:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">
              آخرین فعالیت‌ها
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={recentActivityColumns}
              data={tableData}
              searchPlaceholder="جستجو در فعالیت‌ها..."
            />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">دسترسی سریع</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.label}
                  asChild
                  variant="outline"
                  className="h-11 justify-start gap-3 bg-white"
                >
                  <Link href={action.href}>
                    <Icon className="size-4 text-primary" />
                    {action.label}
                  </Link>
                </Button>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
