import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/shared/page-hero";
import { SectionContainer } from "@/components/shared/section-container";
import { SectionTitle } from "@/components/shared/section-title";
import { CtaBanner } from "@/components/shared/cta-banner";
import { BrandStory } from "@/components/about/brand-story";
import { ValuesSection } from "@/components/about/values-section";
import { TeamSection } from "@/components/about/team-section";
import { Certifications } from "@/components/about/certifications";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "درباره ما",
  description:
    "آشنایی با تاریخچه، مأموریت، ارزش‌ها و تیم متخصص آکادمی توانمندسازی آرتا",
  openGraph: {
    title: `درباره ما | ${SITE_CONFIG.name}`,
    description: "داستان برند، ارزش‌ها و تیم آکادمی آرتا",
    locale: "fa_IR",
  },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="درباره آکادمی آرتا"
        description="شناخت هویت، مأموریت و تیمی که مسیر رشد شما را هموار می‌کند"
        breadcrumbs={[{ label: "درباره ما" }]}
      />

      <SectionContainer>
        <SectionTitle
          title="داستان ما"
          subtitle="از یک ایده تا آکادمی توانمندسازی"
        />
        <div className="mt-8">
          <BrandStory />
        </div>
      </SectionContainer>

      <SectionContainer className="bg-muted/30">
        <SectionTitle
          title="ارزش‌های ما"
          subtitle="اصولی که هر روز به آن پایبندیم"
          centered
        />
        <div className="mt-10">
          <ValuesSection />
        </div>
      </SectionContainer>

      <SectionContainer>
        <TeamSection />
      </SectionContainer>

      <SectionContainer className="bg-muted/30">
        <SectionTitle
          title="گواهینامه‌ها و همکاری‌ها"
          subtitle="اعتبار و استانداردهای حرفه‌ای"
          centered
        />
        <div className="mt-8">
          <Certifications />
        </div>
      </SectionContainer>

      <SectionContainer>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/services">
              مشاهده خدمات
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/contact">تماس با ما</Link>
          </Button>
        </div>
      </SectionContainer>

      <SectionContainer>
        <CtaBanner
          title="آماده آشنایی بیشتر هستید؟"
          description="با تیم ما گفتگو کنید و بهترین مسیر رشد را بیابید."
          primaryLabel="تماس با ما"
          primaryHref="/contact"
          secondaryLabel="رزرو نوبت"
          secondaryHref="/auth/login?redirect=/appointment"
        />
      </SectionContainer>
    </>
  );
}
