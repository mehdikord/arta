import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductContentListProps {
  chapters: string[];
  className?: string;
}

export function ProductContentList({
  chapters,
  className,
}: ProductContentListProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {chapters.map((chapter, i) => (
        <div
          key={i}
          className="group flex items-center gap-3 rounded-xl border bg-card/50 px-4 py-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
            {i + 1}
          </span>
          <span className="text-sm font-medium">{chapter}</span>
          <CheckCircle2 className="ms-auto size-4 text-muted-foreground/30 transition-colors group-hover:text-primary/50" />
        </div>
      ))}
    </div>
  );
}
