import { PortfolioCategoriesPageClient } from "@/components/admin/portfolio/portfolio-categories-page-client";
import { getPortfolioCategoriesAction } from "@/lib/actions/admin/portfolio-categories";

export const metadata = { title: "دسته‌بندی نمونه‌کارها" };

export default async function PortfolioCategoriesPage() {
  const categories = await getPortfolioCategoriesAction();
  return <PortfolioCategoriesPageClient categories={categories} />;
}
