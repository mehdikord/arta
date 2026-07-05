import Link from "next/link";
import { ArrowRight, Building2, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PortfolioImage } from "./portfolio-image";
import { PortfolioGallery } from "./portfolio-gallery";
import { CtaBanner } from "@/components/shared/cta-banner";
import { SectionContainer } from "@/components/shared/section-container";
import { parsePortfolioDescription } from "@/lib/portfolio";
import type { PortfolioItem } from "@/types";

interface PortfolioDetailProps {
  item: PortfolioItem;
}

export function PortfolioDetail({ item }: PortfolioDetailProps) {
  const { paragraphs, bullets } = parsePortfolioDescription(item.fullDescription);
  const galleryImages = item.gallery ?? [];

  return (
    <>
      <section className="relative border-b">
        <div className="relative aspect-[21/9] max-h-[480px] w-full overflow-hidden md:aspect-[21/8]">
          <PortfolioImage
            src={item.image}
            alt={item.title}
            category={item.category}
            className="absolute inset-0"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
            <Breadcrumb
              items={[
                { label: "نمونه‌کارها", href: "/portfolio" },
                { label: item.title },
              ]}
              className="mb-4 text-primary-foreground/80 [&_a]:text-primary-foreground/80 [&_a:hover]:text-primary-foreground [&_span]:text-primary-foreground"
            />
            <Badge className="mb-3 bg-card/90 text-foreground backdrop-blur-sm">
              {item.category}
            </Badge>
            <h1 className="max-w-3xl text-2xl font-bold text-primary-foreground md:text-4xl">
              {item.title}
            </h1>
          </div>
        </div>
      </section>

      <SectionContainer>
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-semibold">درباره پروژه</h2>
              <div className="mt-4 space-y-4 text-muted-foreground leading-relaxed">
                {paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>

            {bullets.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold">دستاوردها</h2>
                <ul className="mt-4 space-y-3">
                  {bullets.map((bullet, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-muted-foreground"
                    >
                      <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {galleryImages.length > 0 && (
              <div>
                <h2 className="mb-4 text-xl font-semibold">گالری تصاویر</h2>
                <PortfolioGallery
                  images={galleryImages}
                  title={item.title}
                  category={item.category}
                />
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border bg-card p-6 shadow-sm">
              <h3 className="font-semibold">اطلاعات پروژه</h3>
              <Separator className="my-4" />
              <dl className="space-y-4 text-sm">
                {item.year && (
                  <div className="flex items-center gap-3">
                    <Calendar className="size-4 text-primary" />
                    <div>
                      <dt className="text-muted-foreground">سال</dt>
                      <dd className="font-medium">{item.year}</dd>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Building2 className="size-4 text-primary" />
                  <div>
                    <dt className="text-muted-foreground">دسته‌بندی</dt>
                    <dd className="font-medium">{item.category}</dd>
                  </div>
                </div>
                {item.client && (
                  <div className="flex items-center gap-3">
                    <User className="size-4 text-primary" />
                    <div>
                      <dt className="text-muted-foreground">مشتری</dt>
                      <dd className="font-medium">{item.client}</dd>
                    </div>
                  </div>
                )}
              </dl>
            </div>

            <div className="flex flex-col gap-3">
              <Button asChild variant="outline">
                <Link href="/portfolio">
                  <ArrowRight className="size-4" />
                  بازگشت به لیست
                </Link>
              </Button>
              <Button asChild>
                <Link href="/contact">تماس با ما</Link>
              </Button>
            </div>
          </aside>
        </div>
      </SectionContainer>

      <SectionContainer>
        <CtaBanner
          title="پروژه مشابهی دارید؟"
          description="با تیم آرتا تماس بگیرید تا بهترین راهکار را برای شما طراحی کنیم."
          primaryLabel="تماس با ما"
          primaryHref="/contact"
          secondaryLabel="مشاهده خدمات"
          secondaryHref="/services"
        />
      </SectionContainer>
    </>
  );
}
