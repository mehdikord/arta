/**
 * Dashboard time ranges, bucketed in Tehran time and labelled in the
 * Jalali (Persian) calendar. Iran has no DST since 2022 → fixed +03:30.
 */

export const DASHBOARD_RANGES = ["7d", "30d", "90d", "12m"] as const;
export type DashboardRange = (typeof DASHBOARD_RANGES)[number];
export const DEFAULT_DASHBOARD_RANGE: DashboardRange = "30d";

export const DASHBOARD_RANGE_LABELS: Record<DashboardRange, string> = {
  "7d": "۷ روز",
  "30d": "۳۰ روز",
  "90d": "۹۰ روز",
  "12m": "۱۲ ماه",
};

export const DASHBOARD_RANGE_PHRASES: Record<DashboardRange, string> = {
  "7d": "۷ روز گذشته",
  "30d": "۳۰ روز گذشته",
  "90d": "۹۰ روز گذشته",
  "12m": "۱۲ ماه گذشته",
};

export function parseDashboardRange(value: unknown): DashboardRange {
  return DASHBOARD_RANGES.includes(value as DashboardRange)
    ? (value as DashboardRange)
    : DEFAULT_DASHBOARD_RANGE;
}

const TEHRAN_OFFSET_MS = 3.5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** YYYY-MM-DD of the Tehran wall-clock day containing `date`. */
export function tehranDayKey(date: Date): string {
  return new Date(date.getTime() + TEHRAN_OFFSET_MS).toISOString().slice(0, 10);
}

/** UTC instant of Tehran midnight for a YYYY-MM-DD key. */
export function tehranMidnight(dayKey: string): Date {
  return new Date(Date.parse(`${dayKey}T00:00:00Z`) - TEHRAN_OFFSET_MS);
}

/** `@db.Date` columns are stored as UTC midnight of the calendar day. */
export function tehranTodayAsDbDate(now = new Date()): Date {
  return new Date(`${tehranDayKey(now)}T00:00:00Z`);
}

const jalaliMonthKeyFormat = new Intl.DateTimeFormat("en-US-u-ca-persian-nu-latn", {
  timeZone: "Asia/Tehran",
  year: "numeric",
  month: "numeric",
});
const jalaliDayLabelFormat = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  timeZone: "Asia/Tehran",
  day: "numeric",
  month: "short",
});
const jalaliMonthLabelFormat = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  timeZone: "Asia/Tehran",
  month: "long",
  year: "2-digit",
});
const jalaliFullFormat = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  timeZone: "Asia/Tehran",
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const jalaliShortFormat = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  timeZone: "Asia/Tehran",
  day: "numeric",
  month: "long",
});
const tehranTimeFormat = new Intl.DateTimeFormat("fa-IR", {
  timeZone: "Asia/Tehran",
  hour: "2-digit",
  minute: "2-digit",
});

export function jalaliMonthKey(date: Date): string {
  const parts = jalaliMonthKeyFormat.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value ?? "0";
  const month = parts.find((p) => p.type === "month")?.value ?? "0";
  return `${year}-${month.padStart(2, "0")}`;
}

export function formatJalaliFullDate(date: Date): string {
  return jalaliFullFormat.format(date);
}

export function formatJalaliShortDate(date: Date): string {
  return jalaliShortFormat.format(date);
}

export function formatTehranTime(date: Date): string {
  return tehranTimeFormat.format(date);
}

/** Persian relative time ("۵ دقیقه پیش"), falling back to a Jalali date. */
export function formatRelativeFa(date: Date, now = new Date()): string {
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (minutes < 1) return "همین حالا";
  if (minutes < 60) return `${minutes.toLocaleString("fa-IR")} دقیقه پیش`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours.toLocaleString("fa-IR")} ساعت پیش`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "دیروز";
  if (days < 7) return `${days.toLocaleString("fa-IR")} روز پیش`;
  return formatJalaliShortDate(date);
}

export type RangeBucket = { key: string; label: string };

export type ResolvedRange = {
  range: DashboardRange;
  start: Date;
  /** Start of the equally long previous period (for comparisons). */
  prevStart: Date;
  buckets: RangeBucket[];
  bucketOf: (date: Date) => string;
};

export function resolveDashboardRange(range: DashboardRange, now = new Date()): ResolvedRange {
  const todayKey = tehranDayKey(now);
  const todayMidnight = tehranMidnight(todayKey);

  if (range === "12m") {
    // Walk back day by day until 12 distinct Jalali months are covered.
    const months: string[] = [];
    let cursor = todayMidnight;
    let firstDayOfOldest = todayMidnight;
    for (let i = 0; i < 400; i++) {
      const key = jalaliMonthKey(cursor);
      if (!months.includes(key)) {
        if (months.length === 12) break;
        months.unshift(key);
      }
      firstDayOfOldest = cursor;
      cursor = new Date(cursor.getTime() - DAY_MS);
    }
    const start = firstDayOfOldest;
    const length = now.getTime() - start.getTime();
    const buckets: RangeBucket[] = [];
    // Labels: use the 15th-ish day of each month to avoid edge rounding.
    let probe = start;
    for (const key of months) {
      while (jalaliMonthKey(probe) !== key) probe = new Date(probe.getTime() + DAY_MS);
      buckets.push({ key, label: jalaliMonthLabelFormat.format(new Date(probe.getTime() + 10 * DAY_MS)) });
    }
    return {
      range,
      start,
      prevStart: new Date(start.getTime() - length),
      buckets,
      bucketOf: jalaliMonthKey,
    };
  }

  if (range === "90d") {
    // 13 weekly buckets ending today (91 days) — daily points are too dense.
    const WEEKS = 13;
    const start = new Date(todayMidnight.getTime() - (WEEKS * 7 - 1) * DAY_MS);
    const buckets: RangeBucket[] = [];
    for (let i = 0; i < WEEKS; i++) {
      const weekStart = new Date(start.getTime() + i * 7 * DAY_MS);
      buckets.push({ key: `w${i}`, label: `هفتهٔ ${jalaliDayLabelFormat.format(weekStart)}` });
    }
    return {
      range,
      start,
      prevStart: new Date(start.getTime() - WEEKS * 7 * DAY_MS),
      buckets,
      bucketOf: (date) => {
        const day = tehranMidnight(tehranDayKey(date));
        return `w${Math.floor((day.getTime() - start.getTime()) / (7 * DAY_MS))}`;
      },
    };
  }

  const days = range === "7d" ? 7 : 30;
  const start = new Date(todayMidnight.getTime() - (days - 1) * DAY_MS);
  const buckets: RangeBucket[] = [];
  for (let i = 0; i < days; i++) {
    const day = new Date(start.getTime() + i * DAY_MS);
    buckets.push({ key: tehranDayKey(day), label: jalaliDayLabelFormat.format(day) });
  }
  return {
    range,
    start,
    prevStart: new Date(start.getTime() - days * DAY_MS),
    buckets,
    bucketOf: tehranDayKey,
  };
}
