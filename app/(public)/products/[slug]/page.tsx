import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/products/product-detail";
import { getProducts, getProductBySlug } from "@/lib/data";
import { SITE_CONFIG } from "@/lib/constants";
import { sanitizeBlogContent } from "@/lib/blog-content";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return { title: "یافت نشد" };

  return {
    title: product.title,
    description: product.shortDescription,
    openGraph: {
      title: `${product.title} | ${SITE_CONFIG.name}`,
      description: product.shortDescription,
      locale: "fa_IR",
      type: "website",
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return (
    <ProductDetail
      product={product}
      chapters={product.chapters}
      fullDescriptionHtml={sanitizeBlogContent(product.fullDescription)}
    />
  );
}
