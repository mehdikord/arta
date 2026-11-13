import "server-only";

import { readdir, stat, statfs } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import type { AdminRole } from "@/lib/admin/constants";
import { canManageOperations } from "@/lib/admin/permissions";
import {
  formatRelativeFa,
  resolveDashboardRange,
  tehranTodayAsDbDate,
  type DashboardRange,
} from "@/lib/admin/dashboard-range";
import {
  getProductFileMaxSize,
  getProductFileStorageRoot,
} from "@/lib/product-files";
import type {
  AppointmentSlot,
  PurchaseStatus,
} from "@/lib/generated/prisma/client";

/** Percentage change; null when there is no baseline to compare with. */
function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

export type TrendPoint = { key: string; label: string; revenue: number; orders: number; users: number };

export type ActivityItem = {
  id: string;
  type: "purchase" | "refund" | "appointment" | "contact" | "register";
  title: string;
  description: string;
  amount: number | null;
  href: string;
  timeLabel: string;
  at: string;
};

export type DashboardFinance = {
  revenue: number;
  revenueChange: number | null;
  paidOrders: number;
  paidOrdersChange: number | null;
  freeClaims: number;
  buyers: number;
  averageOrder: number;
  averageOrderChange: number | null;
  allTimeRevenue: number;
  allTimeOrders: number;
  refunds: { count: number; amount: number };
  statusBreakdown: { status: PurchaseStatus; count: number; amount: number }[];
  topProducts: {
    id: string;
    title: string;
    image: string;
    category: string;
    revenue: number;
    orders: number;
  }[];
  categories: { name: string; revenue: number; orders: number }[];
  recentPurchases: {
    id: string;
    userName: string;
    userMobile: string;
    productTitle: string;
    amount: number | null;
    status: PurchaseStatus;
    timeLabel: string;
  }[];
};

export type DashboardOperations = {
  usersTotal: number;
  newUsers: number;
  newUsersChange: number | null;
  upcomingAppointments: number;
  todayAppointments: number;
  periodAppointments: { confirmed: number; completed: number; cancelled: number };
  nextAppointments: {
    id: string;
    userName: string;
    date: string;
    slot: AppointmentSlot;
  }[];
  newContacts: number;
  inProgressContacts: number;
};

export type DashboardContentStats = {
  products: { total: number; published: number; withoutFiles: number; featured: number };
  blogPosts: { total: number; published: number };
  services: number;
  portfolio: number;
  testimonials: number;
  faqs: number;
  teamMembers: number;
};

export type DashboardSystem = {
  dbLatencyMs: number | null;
  storage: {
    usedBytes: number;
    fileCount: number;
    diskFreeBytes: number | null;
    diskTotalBytes: number | null;
  } | null;
  uploadLimitBytes: number;
  nodeVersion: string;
  uptimeSeconds: number;
};

export type DashboardData = {
  range: DashboardRange;
  canSeeOperations: boolean;
  trend: TrendPoint[];
  finance: DashboardFinance | null;
  operations: DashboardOperations | null;
  content: DashboardContentStats;
  system: DashboardSystem;
  activity: ActivityItem[];
};

async function measureDbLatency(): Promise<number | null> {
  try {
    const started = performance.now();
    await prisma.$queryRaw`SELECT 1`;
    return Math.round(performance.now() - started);
  } catch {
    return null;
  }
}

async function readStorageStats(): Promise<DashboardSystem["storage"]> {
  const root = getProductFileStorageRoot();
  try {
    const entries = await readdir(root, { withFileTypes: true });
    let usedBytes = 0;
    let fileCount = 0;
    await Promise.all(
      entries
        .filter((entry) => entry.isFile())
        .map(async (entry) => {
          const info = await stat(path.join(root, entry.name)).catch(() => null);
          if (info) {
            usedBytes += info.size;
            fileCount += 1;
          }
        }),
    );
    let diskFreeBytes: number | null = null;
    let diskTotalBytes: number | null = null;
    try {
      const fs = await statfs(root);
      diskFreeBytes = Number(fs.bavail) * Number(fs.bsize);
      diskTotalBytes = Number(fs.blocks) * Number(fs.bsize);
    } catch {
      /* statfs unsupported */
    }
    return { usedBytes, fileCount, diskFreeBytes, diskTotalBytes };
  } catch {
    return null;
  }
}

