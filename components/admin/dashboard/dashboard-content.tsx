import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BadgePercent,
  BookOpen,
  Briefcase,
  CalendarClock,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  Cpu,
  Database,
  FilePlus2,
  FolderKanban,
  HardDrive,
  HelpCircle,
  Inbox,
  Landmark,
  MessageSquareQuote,
  Package,
  PackagePlus,
  Receipt,
  ShoppingBag,
  Sparkles,
  Undo2,
  UploadCloud,
  UserPlus,
  Users,
  UsersRound,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RangeTabs } from "@/components/admin/dashboard/range-tabs";
import { ChangePill, RevenueHero } from "@/components/admin/dashboard/revenue-hero";
import { CategoryDonut, Sparkline } from "@/components/admin/dashboard/charts";
import {
  formatCompactToman,
  formatCount,
  formatPercent,
  formatToman,
  formatUptime,
} from "@/components/admin/dashboard/format";
import {
  DASHBOARD_RANGE_PHRASES,
  formatJalaliFullDate,
  formatJalaliShortDate,
} from "@/lib/admin/dashboard-range";
import { APPOINTMENT_SLOT_LABELS } from "@/lib/admin/format";
import { formatFileSize } from "@/lib/product-file-types";
import type { ActivityItem, DashboardData } from "@/lib/admin/queries/dashboard";
import type { PurchaseStatus } from "@/lib/generated/prisma/client";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Building blocks                                                     */
/* ------------------------------------------------------------------ */

