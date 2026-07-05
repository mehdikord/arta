import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionContainer } from "@/components/shared/section-container";
import { SectionTitle } from "@/components/shared/section-title";
import { AnimateIn } from "@/components/shared/animate-in";
import { getSiteConfig } from "@/lib/data";

const highlights = [
  "تیم متخصص با بیش از ۱۲ سال تجربه",
  "رویکرد علمی و انسان‌محور",
  "محیطی امن و بدون قضاوت",
  "خدمات حضوری و آنلاین",
];

export async function IntroSection() {
  const site = await getSiteConfig();

  return (
    <SectionContainer>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <AnimateIn>
          <SectionTitle
            title="درباره آکادمی آرتا"
            subtitle="همراه شما در مسیر رشد و توانمندسازی"
          />
          <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
            <p>{site.description}</p>
            <p>
              آکادمی آرتا در سال ۱۳۹۲ با هدف ارائه خدمات تخصصی روانشناسی،
              مشاوره و کوچینگ تأسیس شد. ما معتقدیم هر فردی پتانسیل رشد و
              تحول درونی دارد و با حمایت درست می‌تواند به آن دست یابد.
            </p>
            <p>
              امروز با تیمی متشکل از روانشناسان، مشاوران و مربیان، خدمات
              متنوعی از مشاوره فردی و خانوادگی تا برنامه‌های سازمانی و
              پکیج‌های آموزشی ارائه می‌دهیم.
            </p>
          </div>
          <Button asChild variant="link" className="mt-4 px-0">
            <Link href="/about">
              بیشتر بدانید
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
        </AnimateIn>

        <AnimateIn delay={2}>
          <div className="rounded-3xl border bg-gradient-to-bl from-muted/50 to-card p-8 shadow-sm">
            <h3 className="mb-6 font-semibold">چرا آرتا؟</h3>
            <ul className="space-y-4">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </AnimateIn>
      </div>
    </SectionContainer>
  );
}
