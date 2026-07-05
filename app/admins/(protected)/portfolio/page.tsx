import { PortfolioPageClient } from "@/components/admin/portfolio/portfolio-page-client";
import { getPortfolioItemsAction } from "@/lib/actions/admin/portfolio";

export const metadata = { title: "نمونه‌کارها" };

export default async function AdminPortfolioPage() {
  const items = await getPortfolioItemsAction();
  return <PortfolioPageClient items={items} />;
}
