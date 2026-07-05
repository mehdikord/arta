import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  getUserSessionFromCookie,
  type UserSessionPayload,
} from "@/lib/user/session";

export async function getUserSession(): Promise<UserSessionPayload | null> {
  return getUserSessionFromCookie();
}

export async function requireUser(): Promise<UserSessionPayload> {
  const session = await getUserSession();
  if (!session) redirect("/auth/login");
  return session;
}

export async function getUserWithDetails(userId: string) {
  return prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    include: {
      purchases: {
        where: { status: "COMPLETED" },
        include: { product: true },
        orderBy: { purchasedAt: "desc" },
      },
      appointments: { orderBy: { date: "desc" } },
    },
  });
}
