import { SiteStatsPageClient } from "@/components/admin/site-stats/site-stats-page-client";
import { getSiteStatsAction } from "@/lib/actions/admin/site-stats";

export const metadata = { title: "آمار صفحه اصلی" };

export default async function AdminSiteStatsPage() {
  const stats = await getSiteStatsAction();
  return <SiteStatsPageClient stats={stats} />;
}
