import type { Metadata } from "next";
import { DashboardContent } from "@/components/admin/dashboard/dashboard-content";
import {
  getDashboardStats,
  getRecentActivity,
} from "@/lib/admin/queries/dashboard";

export const metadata: Metadata = {
  title: "داشبورد",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const [stats, activity] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(10),
  ]);

  return <DashboardContent stats={stats} activity={activity} />;
}
