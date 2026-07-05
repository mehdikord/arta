import { PageHeader } from "@/components/admin/shared/page-header";
import { PortfolioForm } from "@/components/admin/portfolio/portfolio-form";
import { getPortfolioCategoriesAction } from "@/lib/actions/admin/portfolio-categories";

export const metadata = { title: "نمونه‌کار جدید" };

export default async function NewPortfolioPage() {
  const categories = await getPortfolioCategoriesAction();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="نمونه‌کار جدید" description="ایجاد نمونه‌کار جدید" />
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <PortfolioForm categories={categories} />
      </div>
    </div>
  );
}
