import { Breadcrumb, type BreadcrumbItem } from "@/components/layout/breadcrumb";
import { cn } from "@/lib/utils";

interface PageHeroProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}

export function PageHero({
  title,
  description,
  breadcrumbs,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b bg-gradient-to-bl from-primary/8 via-background to-secondary/20",
        className,
      )}
    >
      <div className="absolute -start-20 -top-20 size-64 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute -bottom-16 -end-16 size-48 rounded-full bg-primary/10 blur-2xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb items={breadcrumbs} className="mb-6" />
        )}
        <h1 className="animate-fade-in-up text-3xl font-bold md:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="animate-fade-in-up animate-fade-in-delay-1 mt-3 max-w-2xl text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
