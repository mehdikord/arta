import { Card, CardContent } from "@/components/ui/card";
import { SectionContainer } from "@/components/shared/section-container";
import { SectionTitle } from "@/components/shared/section-title";
import { AnimateIn } from "@/components/shared/animate-in";
import { getSiteStats } from "@/lib/data";

export async function StatsSection() {
  const stats = await getSiteStats();

  return (
    <SectionContainer>
      <SectionTitle
        title="اعتماد هزاران مراجع"
        subtitle="آمار و دستاوردهای آکادمی آرتا"
        centered
      />

      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat, i) => (
          <AnimateIn key={stat.label} delay={(i % 3 + 1) as 1 | 2 | 3}>
            <Card className="group border-none bg-gradient-to-bl from-card to-primary/5 text-center shadow-sm transition-all hover:shadow-md">
              <CardContent className="pt-8 pb-8">
                <p className="text-3xl font-bold text-primary transition-transform group-hover:scale-105 md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          </AnimateIn>
        ))}
      </div>
    </SectionContainer>
  );
}
