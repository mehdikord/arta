import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionContainer } from "@/components/shared/section-container";
import { SectionTitle } from "@/components/shared/section-title";
import { ProductCard } from "@/components/products/product-card";
import { AnimateIn } from "@/components/shared/animate-in";
import { getFeaturedProducts } from "@/lib/data";

export async function FeaturedProducts() {
  const products = (await getFeaturedProducts()).slice(0, 3);

  return (
    <SectionContainer>
      <SectionTitle
        title="پکیج‌های پیشنهادی"
        subtitle="منابع آموزشی برای رشد شخصی و حرفه‌ای"
        centered
      />

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {products.map((product, i) => (
          <AnimateIn key={product.id} delay={(i + 1) as 1 | 2 | 3}>
            <ProductCard product={product} />
          </AnimateIn>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Button asChild size="lg">
          <Link href="/products">
            مشاهده همه پکیج‌ها
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
      </div>
    </SectionContainer>
  );
}
