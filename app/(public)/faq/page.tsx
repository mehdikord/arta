import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
import { SectionContainer } from "@/components/shared/section-container";
import { FaqList } from "@/components/faq/faq-list";
import { SITE_CONFIG } from "@/lib/constants";
import { getFaqs, getFaqCategories } from "@/lib/data";

export const metadata: Metadata = {
  title: "سوالات متداول",
  description:
    "پاسخ سوالات رایج درباره نوبت‌دهی، خرید پکیج، مشاوره و حساب کاربری",
  openGraph: {
    title: `سوالات متداول | ${SITE_CONFIG.name}`,
    description: "پاسخ به پرتکرارترین سوالات",
    locale: "fa_IR",
  },
};

export default async function FaqPage() {
  const [faqs, categories] = await Promise.all([getFaqs(), getFaqCategories()]);

  return (
    <>
      <PageHero
        title="سوالات متداول"
        description="پاسخ سریع به رایج‌ترین سوالات شما"
        breadcrumbs={[{ label: "سوالات متداول" }]}
      />

      <SectionContainer>
        <div className="mx-auto max-w-3xl">
          <FaqList faqs={faqs} categories={categories} />
        </div>
      </SectionContainer>
    </>
  );
}