async function getContentStats(): Promise<DashboardContentStats> {
  const [
    productsTotal,
    productsPublished,
    productsWithoutFiles,
    productsFeatured,
    blogTotal,
    blogPublished,
    services,
    portfolio,
    testimonials,
    faqs,
    teamMembers,
  ] = await Promise.all([
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { deletedAt: null, isPublished: true } }),
    prisma.product.count({ where: { deletedAt: null, files: { none: {} } } }),
    prisma.product.count({ where: { deletedAt: null, isFeatured: true } }),
    prisma.blogPost.count({ where: { deletedAt: null } }),
    prisma.blogPost.count({ where: { deletedAt: null, isPublished: true } }),
    prisma.service.count({ where: { deletedAt: null } }),
    prisma.portfolioItem.count({ where: { deletedAt: null } }),
    prisma.testimonial.count(),
    prisma.faq.count(),
    prisma.teamMember.count(),
  ]);
  return {
    products: {
      total: productsTotal,
      published: productsPublished,
      withoutFiles: productsWithoutFiles,
      featured: productsFeatured,
    },
    blogPosts: { total: blogTotal, published: blogPublished },
    services,
    portfolio,
    testimonials,
    faqs,
    teamMembers,
  };
}

export async function getDashboardData(
  range: DashboardRange,
  role: AdminRole,
): Promise<DashboardData> {
  const now = new Date();
  const resolved = resolveDashboardRange(range, now);
  const { start, prevStart, buckets, bucketOf } = resolved;
  const canSeeOperations = canManageOperations(role);

  const [content, dbLatencyMs, storage, uploadLimitBytes] = await Promise.all([
    getContentStats(),
    measureDbLatency(),
    readStorageStats(),
    getProductFileMaxSize(),
  ]);

  const system: DashboardSystem = {
    dbLatencyMs,
    storage,
    uploadLimitBytes,
    nodeVersion: process.version,
    uptimeSeconds: Math.round(process.uptime()),
  };

  const emptyTrend: TrendPoint[] = buckets.map((b) => ({ ...b, revenue: 0, orders: 0, users: 0 }));

  if (!canSeeOperations) {
    return {
      range,
      canSeeOperations,
      trend: emptyTrend,
      finance: null,
      operations: null,
      content,
      system,
      activity: [],
    };
  }

  const todayDb = tehranTodayAsDbDate(now);

  const [
    purchases,
    refundsInPeriod,
    allTime,
    recentPurchases,
    usersTotal,
    recentUsers,
    upcomingAppointments,
    todayAppointments,
    periodAppointmentsByStatus,
    nextAppointments,
    newContacts,
    inProgressContacts,
    recentAppointments,
    recentContacts,
  ] = await Promise.all([
    prisma.purchase.findMany({
      where: { purchasedAt: { gte: prevStart } },
      select: { pricePaid: true, status: true, purchasedAt: true, userId: true, productId: true },
    }),
    prisma.purchase.findMany({
      where: { status: "REFUNDED", updatedAt: { gte: start } },
      select: { id: true, pricePaid: true, updatedAt: true, user: { select: { name: true } }, product: { select: { title: true } } },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.purchase.aggregate({
      where: { status: "COMPLETED" },
      _sum: { pricePaid: true },
      _count: { _all: true },
    }),
    prisma.purchase.findMany({
      take: 8,
      orderBy: { purchasedAt: "desc" },
      select: {
        id: true,
        pricePaid: true,
        status: true,
        purchasedAt: true,
        user: { select: { name: true, mobile: true } },
        product: { select: { title: true } },
      },
    }),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.user.findMany({
      where: { deletedAt: null, createdAt: { gte: prevStart } },
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.appointment.count({ where: { status: "CONFIRMED", date: { gte: todayDb } } }),
    prisma.appointment.count({ where: { status: { not: "CANCELLED" }, date: todayDb } }),
    prisma.appointment.groupBy({
      by: ["status"],
      where: { createdAt: { gte: start } },
      _count: { _all: true },
    }),
    prisma.appointment.findMany({
      where: { status: "CONFIRMED", date: { gte: todayDb } },
      orderBy: [{ date: "asc" }, { slot: "asc" }],
      take: 5,
      select: { id: true, date: true, slot: true, user: { select: { name: true } } },
    }),
    prisma.contactSubmission.count({ where: { status: "NEW" } }),
    prisma.contactSubmission.count({ where: { status: "IN_PROGRESS" } }),
    prisma.appointment.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: { id: true, date: true, slot: true, status: true, createdAt: true, user: { select: { name: true } } },
    }),
    prisma.contactSubmission.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, subject: true, createdAt: true },
    }),
  ]);

  // ---------- Finance ----------
  const current = purchases.filter((p) => p.purchasedAt >= start);
  const previous = purchases.filter((p) => p.purchasedAt < start);
  const completedCurrent = current.filter((p) => p.status === "COMPLETED");
  const completedPrevious = previous.filter((p) => p.status === "COMPLETED");

  const sumPaid = (rows: { pricePaid: number | null }[]) =>
    rows.reduce((total, row) => total + (row.pricePaid ?? 0), 0);
  const paid = (rows: { pricePaid: number | null }[]) => rows.filter((r) => (r.pricePaid ?? 0) > 0);

  const revenue = sumPaid(completedCurrent);
  const prevRevenue = sumPaid(completedPrevious);
  const paidOrders = paid(completedCurrent).length;
  const prevPaidOrders = paid(completedPrevious).length;
  const averageOrder = paidOrders ? Math.round(revenue / paidOrders) : 0;
  const prevAverageOrder = prevPaidOrders ? Math.round(prevRevenue / prevPaidOrders) : 0;

  const trendMap = new Map(emptyTrend.map((point) => [point.key, point]));
  for (const p of completedCurrent) {
    const point = trendMap.get(bucketOf(p.purchasedAt));
    if (!point) continue;
    point.revenue += p.pricePaid ?? 0;
    point.orders += 1;
  }
  for (const u of recentUsers) {
    if (u.createdAt < start) continue;
    const point = trendMap.get(bucketOf(u.createdAt));
    if (point) point.users += 1;
  }

  const statusOrder: PurchaseStatus[] = ["COMPLETED", "PENDING", "FAILED", "REFUNDED"];
  const statusBreakdown = statusOrder.map((status) => {
    const rows = current.filter((p) => p.status === status);
    return { status, count: rows.length, amount: sumPaid(rows) };
  });

  // Top products & categories by revenue (completed, current period).
  const byProduct = new Map<string, { revenue: number; orders: number }>();
  for (const p of completedCurrent) {
    const entry = byProduct.get(p.productId) ?? { revenue: 0, orders: 0 };
    entry.revenue += p.pricePaid ?? 0;
    entry.orders += 1;
    byProduct.set(p.productId, entry);
  }
  const productRows = byProduct.size
    ? await prisma.product.findMany({
        where: { id: { in: [...byProduct.keys()] } },
        select: { id: true, title: true, image: true, category: { select: { name: true } } },
      })
    : [];
  const rankedProducts = productRows
    .map((product) => ({
      id: product.id,
      title: product.title,
      image: product.image,
      category: product.category.name,
      ...byProduct.get(product.id)!,
    }))
    .sort((a, b) => b.revenue - a.revenue || b.orders - a.orders);

  const byCategory = new Map<string, { revenue: number; orders: number }>();
  for (const product of rankedProducts) {
    const entry = byCategory.get(product.category) ?? { revenue: 0, orders: 0 };
    entry.revenue += product.revenue;
    entry.orders += product.orders;
    byCategory.set(product.category, entry);
  }
  const sortedCategories = [...byCategory.entries()]
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue || b.orders - a.orders);
  // Max 5 colored slices; the rest folds into "سایر".
  const categories =
    sortedCategories.length > 5
      ? [
          ...sortedCategories.slice(0, 4),
          sortedCategories.slice(4).reduce(
            (acc, c) => ({ name: "سایر", revenue: acc.revenue + c.revenue, orders: acc.orders + c.orders }),
            { name: "سایر", revenue: 0, orders: 0 },
          ),
        ]
      : sortedCategories;

  const finance: DashboardFinance = {
    revenue,
    revenueChange: percentChange(revenue, prevRevenue),
    paidOrders,
    paidOrdersChange: percentChange(paidOrders, prevPaidOrders),
    freeClaims: completedCurrent.length - paidOrders,
    buyers: new Set(completedCurrent.map((p) => p.userId)).size,
    averageOrder,
    averageOrderChange: percentChange(averageOrder, prevAverageOrder),
    allTimeRevenue: allTime._sum.pricePaid ?? 0,
    allTimeOrders: allTime._count._all,
    refunds: { count: refundsInPeriod.length, amount: sumPaid(refundsInPeriod) },
    statusBreakdown,
    topProducts: rankedProducts.slice(0, 5),
    categories,
    recentPurchases: recentPurchases.map((p) => ({
      id: p.id,
      userName: p.user.name,
      userMobile: p.user.mobile,
      productTitle: p.product.title,
      amount: p.pricePaid,
      status: p.status,
      timeLabel: formatRelativeFa(p.purchasedAt, now),
    })),
  };

  // ---------- Operations ----------
  const newUsers = recentUsers.filter((u) => u.createdAt >= start).length;
  const prevNewUsers = recentUsers.length - newUsers;
  const appointmentCount = (status: string) =>
    periodAppointmentsByStatus.find((row) => row.status === status)?._count._all ?? 0;

  const operations: DashboardOperations = {
    usersTotal,
    newUsers,
    newUsersChange: percentChange(newUsers, prevNewUsers),
    upcomingAppointments,
    todayAppointments,
    periodAppointments: {
      confirmed: appointmentCount("CONFIRMED"),
      completed: appointmentCount("COMPLETED"),
      cancelled: appointmentCount("CANCELLED"),
    },
    nextAppointments: nextAppointments.map((a) => ({
      id: a.id,
      userName: a.user.name,
      date: a.date.toISOString(),
      slot: a.slot,
    })),
    newContacts,
    inProgressContacts,
  };

  // ---------- Activity feed ----------
  const activity: ActivityItem[] = [
    ...recentPurchases.map((p) => ({
      id: `p-${p.id}`,
      type: "purchase" as const,
      title: (p.pricePaid ?? 0) > 0 ? "خرید پکیج" : "دریافت رایگان",
      description: `${p.user.name} · ${p.product.title}`,
      amount: p.pricePaid,
      href: "/admins/purchases",
      timeLabel: formatRelativeFa(p.purchasedAt, now),
      at: p.purchasedAt.toISOString(),
    })),
    ...refundsInPeriod.slice(0, 5).map((r) => ({
      id: `r-${r.id}`,
      type: "refund" as const,
      title: "استرداد وجه",
      description: `${r.user.name} · ${r.product.title}`,
      amount: r.pricePaid,
      href: "/admins/purchases",
      timeLabel: formatRelativeFa(r.updatedAt, now),
      at: r.updatedAt.toISOString(),
    })),
    ...recentAppointments.map((a) => ({
      id: `a-${a.id}`,
      type: "appointment" as const,
      title: a.status === "CANCELLED" ? "لغو نوبت" : "رزرو نوبت مشاوره",
      description: a.user.name,
      amount: null,
      href: "/admins/appointments",
      timeLabel: formatRelativeFa(a.createdAt, now),
      at: a.createdAt.toISOString(),
    })),
    ...recentContacts.map((c) => ({
      id: `c-${c.id}`,
      type: "contact" as const,
      title: "پیام تماس جدید",
      description: `${c.name} · ${c.subject}`,
      amount: null,
      href: "/admins/contacts",
      timeLabel: formatRelativeFa(c.createdAt, now),
      at: c.createdAt.toISOString(),
    })),
    ...recentUsers.slice(0, 6).map((u) => ({
      id: `u-${u.id}`,
      type: "register" as const,
      title: "ثبت‌نام کاربر",
      description: u.name,
      amount: null,
      href: "/admins/users",
      timeLabel: formatRelativeFa(u.createdAt, now),
      at: u.createdAt.toISOString(),
    })),
  ]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 10);

  return {
    range,
    canSeeOperations,
    trend: [...trendMap.values()],
    finance,
    operations,
    content,
    system,
    activity,
  };
}

export async function getNewContactsCount() {
  return prisma.contactSubmission.count({ where: { status: "NEW" } });
}
