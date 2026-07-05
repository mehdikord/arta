import type { Metadata } from "next";
import { HeroSection } from "@/components/home/hero-section";
import { IntroSection } from "@/components/home/intro-section";
import { FeaturedServices } from "@/components/home/featured-services";
import { StatsSection } from "@/components/home/stats-section";
import { FeaturedPortfolio } from "@/components/home/featured-portfolio";
import { FeaturedProducts } from "@/components/home/featured-products";
import { LatestBlog } from "@/components/home/latest-blog";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { CtaSection } from "@/components/home/cta-section";
import { FaqPreview } from "@/components/home/faq-preview";
import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: "خانه",
  description:
    "آکادمی توانمندسازی آرتا — مشاوره روانشناسی، کوچینگ رشد فردی، کارگاه‌های آموزشی و پکیج‌های تخصصی",
  openGraph: {
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.tagline,
    locale: "fa_IR",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <IntroSection />
      <FeaturedServices />
      <StatsSection />
      <FeaturedPortfolio />
      <FeaturedProducts />
      <LatestBlog />
      <TestimonialsSection />
      <CtaSection />
      <FaqPreview />
    </>
  );
}
