import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
import { SectionContainer } from "@/components/shared/section-container";
import { PortfolioGrid } from "@/components/portfolio/portfolio-grid";
import { SITE_CONFIG } from "@/lib/constants";
import { getPortfolioItems, getPortfolioCategories } from "@/lib/data";

export const metadata: Metadata = {
  title: "نمونه‌کارها",
  description:
    "پروژه‌ها و همکاری‌های موفق آکادمی آرتا در حوزه مشاوره سازمانی، فردی و کارگاه‌های آموزشی",
  openGraph: {
    title: `نمونه‌کارها | ${SITE_CONFIG.name}`,
    description: "نمونه پروژه‌های اجراشده توسط آکادمی آرتا",
    locale: "fa_IR",
  },
};

export default async function PortfolioPage() {
  const [items, categories] = await Promise.all([
    getPortfolioItems(),
    getPortfolioCategories(),
  ]);

  return (
    <>
      <PageHero
        title="نمونه‌کارها"
        description="نگاهی به پروژه‌ها و همکاری‌های موفق ما در مسیر توانمندسازی"
        breadcrumbs={[{ label: "نمونه‌کارها" }]}
      />

      <SectionContainer>
        <PortfolioGrid items={items} categories={categories} />
      </SectionContainer>
    </>
  );
}
