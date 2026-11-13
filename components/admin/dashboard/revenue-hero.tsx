"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { ArrowDownLeft, ArrowUpLeft, Minus, Wallet } from "lucide-react";
import type { TrendPoint } from "@/lib/admin/queries/dashboard";
import { cn } from "@/lib/utils";
import {
  formatCompactToman,
  formatCount,
  formatPercent,
  formatToman,
} from "@/components/admin/dashboard/format";

const LINE = "#3fd0c6";

export function ChangePill({
  value,
  tone = "dark",
  suffix = "نسبت به دورهٔ قبل",
}: {
  value: number | null;
  tone?: "dark" | "light";
  suffix?: string;
}) {
  if (value === null) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
          tone === "dark" ? "bg-white/10 text-white/70" : "bg-slate-100 text-slate-600",
        )}
      >
        دورهٔ قبل: بدون داده
      </span>
    );
  }
  const rounded = Math.round(value * 10) / 10;
  const direction = rounded > 0 ? "up" : rounded < 0 ? "down" : "flat";
  const Icon = direction === "up" ? ArrowUpLeft : direction === "down" ? ArrowDownLeft : Minus;
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 text-[11px]">
      <span
        className={cn(
          "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-semibold",
          direction === "up" &&
            (tone === "dark" ? "bg-emerald-400/15 text-emerald-300" : "bg-emerald-50 text-emerald-700"),
          direction === "down" &&
            (tone === "dark" ? "bg-rose-400/15 text-rose-300" : "bg-rose-50 text-rose-700"),
          direction === "flat" &&
            (tone === "dark" ? "bg-white/10 text-white/70" : "bg-slate-100 text-slate-600"),
        )}
      >
        <Icon className="size-3" aria-hidden />
        <span className="sr-only">{direction === "up" ? "افزایش" : direction === "down" ? "کاهش" : "بدون تغییر"}</span>
        {formatPercent(rounded, Math.abs(rounded) < 10 ? 1 : 0)}
      </span>
      <span className={tone === "dark" ? "text-white/45" : "text-muted-foreground"}>{suffix}</span>
    </span>
  );
}

function HeroTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  const point = payload[0]!.payload as TrendPoint;
  return (
    <div dir="rtl" className="min-w-40 rounded-xl border border-white/10 bg-[#0f0f18]/95 px-3 py-2.5 text-xs text-white shadow-2xl backdrop-blur">
      <p className="mb-1.5 font-medium text-white/60">{point.label}</p>
      <p className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-1.5 text-white/70">
          <span className="size-2 rounded-full" style={{ background: LINE }} />
          فروش
        </span>
        <span className="font-semibold tabular-nums">{formatToman(point.revenue)}</span>
      </p>
      <p className="mt-1 flex items-center justify-between gap-4">
        <span className="ps-3.5 text-white/70">سفارش موفق</span>
        <span className="font-semibold tabular-nums">{formatCount(point.orders)}</span>
      </p>
    </div>
  );
}

export function RevenueHero({
  trend,
  revenue,
  revenueChange,
  paidOrders,
  buyers,
  freeClaims,
  rangePhrase,
}: {
  trend: TrendPoint[];
  revenue: number;
  revenueChange: number | null;
  paidOrders: number;
  buyers: number;
  freeClaims: number;
  rangePhrase: string;
}) {
  const hasData = trend.some((p) => p.revenue > 0);
  const best = hasData ? trend.reduce((a, b) => (b.revenue > a.revenue ? b : a)) : null;

  return (
    <section className="relative isolate overflow-hidden rounded-2xl bg-[#14141f] p-5 text-white shadow-lg sm:p-6">
      <div aria-hidden className="pointer-events-none absolute -top-24 -start-24 -z-10 size-72 rounded-full bg-[#2d6a6a] opacity-50 blur-[90px]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 end-0 -z-10 size-72 rounded-full bg-[#9b8ec4] opacity-25 blur-[100px]" />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm text-white/60">
            <Wallet className="size-4 text-[#3fd0c6]" />
            فروش {rangePhrase}
          </p>
          <p className="mt-2 text-3xl font-black tracking-tight tabular-nums sm:text-4xl">
            {formatToman(revenue)}
          </p>
          <div className="mt-2">
            <ChangePill value={revenueChange} />
          </div>
        </div>
        <dl className="grid grid-cols-3 gap-2 text-center sm:gap-3">
          {[
            { label: "سفارش پولی", value: paidOrders },
            { label: "خریدار", value: buyers },
            { label: "رایگان", value: freeClaims },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-white/[0.06] px-3 py-2 ring-1 ring-white/10">
              <dt className="text-[11px] text-white/50">{item.label}</dt>
              <dd className="text-lg font-bold tabular-nums">{formatCount(item.value)}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="relative mt-5 h-56 sm:h-64" dir="ltr">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 600, height: 256 }}>
          <AreaChart data={trend} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
            <defs>
              <linearGradient id="heroRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={LINE} stopOpacity={0.35} />
                <stop offset="100%" stopColor={LINE} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.07)" />
            <XAxis
              dataKey="label"
              reversed
              tickLine={false}
              axisLine={false}
              tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
              minTickGap={28}
              interval="preserveStartEnd"
            />
            <YAxis
              orientation="right"
              width={64}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
              tickFormatter={(v: number) => (v === 0 ? "۰" : formatCompactToman(v, false))}
            />
            <Tooltip
              content={HeroTooltip}
              cursor={{ stroke: "rgba(255,255,255,0.35)", strokeDasharray: "4 4" }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              name="فروش"
              stroke={LINE}
              strokeWidth={2}
              fill="url(#heroRevenue)"
              activeDot={{ r: 5, stroke: "#14141f", strokeWidth: 2, fill: LINE }}
              isAnimationActive
            />
          </AreaChart>
        </ResponsiveContainer>
        {!hasData && (
          <div className="absolute inset-0 flex items-center justify-center" dir="rtl">
            <p className="rounded-full bg-white/5 px-4 py-2 text-sm text-white/60 ring-1 ring-white/10">
              در این بازه فروشی ثبت نشده است
            </p>
          </div>
        )}
      </div>
      {best && (
        <p className="mt-3 text-xs text-white/45">
          بیشترین فروش: <span className="text-white/75">{best.label}</span> با{" "}
          <span className="text-white/75">{formatToman(best.revenue)}</span>
        </p>
      )}
    </section>
  );
}
