import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/shared/page-header";
import { PortfolioForm } from "@/components/admin/portfolio/portfolio-form";
import { getPortfolioItemAction } from "@/lib/actions/admin/portfolio";
import { getPortfolioCategoriesAction } from "@/lib/actions/admin/portfolio-categories";

export const metadata = { title: "ویرایش نمونه‌کار" };

export default async function EditPortfolioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item, categories] = await Promise.all([
    getPortfolioItemAction(id),
    getPortfolioCategoriesAction(),
  ]);
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="ویرایش نمونه‌کار" description={item.title} />
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <PortfolioForm item={item} categories={categories} />
      </div>
    </div>
  );
}
