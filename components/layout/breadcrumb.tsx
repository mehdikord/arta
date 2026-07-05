import Link from "next/link";
import { ChevronLeft, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="مسیر صفحه"
      className={cn("flex items-center gap-1 text-sm text-muted-foreground", className)}
    >
      <Link
        href="/"
        className="flex items-center gap-1 transition-colors hover:text-primary"
      >
        <Home className="size-3.5" />
        <span>خانه</span>
      </Link>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          <ChevronLeft className="size-3.5" />
          {item.href ? (
            <Link
              href={item.href}
              className="transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
