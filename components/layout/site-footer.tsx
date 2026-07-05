import { getSiteConfig } from "@/lib/data";
import { Footer } from "./footer";

export async function SiteFooter() {
  const site = await getSiteConfig();
  return <Footer site={site} />;
}
