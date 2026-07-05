import type { ReactNode } from "react";
import { Header } from "./header";
import { Footer } from "./footer";
import { ScrollToTop } from "@/components/shared/scroll-to-top";
import { SiteConfigProvider } from "@/components/site/site-config-provider";
import { SITE_CONFIG } from "@/lib/constants";
import type { SiteConfig } from "@/lib/data/site";

const defaultSite: SiteConfig = {
  name: SITE_CONFIG.name,
  shortName: SITE_CONFIG.shortName,
  tagline: SITE_CONFIG.tagline,
  description: SITE_CONFIG.description,
  phone: SITE_CONFIG.phone,
  email: SITE_CONFIG.email,
  address: SITE_CONFIG.address,
  workingHours: SITE_CONFIG.workingHours,
  social: { ...SITE_CONFIG.social },
};

interface MainLayoutProps {
  children: ReactNode;
  site?: SiteConfig;
  footer?: ReactNode;
}

export function MainLayout({
  children,
  site = defaultSite,
  footer,
}: MainLayoutProps) {
  return (
    <SiteConfigProvider site={site}>
      <div className="flex min-h-screen flex-col">
        <ScrollToTop />
        <Header />
        <main className="flex-1">{children}</main>
        {footer ?? <Footer site={site} />}
      </div>
    </SiteConfigProvider>
  );
}
