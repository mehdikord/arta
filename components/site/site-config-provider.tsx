"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SiteConfig } from "@/lib/data/site";

const SiteConfigContext = createContext<SiteConfig | null>(null);

export function SiteConfigProvider({
  site,
  children,
}: {
  site: SiteConfig;
  children: ReactNode;
}) {
  return (
    <SiteConfigContext.Provider value={site}>{children}</SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const site = useContext(SiteConfigContext);
  if (!site) {
    throw new Error("useSiteConfig must be used within SiteConfigProvider");
  }
  return site;
}
