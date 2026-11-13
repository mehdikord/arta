import type { Metadata } from "next";
import { DashboardContent } from "@/components/admin/dashboard/dashboard-content";
import { requireAdmin } from "@/lib/admin/auth";
import { parseDashboardRange } from "@/lib/admin/dashboard-range";
import { getDashboardData } from "@/lib/admin/queries/dashboard";

export const metadata: Metadata = {
  title: "داشبورد",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const [admin, { range }] = await Promise.all([requireAdmin(), searchParams]);
  const data = await getDashboardData(parseDashboardRange(range), admin.role);

  return <DashboardContent data={data} adminName={admin.name} />;
}
