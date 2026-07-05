import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
import { SectionContainer } from "@/components/shared/section-container";
import { ProductsGrid } from "@/components/products/products-grid";
import { SITE_CONFIG } from "@/lib/constants";
import { getProducts, getProductCategories } from "@/lib/data";

export const metadata: Metadata = {
  title: "پکیج‌های آموزشی",
  description:
    "پکیج‌های آموزشی آکادمی آرتا — رشد فردی، مدیریت استرس، ذهن‌آگاهی و بیشتر",
  openGraph: {
    title: `پکیج‌های آموزشی | ${SITE_CONFIG.name}`,
    description: "منابع آموزشی برای رشد شخصی و حرفه‌ای",
    locale: "fa_IR",
  },
};

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getProductCategories(),
  ]);

  return (
    <>
      <PageHero
        title="پکیج‌های آموزشی"
        description="منابع تخصصی برای یادگیری در هر زمان و مکان — رایگان و پولی"
        breadcrumbs={[{ label: "پکیج‌ها" }]}
      />

      <SectionContainer>
        <ProductsGrid products={products} categories={categories} />
      </SectionContainer>
    </>
  );
}
