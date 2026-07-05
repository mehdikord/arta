import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CtaBannerProps {
  title: string;
  description?: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  className?: string;
}

export function CtaBanner({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  className,
}: CtaBannerProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl bg-gradient-to-bl from-primary via-primary/90 to-accent px-8 py-12 text-primary-foreground shadow-xl",
        className,
      )}
    >
      <div className="absolute -start-20 -top-20 size-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-16 -end-16 size-48 rounded-full bg-secondary/20 blur-2xl" />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold text-primary-foreground md:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-primary-foreground/85">{description}</p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            size="lg"
            variant="secondary"
            className="shadow-md"
          >
            <Link href={primaryHref}>{primaryLabel}</Link>
          </Button>
          {secondaryLabel && secondaryHref && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-white/10"
            >
              <Link href={secondaryHref}>
                {secondaryLabel}
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
