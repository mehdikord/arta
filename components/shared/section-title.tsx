import { cn } from "@/lib/utils";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export function SectionTitle({
  title,
  subtitle,
  centered = false,
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        "space-y-3",
        centered && "text-center",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3",
          centered && "justify-center",
        )}
      >
        <span className="h-px w-8 bg-gradient-to-l from-transparent to-primary" />
        <h2 className="text-gradient">{title}</h2>
        <span className="h-px w-8 bg-gradient-to-r from-transparent to-primary" />
      </div>
      {subtitle && (
        <p
          className={cn(
            "max-w-2xl text-muted-foreground",
            centered && "mx-auto",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