function Panel({
  title,
  description,
  icon: Icon,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: { label: string; href: string };
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("flex min-w-0 flex-col rounded-2xl border border-slate-200/70 bg-white shadow-xs", className)}>
      <header className="flex items-start justify-between gap-3 px-5 pt-5">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Icon className="size-[18px]" />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="text-[15px] font-bold leading-6">{title}</h2>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        </div>
        {action && (
          <Link
            href={action.href}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[#2d6a6a] transition-colors hover:bg-[#2d6a6a]/10"
          >
            {action.label}
            <ArrowLeft className="size-3.5" />
          </Link>
        )}
      </header>
      <div className={cn("flex-1 p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

function EmptyState({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex h-full min-h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-slate-50/60 px-4 py-6 text-center">
      <Icon className="size-6 text-slate-400" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
  change,
  footer,
  href,
  children,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent: string;
  change?: number | null;
  footer?: ReactNode;
  href?: string;
  children?: ReactNode;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-muted-foreground">{label}</p>
          <p className="mt-1.5 truncate text-2xl font-extrabold tracking-tight tabular-nums">{value}</p>
        </div>
        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", accent)}>
          <Icon className="size-5" />
        </span>
      </div>
      {change !== undefined && (
        <div className="mt-2">
          <ChangePill value={change} tone="light" />
        </div>
      )}
      {children && <div className="mt-3">{children}</div>}
      {footer && <div className="mt-3 border-t pt-3 text-xs text-muted-foreground">{footer}</div>}
    </>
  );
  const className =
    "group relative flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-xs transition-[box-shadow,border-color] hover:border-slate-300 hover:shadow-md";
  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

const PURCHASE_STATUS_UI: Record<
  PurchaseStatus,
  { label: string; icon: LucideIcon; text: string; bar: string; chip: string }
> = {
  COMPLETED: { label: "موفق", icon: CheckCircle2, text: "text-emerald-700", bar: "bg-emerald-500", chip: "bg-emerald-50 text-emerald-700 ring-emerald-600/15" },
  PENDING: { label: "در انتظار", icon: Clock3, text: "text-amber-700", bar: "bg-amber-400", chip: "bg-amber-50 text-amber-700 ring-amber-600/15" },
  FAILED: { label: "ناموفق", icon: XCircle, text: "text-rose-700", bar: "bg-rose-500", chip: "bg-rose-50 text-rose-700 ring-rose-600/15" },
  REFUNDED: { label: "مسترد", icon: Undo2, text: "text-slate-600", bar: "bg-slate-400", chip: "bg-slate-100 text-slate-700 ring-slate-500/15" },
};

function StatusChip({ status }: { status: PurchaseStatus }) {
  const ui = PURCHASE_STATUS_UI[status];
  const Icon = ui.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset", ui.chip)}>
      <Icon className="size-3" />
      {ui.label}
    </span>
  );
}

const ACTIVITY_UI: Record<ActivityItem["type"], { icon: LucideIcon; className: string }> = {
  purchase: { icon: ShoppingBag, className: "bg-[#0f9690]/10 text-[#0f9690]" },
  refund: { icon: Undo2, className: "bg-slate-100 text-slate-600" },
  appointment: { icon: CalendarPlus, className: "bg-blue-50 text-blue-600" },
  contact: { icon: Inbox, className: "bg-amber-50 text-amber-600" },
  register: { icon: UserPlus, className: "bg-violet-50 text-violet-600" },
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts.length > 1 ? parts[0]![0]! + parts[1]![0]! : name.slice(0, 2)).toUpperCase();
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function DashboardHeader({ data, adminName }: { data: DashboardData; adminName: string }) {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tehran", hour: "numeric", hourCycle: "h23" }).format(new Date()),
  );
  const greeting = hour < 12 ? "صبح بخیر" : hour < 17 ? "روز بخیر" : "عصر بخیر";

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{formatJalaliFullDate(new Date())}</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">
          {greeting}، {adminName.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data.canSeeOperations
            ? `خلاصهٔ وضعیت فروش، کاربران و سایت در ${DASHBOARD_RANGE_PHRASES[data.range]}`
            : "خلاصهٔ وضعیت محتوا و سیستم"}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {data.canSeeOperations && <RangeTabs value={data.range} />}
        <Button asChild size="sm" className="h-9 rounded-xl bg-[#2d6a6a] hover:bg-[#245858]">
          <Link href="/admins/products/new">
            <PackagePlus className="size-4" />
            پکیج جدید
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="h-9 rounded-xl bg-white">
          <Link href="/admins/blog/new">
            <FilePlus2 className="size-4" />
            مقاله جدید
          </Link>
        </Button>
      </div>
    </div>
  );
}

function FinanceTiles({ finance, rangePhrase }: { finance: NonNullable<DashboardData["finance"]>; rangePhrase: string }) {
  const pendingOrFailed = finance.statusBreakdown
    .filter((s) => s.status === "PENDING" || s.status === "FAILED")
    .reduce((acc, s) => ({ count: acc.count + s.count, amount: acc.amount + s.amount }), { count: 0, amount: 0 });

  const tiles = [
    {
      label: "کل فروش از ابتدا",
      value: formatCompactToman(finance.allTimeRevenue, false),
      unit: "تومان",
      title: formatToman(finance.allTimeRevenue),
      icon: Landmark,
      accent: "bg-[#0f9690]/10 text-[#0f9690]",
      footer: `${formatCount(finance.allTimeOrders)} خرید موفق`,
    },
    {
      label: "میانگین هر خرید",
      value: finance.averageOrder ? formatCompactToman(finance.averageOrder, false) : "—",
      unit: finance.averageOrder ? "تومان" : "",
      title: formatToman(finance.averageOrder),
      icon: Receipt,
      accent: "bg-violet-50 text-violet-600",
      change: finance.averageOrderChange,
    },
    {
      label: "مبالغ مسترد",
      value: finance.refunds.amount ? formatCompactToman(finance.refunds.amount, false) : "۰",
      unit: finance.refunds.amount ? "تومان" : "",
      title: formatToman(finance.refunds.amount),
      icon: Undo2,
      accent: "bg-slate-100 text-slate-600",
      footer: `${formatCount(finance.refunds.count)} استرداد در ${rangePhrase}`,
    },
    {
      label: "ناموفق / در انتظار",
      value: formatCount(pendingOrFailed.count),
      unit: "تراکنش",
      title: formatToman(pendingOrFailed.amount),
      icon: pendingOrFailed.count ? AlertTriangle : CheckCircle2,
      accent: pendingOrFailed.count ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600",
      footer: pendingOrFailed.count ? `${formatCompactToman(pendingOrFailed.amount)} پرداخت نهایی‌نشده` : "پرداخت معوقی وجود ندارد",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {tiles.map((tile) => (
        <div key={tile.label} className="flex flex-col rounded-2xl border border-slate-200/70 bg-white p-4 shadow-xs">
          <span className={cn("flex size-9 items-center justify-center rounded-xl", tile.accent)}>
            <tile.icon className="size-[18px]" />
          </span>
          <p className="mt-3 text-xs font-medium text-muted-foreground">{tile.label}</p>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-1 text-lg font-extrabold leading-snug tracking-tight tabular-nums sm:text-xl" title={tile.title}>
            <span>{tile.value}</span>
            {tile.unit && <span className="shrink-0 text-[11px] font-medium text-muted-foreground">{tile.unit}</span>}
          </p>
          <div className="mt-auto pt-2 text-[11px] text-muted-foreground">
            {"change" in tile && tile.change !== undefined ? <ChangePill value={tile.change ?? null} tone="light" suffix="" /> : tile.footer}
          </div>
        </div>
      ))}
    </div>
  );
}

function TopProducts({ products }: { products: NonNullable<DashboardData["finance"]>["topProducts"] }) {
  if (!products.length) return <EmptyState icon={Package} text="در این بازه پکیجی فروخته نشده است" />;
  const max = Math.max(...products.map((p) => p.revenue), 1);
  return (
    <ol className="space-y-4">
      {products.map((product, index) => (
        <li key={product.id} className="flex items-center gap-3">
          <span className="w-4 text-center text-xs font-bold text-muted-foreground tabular-nums">
            {formatCount(index + 1)}
          </span>
          <span className="relative size-10 shrink-0 overflow-hidden rounded-lg border bg-slate-100">
            {product.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.image} alt="" className="size-full object-cover" loading="lazy" />
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <Link href={`/admins/products/${product.id}/edit`} className="truncate text-sm font-medium hover:text-[#2d6a6a]">
                {product.title}
              </Link>
              <span className="shrink-0 text-xs font-semibold tabular-nums">
                {product.revenue ? formatCompactToman(product.revenue) : "رایگان"}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[#0f9690]"
                  style={{ width: `${Math.max(4, (product.revenue / max) * 100)}%` }}
                />
              </div>
              <span className="shrink-0 text-[11px] text-muted-foreground">
                {formatCount(product.orders)} فروش · {product.category}
              </span>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function StatusBreakdown({ finance }: { finance: NonNullable<DashboardData["finance"]> }) {
  const total = finance.statusBreakdown.reduce((sum, s) => sum + s.count, 0);
  if (!total) return <EmptyState icon={Receipt} text="تراکنشی در این بازه ثبت نشده است" />;
  const successRate = ((finance.statusBreakdown.find((s) => s.status === "COMPLETED")?.count ?? 0) / total) * 100;
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs text-muted-foreground">نرخ موفقیت پرداخت</p>
        <p className="text-3xl font-black tabular-nums">{formatPercent(successRate)}</p>
      </div>
      <div className="flex h-3 gap-0.5 overflow-hidden rounded-full" role="img" aria-label="ترکیب وضعیت تراکنش‌ها">
        {finance.statusBreakdown
          .filter((s) => s.count > 0)
          .map((s) => (
            <div
              key={s.status}
              className={cn("h-full first:rounded-s-full last:rounded-e-full", PURCHASE_STATUS_UI[s.status].bar)}
              style={{ width: `${(s.count / total) * 100}%` }}
              title={`${PURCHASE_STATUS_UI[s.status].label}: ${formatCount(s.count)}`}
            />
          ))}
      </div>
      <ul className="space-y-2.5">
        {finance.statusBreakdown.map((s) => {
          const ui = PURCHASE_STATUS_UI[s.status];
          return (
            <li key={s.status} className="flex items-center gap-2 text-sm">
              <ui.icon className={cn("size-4", ui.text)} />
              <span className="flex-1">{ui.label}</span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {s.amount ? formatCompactToman(s.amount) : ""}
              </span>
              <span className="w-8 text-left font-semibold tabular-nums">{formatCount(s.count)}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RecentTransactions({ rows }: { rows: NonNullable<DashboardData["finance"]>["recentPurchases"] }) {
  if (!rows.length) return <EmptyState icon={Receipt} text="هنوز تراکنشی ثبت نشده است" />;
  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-y bg-slate-50/70 text-xs text-muted-foreground">
            <th className="px-5 py-2.5 text-start font-medium">خریدار</th>
            <th className="px-3 py-2.5 text-start font-medium">پکیج</th>
            <th className="px-3 py-2.5 text-start font-medium">مبلغ</th>
            <th className="px-3 py-2.5 text-start font-medium">وضعیت</th>
            <th className="px-5 py-2.5 text-start font-medium">زمان</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-slate-50/70">
              <td className="px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2d6a6a]/15 to-[#9b8ec4]/25 text-[11px] font-bold text-[#2d6a6a]">
                    {initials(row.userName)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{row.userName}</p>
                    <p className="text-[11px] text-muted-foreground" dir="ltr">{row.userMobile}</p>
                  </div>
                </div>
              </td>
              <td className="max-w-48 truncate px-3 py-3 text-muted-foreground">{row.productTitle}</td>
              <td className="whitespace-nowrap px-3 py-3 font-semibold tabular-nums">
                {row.amount ? formatToman(row.amount) : <span className="font-normal text-emerald-700">رایگان</span>}
              </td>
              <td className="px-3 py-3">
                <StatusChip status={row.status} />
              </td>
              <td className="whitespace-nowrap px-5 py-3 text-xs text-muted-foreground">{row.timeLabel}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UpcomingAppointments({ ops }: { ops: NonNullable<DashboardData["operations"]> }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: "تأییدشده", value: ops.periodAppointments.confirmed, className: "text-blue-700" },
          { label: "انجام‌شده", value: ops.periodAppointments.completed, className: "text-emerald-700" },
          { label: "لغوشده", value: ops.periodAppointments.cancelled, className: "text-rose-700" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-slate-50 py-2">
            <p className={cn("text-lg font-bold tabular-nums", s.className)}>{formatCount(s.value)}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      {ops.nextAppointments.length ? (
        <ul className="space-y-2">
          {ops.nextAppointments.map((a) => (
            <li key={a.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-2.5">
              <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <CalendarClock className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{a.userName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatJalaliShortDate(new Date(a.date))} · <span dir="ltr">{APPOINTMENT_SLOT_LABELS[a.slot]}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={CalendarClock} text="نوبت پیش‌رویی وجود ندارد" />
      )}
    </div>
  );
}

function ActivityTimeline({ items }: { items: ActivityItem[] }) {
  if (!items.length) return <EmptyState icon={Clock3} text="هنوز فعالیتی ثبت نشده است" />;
  return (
    <ol className="relative space-y-1 before:absolute before:inset-y-3 before:start-[19px] before:w-px before:bg-slate-200">
      {items.map((item) => {
        const ui = ACTIVITY_UI[item.type];
        return (
          <li key={item.id}>
            <Link href={item.href} className="relative flex items-center gap-3 rounded-xl p-1.5 transition-colors hover:bg-slate-50">
              <span className={cn("relative z-10 flex size-[26px] shrink-0 items-center justify-center rounded-full ring-4 ring-white ms-[6px]", ui.className)}>
                <ui.icon className="size-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {item.title}
                  {item.amount ? (
                    <span className={cn("ms-2 text-xs font-semibold tabular-nums", item.type === "refund" ? "text-slate-500" : "text-emerald-700")}>
                      {item.type === "refund" ? "−" : "+"}
                      {formatCompactToman(item.amount)}
                    </span>
                  ) : null}
                </p>
                <p className="truncate text-xs text-muted-foreground">{item.description}</p>
              </div>
              <span className="shrink-0 text-[11px] text-muted-foreground">{item.timeLabel}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

function HealthRow({
  icon: Icon,
  label,
  value,
  state,
  children,
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  state: "ok" | "warn" | "error" | "info";
  children?: ReactNode;
}) {
  const dot = {
    ok: "bg-emerald-500",
    warn: "bg-amber-500",
    error: "bg-rose-500",
    info: "bg-slate-300",
  }[state];
  const stateLabel = { ok: "سالم", warn: "نیاز به توجه", error: "خطا", info: "" }[state];
  return (
    <li className="py-3 first:pt-0 last:pb-0">
      <div className="flex items-center gap-3">
        <Icon className="size-4 shrink-0 text-slate-500" />
        <span className="flex-1 text-sm">{label}</span>
        <span className="text-sm font-medium tabular-nums">{value}</span>
        <span className={cn("size-2 shrink-0 rounded-full", dot)} title={stateLabel} aria-label={stateLabel} />
      </div>
      {children && <div className="mt-2 ps-7">{children}</div>}
    </li>
  );
}

function SystemHealth({ data }: { data: DashboardData }) {
  const { system, content } = data;
  const storage = system.storage;
  const diskUsedPct =
    storage?.diskTotalBytes && storage.diskFreeBytes != null
      ? ((storage.diskTotalBytes - storage.diskFreeBytes) / storage.diskTotalBytes) * 100
      : null;
  const diskState: "ok" | "warn" | "error" =
    !storage ? "error" : storage.diskFreeBytes != null && storage.diskFreeBytes < system.uploadLimitBytes * 2 ? "warn" : diskUsedPct != null && diskUsedPct > 90 ? "warn" : "ok";
  const dbState = system.dbLatencyMs == null ? "error" : system.dbLatencyMs > 250 ? "warn" : "ok";

  return (
    <ul className="divide-y">
      <HealthRow
        icon={Database}
        label="پایگاه داده"
        state={dbState}
        value={system.dbLatencyMs == null ? "قطع" : <span dir="ltr">{formatCount(system.dbLatencyMs)} ms</span>}
      />
      <HealthRow
        icon={HardDrive}
        label="فضای دیسک سرور"
        state={diskState}
        value={
          storage?.diskFreeBytes != null ? `${formatFileSize(storage.diskFreeBytes)} آزاد` : storage ? "نامشخص" : "در دسترس نیست"
        }
      >
        {diskUsedPct != null && (
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn("h-full rounded-full", diskUsedPct > 90 ? "bg-amber-500" : "bg-[#0f9690]")}
              style={{ width: `${diskUsedPct}%` }}
            />
          </div>
        )}
      </HealthRow>
      <HealthRow
        icon={Package}
        label="فایل‌های خصوصی پکیج‌ها"
        state="info"
        value={storage ? `${formatCount(storage.fileCount)} فایل · ${formatFileSize(storage.usedBytes)}` : "—"}
      />
      <HealthRow
        icon={UploadCloud}
        label="سقف حجم آپلود"
        state="info"
        value={
          <Link href="/admins/settings" className="text-[#2d6a6a] hover:underline">
            {formatFileSize(system.uploadLimitBytes)}
          </Link>
        }
      />
      <HealthRow
        icon={AlertTriangle}
        label="پکیج بدون فایل"
        state={content.products.withoutFiles ? "warn" : "ok"}
        value={formatCount(content.products.withoutFiles)}
      />
      <HealthRow
        icon={Cpu}
        label="زمان فعالیت سرور"
        state="info"
        value={<span title={`Node ${system.nodeVersion}`}>{formatUptime(system.uptimeSeconds)}</span>}
      />
    </ul>
  );
}

function ContentInventory({ content }: { content: DashboardData["content"] }) {
  const items: { label: string; value: string; sub?: string; icon: LucideIcon; href: string }[] = [
    {
      label: "پکیج‌ها",
      value: formatCount(content.products.published),
      sub: `از ${formatCount(content.products.total)} · ${formatCount(content.products.featured)} ویژه`,
      icon: Package,
      href: "/admins/products",
    },
    {
      label: "مقالات",
      value: formatCount(content.blogPosts.published),
      sub: `از ${formatCount(content.blogPosts.total)} منتشرشده`,
      icon: BookOpen,
      href: "/admins/blog",
    },
    { label: "خدمات", value: formatCount(content.services), icon: Briefcase, href: "/admins/services" },
    { label: "نمونه‌کارها", value: formatCount(content.portfolio), icon: FolderKanban, href: "/admins/portfolio" },
    { label: "نظرات", value: formatCount(content.testimonials), icon: MessageSquareQuote, href: "/admins/testimonials" },
    { label: "پرسش‌ها", value: formatCount(content.faqs), icon: HelpCircle, href: "/admins/faq" },
    { label: "اعضای تیم", value: formatCount(content.teamMembers), icon: UsersRound, href: "/admins/team" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="group rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 transition-colors hover:border-[#2d6a6a]/30 hover:bg-[#2d6a6a]/5"
        >
          <item.icon className="size-4 text-slate-500 transition-colors group-hover:text-[#2d6a6a]" />
          <p className="mt-2.5 text-xl font-extrabold tabular-nums">{item.value}</p>
          <p className="text-xs text-muted-foreground">{item.label}</p>
          {item.sub && <p className="mt-0.5 truncate text-[10px] text-muted-foreground/80">{item.sub}</p>}
        </Link>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function DashboardContent({ data, adminName }: { data: DashboardData; adminName: string }) {
  const { finance, operations: ops, trend } = data;
  const rangePhrase = DASHBOARD_RANGE_PHRASES[data.range];

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 pb-4">
      <DashboardHeader data={data} adminName={adminName} />

      {finance && ops && (
        <>
          {/* Finance */}
          <div className="grid gap-4 xl:grid-cols-12">
            <div className="xl:col-span-8">
              <RevenueHero
                trend={trend}
                revenue={finance.revenue}
                revenueChange={finance.revenueChange}
                paidOrders={finance.paidOrders}
                buyers={finance.buyers}
                freeClaims={finance.freeClaims}
                rangePhrase={rangePhrase}
              />
            </div>
            <div className="xl:col-span-4">
              <FinanceTiles finance={finance} rangePhrase={rangePhrase} />
            </div>
          </div>

          {/* Operations KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              label="کاربران جدید"
              value={formatCount(ops.newUsers)}
              icon={Users}
              accent="bg-violet-50 text-violet-600"
              change={ops.newUsersChange}
              href="/admins/users"
            >
              <Sparkline
                label="کاربران جدید"
                color="#6250d6"
                data={trend.map((p) => ({ label: p.label, value: p.users }))}
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                مجموع کاربران: {formatCount(ops.usersTotal)}
              </p>
            </KpiCard>
            <KpiCard
              label="سفارش‌های موفق"
              value={formatCount(finance.paidOrders + finance.freeClaims)}
              icon={ShoppingBag}
              accent="bg-[#0f9690]/10 text-[#0f9690]"
              change={finance.paidOrdersChange}
              href="/admins/purchases"
            >
              <Sparkline
                label="سفارش‌ها"
                color="#0f9690"
                data={trend.map((p) => ({ label: p.label, value: p.orders }))}
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                {formatCount(finance.paidOrders)} پولی · {formatCount(finance.freeClaims)} رایگان
              </p>
            </KpiCard>
            <KpiCard
              label="نوبت‌های پیش‌رو"
              value={formatCount(ops.upcomingAppointments)}
              icon={CalendarClock}
              accent="bg-blue-50 text-blue-600"
              href="/admins/appointments"
              footer={
                ops.todayAppointments ? (
                  <span className="font-medium text-blue-700">{formatCount(ops.todayAppointments)} نوبت برای امروز</span>
                ) : (
                  "امروز نوبتی ندارید"
                )
              }
            />
            <KpiCard
              label="پیام‌های جدید"
              value={formatCount(ops.newContacts)}
              icon={Inbox}
              accent={ops.newContacts ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-500"}
              href="/admins/contacts"
              footer={
                ops.newContacts ? (
                  <span className="font-medium text-amber-700">نیاز به پاسخ · {formatCount(ops.inProgressContacts)} در حال پیگیری</span>
                ) : (
                  `صندوق خالی است · ${formatCount(ops.inProgressContacts)} در حال پیگیری`
                )
              }
            />
          </div>

          {/* Sales analysis */}
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-12">
            <Panel
              title="پرفروش‌ترین پکیج‌ها"
              description={`بر اساس مبلغ فروش در ${rangePhrase}`}
              icon={Sparkles}
              action={{ label: "همه پکیج‌ها", href: "/admins/products" }}
              className="xl:col-span-5"
            >
              <TopProducts products={finance.topProducts} />
            </Panel>
            <Panel
              title="فروش به تفکیک دسته"
              description="سهم هر دسته از فروش موفق"
              icon={BadgePercent}
              className="xl:col-span-4"
            >
              {finance.categories.length ? (
                <CategoryDonut data={finance.categories} />
              ) : (
                <EmptyState icon={BadgePercent} text="داده‌ای برای نمایش نیست" />
              )}
            </Panel>
            <Panel
              title="وضعیت تراکنش‌ها"
              description={rangePhrase}
              icon={Receipt}
              className="lg:col-span-2 xl:col-span-3"
            >
              <StatusBreakdown finance={finance} />
            </Panel>
          </div>

          {/* Transactions & appointments */}
          <div className="grid gap-4 xl:grid-cols-12">
            <Panel
              title="آخرین تراکنش‌ها"
              icon={Receipt}
              action={{ label: "همه خریدها", href: "/admins/purchases" }}
              className="xl:col-span-8"
              bodyClassName="pb-2"
            >
              <RecentTransactions rows={finance.recentPurchases} />
            </Panel>
            <Panel
              title="نوبت‌های مشاوره"
              description={`آمار ${rangePhrase} و نوبت‌های بعدی`}
              icon={CalendarClock}
              action={{ label: "همه نوبت‌ها", href: "/admins/appointments" }}
              className="xl:col-span-4"
            >
              <UpcomingAppointments ops={ops} />
            </Panel>
          </div>
        </>
      )}

      {/* Activity & system */}
      <div className="grid gap-4 xl:grid-cols-12">
        {data.canSeeOperations && (
          <Panel title="رویدادهای اخیر" description="آخرین اتفاقات سایت" icon={Clock3} className="xl:col-span-7">
            <ActivityTimeline items={data.activity} />
          </Panel>
        )}
        <Panel
          title="وضعیت سیستم"
          description="سلامت سرور، پایگاه داده و فضای ذخیره‌سازی"
          icon={Cpu}
          className={data.canSeeOperations ? "xl:col-span-5" : "xl:col-span-12"}
        >
          <SystemHealth data={data} />
        </Panel>
      </div>

      <Panel title="محتوای سایت" description="وضعیت بخش‌های محتوایی" icon={BookOpen}>
        <ContentInventory content={data.content} />
      </Panel>
    </div>
  );
}
