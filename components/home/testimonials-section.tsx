import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SectionContainer } from "@/components/shared/section-container";
import { SectionTitle } from "@/components/shared/section-title";
import { AnimateIn } from "@/components/shared/animate-in";
import { getTestimonials } from "@/lib/data";

export async function TestimonialsSection() {
  const testimonials = await getTestimonials();

  return (
    <SectionContainer>
      <SectionTitle
        title="نظرات مراجعین"
        subtitle="تجربه واقعی افرادی که با آرتا همراه بودند"
        centered
      />

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {testimonials.map((t, i) => (
          <AnimateIn key={t.id} delay={(i % 2 + 1) as 1 | 2}>
            <Card className="relative overflow-hidden border-none bg-gradient-to-bl from-card to-muted/30 shadow-sm">
              <CardContent className="p-6">
                <Quote className="mb-4 size-8 text-primary/30" />
                <p className="leading-relaxed text-muted-foreground">
                  {t.content}
                </p>
                <div className="mt-6 flex items-center justify-between border-t pt-4">
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                  <div className="flex gap-0.5 text-accent" aria-label={`امتیاز ${t.rating} از ۵`}>
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <span key={idx}>★</span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimateIn>
        ))}
      </div>
    </SectionContainer>
  );
}
