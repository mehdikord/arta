import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortfolioCard } from "@/components/portfolio/portfolio-card";
import { SectionContainer } from "@/components/shared/section-container";
import { SectionTitle } from "@/components/shared/section-title";
import { AnimateIn } from "@/components/shared/animate-in";
import { getPortfolioItems } from "@/lib/data";

export async function FeaturedPortfolio() {
  const items = (await getPortfolioItems()).slice(0, 3);

  return (
    <SectionContainer className="bg-muted/30">
      <SectionTitle
        title="نمونه‌کارهای برجسته"
        subtitle="پروژه‌ها و همکاری‌های موفق آکادمی"
        centered
      />

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {items.map((item, i) => (
          <AnimateIn key={item.id} delay={(i + 1) as 1 | 2 | 3}>
            <PortfolioCard item={item} />
          </AnimateIn>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Button asChild variant="outline" size="lg">
          <Link href="/portfolio">
            مشاهده همه نمونه‌کارها
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
      </div>
    </SectionContainer>
  );
}
