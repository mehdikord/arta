import type { Metadata } from "next";
import { PageHero } from "@/components/shared/page-hero";
import { SectionContainer } from "@/components/shared/section-container";
import { ContactInfo } from "@/components/contact/contact-info";
import { ContactMap } from "@/components/contact/contact-map";
import { ContactForm } from "@/components/contact/contact-form";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "تماس با ما",
  description:
    "راه‌های ارتباطی با آکادمی آرتا — تلفن، ایمیل، آدرس و فرم تماس",
  openGraph: {
    title: `تماس با ما | ${SITE_CONFIG.name}`,
    description: "با ما در تماس باشید",
    locale: "fa_IR",
  },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        title="تماس با ما"
        description="خوشحال می‌شویم صدای شما را بشنویم"
        breadcrumbs={[{ label: "تماس با ما" }]}
      />

      <SectionContainer>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <ContactInfo />
            <ContactMap />
          </div>
          <ContactForm />
        </div>
      </SectionContainer>
    </>
  );
}
