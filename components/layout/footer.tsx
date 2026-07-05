import Link from "next/link";
import {
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { NAV_ITEMS } from "@/lib/constants";
import type { SiteConfig } from "@/lib/data/site";

const socialIcons = {
  instagram: Share2,
  telegram: MessageCircle,
  linkedin: Globe,
} as const;

export function Footer({ site }: { site: SiteConfig }) {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary">
              {site.name}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {site.description}
            </p>
            <p className="text-sm font-medium text-accent">
              «{site.tagline}»
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">دسترسی سریع</h4>
            <ul className="space-y-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  سوالات متداول
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">تماس با ما</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
                <span dir="ltr" className="text-end">
                  {site.phone}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{site.email}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{site.address}</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">شبکه‌های اجتماعی</h4>
            <div className="flex gap-3">
              {(
                Object.entries(site.social) as [
                  keyof typeof socialIcons,
                  string,
                ][]
              ).map(([key, href]) => {
                const Icon = socialIcons[key as keyof typeof socialIcons];
                if (!Icon || !href) return null;
                return (
                  <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-10 items-center justify-center rounded-xl border bg-card text-muted-foreground transition-all hover:border-primary hover:text-primary hover:shadow-sm"
                    aria-label={key}
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name}. تمامی حقوق
            محفوظ است.
          </p>
        </div>
      </div>
    </footer>
  );
}
