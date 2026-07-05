import type { MetadataRoute } from "next";
import {
  getBlogPosts,
  getPortfolioItems,
  getProducts,
} from "@/lib/data";

const BASE_URL = "https://arta-academy.ir";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [portfolioItems, products, blogPosts] = await Promise.all([
    getPortfolioItems(),
    getProducts(),
    getBlogPosts(),
  ]);

  const staticPages = [
    "",
    "/about",
    "/contact",
    "/services",
    "/faq",
    "/portfolio",
    "/products",
    "/blog",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));

  const portfolioEntries: MetadataRoute.Sitemap = portfolioItems.map(
    (item) => ({
      url: `${BASE_URL}/portfolio/${item.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    }),
  );

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${BASE_URL}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...portfolioEntries, ...productEntries, ...blogEntries];
}
