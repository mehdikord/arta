import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  change?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  change,
  trend = "neutral",
  className,
}: StatCardProps) {
  return (
    <div className={cn("admin-stat-card p-5 md:p-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {change && (
            <div className="mt-2 flex items-center gap-1">
              {trend === "up" && (
                <TrendingUp className="size-3.5 text-emerald-600" />
              )}
              {trend === "down" && (
                <TrendingDown className="size-3.5 text-red-500" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  trend === "up" && "text-emerald-600",
                  trend === "down" && "text-red-500",
                  trend === "neutral" && "text-muted-foreground",
                )}
              >
                {change}
              </span>
            </div>
          )}
        </div>
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-6" />
        </div>
      </div>
    </div>
  );
}
