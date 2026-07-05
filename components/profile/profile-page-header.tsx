import { cn } from "@/lib/utils";

interface ProfilePageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function ProfilePageHeader({
  title,
  description,
  icon,
  className,
}: ProfilePageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      <div className="flex items-start gap-4">
        {icon && (
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-bl from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/20">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="mt-6 h-px bg-gradient-to-l from-transparent via-border to-transparent" />
    </div>
  );
}
