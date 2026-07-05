import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioDetail } from "@/components/portfolio/portfolio-detail";
import { getPortfolioItems, getPortfolioItemBySlug } from "@/lib/data";
import { SITE_CONFIG } from "@/lib/constants";

interface PortfolioDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const items = await getPortfolioItems();
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: PortfolioDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getPortfolioItemBySlug(slug);

  if (!item) {
    return { title: "یافت نشد" };
  }

  return {
    title: item.title,
    description: item.shortDescription,
    openGraph: {
      title: `${item.title} | ${SITE_CONFIG.name}`,
      description: item.shortDescription,
      locale: "fa_IR",
      type: "article",
    },
  };
}

export default async function PortfolioDetailPage({
  params,
}: PortfolioDetailPageProps) {
  const { slug } = await params;
  const item = await getPortfolioItemBySlug(slug);

  if (!item) {
    notFound();
  }

  return <PortfolioDetail item={item} />;
}
