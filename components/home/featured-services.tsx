import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionContainer } from "@/components/shared/section-container";
import { SectionTitle } from "@/components/shared/section-title";
import { CategoryBadge } from "@/components/shared/category-badge";
import { AnimateIn } from "@/components/shared/animate-in";
import { ServiceIcon } from "@/components/shared/service-icon";
import { SERVICE_CATEGORY_LABELS } from "@/lib/constants";
import { getServices } from "@/lib/data";

export async function FeaturedServices() {
  const services = (await getServices()).slice(0, 6);

  return (
    <SectionContainer className="bg-muted/30">
      <SectionTitle
        title="خدمات برجسته"
        subtitle="طیف گسترده‌ای از خدمات مشاوره، کوچینگ و آموزش"
        centered
      />

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, i) => (
          <AnimateIn key={service.id} delay={(i % 3 + 1) as 1 | 2 | 3}>
            <Card className="group h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="h-1 bg-gradient-to-l from-primary to-accent" />
              <CardContent className="p-6">
                <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <ServiceIcon name={service.icon} />
                </div>
                  <CategoryBadge
                    label={
                      SERVICE_CATEGORY_LABELS[service.category] ??
                      service.category
                    }
                  />
                  <h3 className="mt-3 font-semibold transition-colors group-hover:text-primary">
                    {service.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                    {service.shortDescription}
                  </p>
              </CardContent>
            </Card>
          </AnimateIn>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Button asChild variant="outline" size="lg">
          <Link href="/services">
            مشاهده همه خدمات
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
      </div>
    </SectionContainer>
  );
}
