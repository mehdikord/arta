import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [usersCount, activeAppointments, monthlyPurchases, newContacts] =
    await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.appointment.count({
        where: { status: "CONFIRMED", date: { gte: new Date() } },
      }),
      prisma.purchase.count({
        where: { status: "COMPLETED", purchasedAt: { gte: startOfMonth } },
      }),
      prisma.contactSubmission.count({ where: { status: "NEW" } }),
    ]);

  return { usersCount, activeAppointments, monthlyPurchases, newContacts };
}

export async function getRecentActivity(limit = 10) {
  const [purchases, appointments, contacts, users] = await Promise.all([
    prisma.purchase.findMany({
      take: limit,
      orderBy: { purchasedAt: "desc" },
      include: { user: true, product: true },
    }),
    prisma.appointment.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
    prisma.contactSubmission.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      where: { deletedAt: null },
    }),
  ]);

  type Activity = {
    id: string;
    type: "purchase" | "appointment" | "contact" | "register";
    title: string;
    description: string;
    time: Date;
  };

  const items: Activity[] = [
    ...purchases.map((p) => ({
      id: `p-${p.id}`,
      type: "purchase" as const,
      title: "خرید پکیج",
      description: `${p.user.name} — ${p.product.title}`,
      time: p.purchasedAt,
    })),
    ...appointments.map((a) => ({
      id: `a-${a.id}`,
      type: "appointment" as const,
      title: "نوبت",
      description: `${a.user.name} — ${a.date.toISOString().slice(0, 10)}`,
      time: a.createdAt,
    })),
    ...contacts.map((c) => ({
      id: `c-${c.id}`,
      type: "contact" as const,
      title: "پیام تماس",
      description: `${c.name} — ${c.subject}`,
      time: c.createdAt,
    })),
    ...users.map((u) => ({
      id: `u-${u.id}`,
      type: "register" as const,
      title: "ثبت‌نام",
      description: `${u.name} — ${u.mobile}`,
      time: u.createdAt,
    })),
  ];

  return items
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, limit);
}

export async function getNewContactsCount() {
  return prisma.contactSubmission.count({ where: { status: "NEW" } });
}
