import { SectionContainer } from "@/components/shared/section-container";
import { CtaBanner } from "@/components/shared/cta-banner";

export function CtaSection() {
  return (
    <SectionContainer>
      <CtaBanner
        title="آماده شروع مسیر رشد هستید؟"
        description="اولین قدم را همین امروز بردارید. تیم ما آماده همراهی شماست."
        primaryLabel="رزرو نوبت مشاوره"
        primaryHref="/auth/login?redirect=/appointment"
        secondaryLabel="تماس با ما"
        secondaryHref="/contact"
      />
    </SectionContainer>
  );
}
