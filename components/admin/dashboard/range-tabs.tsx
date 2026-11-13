"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  DASHBOARD_RANGES,
  DASHBOARD_RANGE_LABELS,
  type DashboardRange,
} from "@/lib/admin/dashboard-range";
import { cn } from "@/lib/utils";

export function RangeTabs({ value }: { value: DashboardRange }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      {pending && <Loader2 className="size-4 animate-spin text-muted-foreground" aria-hidden />}
      <div
        role="tablist"
        aria-label="بازهٔ زمانی"
        className="inline-flex rounded-xl border bg-white p-1 shadow-xs"
      >
        {DASHBOARD_RANGES.map((range) => {
          const active = range === value;
          return (
            <button
              key={range}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() =>
                startTransition(() => {
                  router.replace(`${pathname}?range=${range}`, { scroll: false });
                })
              }
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors sm:px-3.5 sm:text-sm",
                active
                  ? "bg-[#1e1e2d] text-white shadow-sm"
                  : "text-muted-foreground hover:bg-slate-100 hover:text-foreground",
              )}
            >
              {DASHBOARD_RANGE_LABELS[range]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
