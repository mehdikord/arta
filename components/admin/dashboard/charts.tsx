"use client";

import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import {
  formatCompactToman,
  formatCount,
  formatPercent,
  formatToman,
} from "@/components/admin/dashboard/format";

/**
 * Categorical slots — validated with the dataviz palette checker
 * (lightness band, chroma, CVD + normal-vision separation all PASS).
 * Slots 4–5 are low-contrast, so the donut always ships with a labelled legend.
 */
export const CATEGORY_COLORS = ["#0f9690", "#eb6834", "#6250d6", "#eda100", "#e87ba4"] as const;
export const OTHER_COLOR = "#94a3b8";

/** Tiny trend line for KPI cards (single series, no axes). */
export function Sparkline({
  data,
  color = "#0f9690",
  label,
  format = "count",
}: {
  data: { label: string; value: number }[];
  color?: string;
  label: string;
  format?: "count" | "money";
}) {
  const id = `spark-${label.replace(/\s+/g, "-")}`;
  return (
    <div className="h-12 w-full" dir="ltr">
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 160, height: 48 }}>
        <AreaChart data={data} margin={{ top: 4, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            cursor={{ stroke: "rgba(15,23,42,0.2)" }}
            content={({ active, payload }: TooltipContentProps<ValueType, NameType>) => {
              if (!active || !payload?.length) return null;
              const point = payload[0]!.payload as { label: string; value: number };
              return (
                <div dir="rtl" className="rounded-lg border bg-white px-2.5 py-1.5 text-[11px] shadow-md">
                  <span className="text-muted-foreground">{point.label}: </span>
                  <span className="font-semibold">
                    {format === "money" ? formatToman(point.value) : formatCount(point.value)}
                  </span>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            name={label}
            stroke={color}
            strokeWidth={2}
            fill={`url(#${id})`}
            dot={false}
            activeDot={{ r: 3.5, strokeWidth: 0, fill: color }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryDonut({
  data,
}: {
  data: { name: string; revenue: number; orders: number }[];
}) {
  const total = data.reduce((sum, d) => sum + d.revenue, 0);
  const useOrders = total === 0;
  const valueKey = useOrders ? "orders" : "revenue";
  const grand = data.reduce((sum, d) => sum + d[valueKey], 0);
  const colored = data.map((d, i) => ({
    ...d,
    value: d[valueKey],
    color: d.name === "سایر" ? OTHER_COLOR : CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row lg:flex-col">
      <div className="relative size-40 shrink-0" dir="ltr">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 160, height: 160 }}>
          <PieChart>
            <Tooltip
              content={({ active, payload }: TooltipContentProps<ValueType, NameType>) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]!.payload as (typeof colored)[number];
                return (
                  <div dir="rtl" className="rounded-lg border bg-white px-3 py-2 text-xs shadow-md">
                    <p className="mb-1 flex items-center gap-1.5 font-medium">
                      <span className="size-2 rounded-full" style={{ background: d.color }} />
                      {d.name}
                    </p>
                    <p className="text-muted-foreground">
                      {formatToman(d.revenue)} · {formatCount(d.orders)} سفارش
                    </p>
                  </div>
                );
              }}
            />
            <Pie
              data={colored}
              dataKey="value"
              nameKey="name"
              innerRadius="64%"
              outerRadius="100%"
              paddingAngle={colored.length > 1 ? 2 : 0}
              cornerRadius={4}
              stroke="#fff"
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
            >
              {colored.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center" dir="rtl">
          <span className="text-[10px] text-muted-foreground">{useOrders ? "سفارش" : "جمع فروش"}</span>
          <span className="text-sm font-bold">
            {useOrders ? formatCount(grand) : formatCompactToman(grand, false)}
          </span>
        </div>
      </div>
      <ul className="w-full min-w-0 space-y-2.5">
        {colored.map((d) => (
          <li key={d.name} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 shrink-0 rounded-sm" style={{ background: d.color }} aria-hidden />
            <span className="min-w-0 flex-1 truncate">{d.name}</span>
            <span className="text-xs tabular-nums text-muted-foreground">
              {grand ? formatPercent((d.value / grand) * 100) : "—"}
            </span>
            <span className="shrink-0 whitespace-nowrap text-left text-xs font-semibold tabular-nums">
              {useOrders ? `${formatCount(d.orders)} سفارش` : formatCompactToman(d.revenue)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
