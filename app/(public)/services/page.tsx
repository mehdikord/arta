import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
import { SectionContainer } from "@/components/shared/section-container";
import { ServiceCard } from "@/components/services/service-card";
import { ServicesGrid } from "@/components/services/services-grid";
import { SectionTitle } from "@/components/shared/section-title";
import { SITE_CONFIG } from "@/lib/constants";
import { getServices } from "@/lib/data";

export const metadata: Metadata = {
  title: "خدمات",
  description:
    "خدمات مشاوره فردی، زوجی، سازمانی، کوچینگ و کارگاه‌های آموزشی آکادمی آرتا",
  openGraph: {
    title: `خدمات | ${SITE_CONFIG.name}`,
    description: "مشاوره، کوچینگ و آموزش تخصصی",
    locale: "fa_IR",
  },
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <PageHero
        title="خدمات آکادمی"
        description="طیف کامل خدمات مشاوره، روان‌درمانی، کوچینگ و آموزش"
        breadcrumbs={[{ label: "خدمات" }]}
      />

      <SectionContainer>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </SectionContainer>

      <SectionContainer className="bg-muted/30">
        <SectionTitle
          title="جزئیات خدمات"
          subtitle="برای مشاهده توضیحات کامل، روی هر خدمت کلیک کنید"
        />
        <div className="mt-8">
          <ServicesGrid services={services} />
        </div>
      </SectionContainer>
    </>
  );
}
