import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppointmentLink } from "@/components/shared/appointment-link";
import { SectionContainer } from "@/components/shared/section-container";
import { getSiteConfig } from "@/lib/data";

export async function HeroSection() {
  const site = await getSiteConfig();

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-bl from-primary/10 via-background to-secondary/40" />
      <div className="absolute -start-40 top-0 size-[500px] rounded-full bg-accent/15 blur-3xl" />
      <div className="absolute -bottom-32 -end-32 size-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute inset-0 section-pattern opacity-20" />

      <SectionContainer className="relative py-20 md:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="animate-fade-in inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/60 px-4 py-1.5 text-sm backdrop-blur-sm">
              <Sparkles className="size-4 text-primary" />
              <span className="text-muted-foreground">
                آکادمی تخصصی رشد و توانمندسازی
              </span>
            </div>

            <h1 className="animate-fade-in-up text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              <span className="text-gradient">{site.name}</span>
            </h1>

            <p className="animate-fade-in-up animate-fade-in-delay-1 text-lg text-muted-foreground md:text-xl">
              {site.tagline}
            </p>

            <p className="animate-fade-in-up animate-fade-in-delay-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
              {site.description}
            </p>

            <div className="animate-fade-in-up animate-fade-in-delay-3 flex flex-wrap gap-3 pt-2">
              <AppointmentLink size="lg" className="shadow-lg shadow-primary/20" />
              <Button asChild size="lg" variant="outline">
                <Link href="/services">
                  مشاهده خدمات
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="animate-fade-in-up animate-fade-in-delay-2 relative hidden lg:block">
            <div className="relative aspect-square max-w-md ms-auto">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-bl from-primary/20 to-accent/20" />
              <div className="absolute inset-4 rounded-3xl border border-white/40 bg-card/80 p-8 shadow-2xl backdrop-blur-sm">
                <div className="flex h-full flex-col justify-center gap-6">
                  {[
                    { label: "مشاوره تخصصی", value: "فردی و سازمانی" },
                    { label: "کارگاه آموزشی", value: "۸۰+ دوره" },
                    { label: "رضایت مراجعین", value: "۹۸٪" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl bg-muted/50 p-4"
                    >
                      <p className="text-xs text-muted-foreground">
                        {item.label}
                      </p>
                      <p className="mt-1 font-semibold text-primary">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-4 -start-4 size-24 rounded-2xl bg-secondary/80 shadow-lg" />
              <div className="absolute -end-4 -top-4 size-16 rounded-full bg-accent/30" />
            </div>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
