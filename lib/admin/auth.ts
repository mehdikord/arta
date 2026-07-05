import { redirect } from "next/navigation";
import { ADMIN_LOGIN_PATH } from "@/lib/admin/constants";
import type { AdminRole } from "@/lib/admin/constants";
import { getAdminSessionFromCookie, type AdminSessionPayload } from "@/lib/admin/session";

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  return getAdminSessionFromCookie();
}

export async function requireAdmin(): Promise<AdminSessionPayload> {
  const session = await getAdminSession();
  if (!session) redirect(ADMIN_LOGIN_PATH);
  return session;
}

export async function requireAdminRole(
  roles: AdminRole[],
): Promise<AdminSessionPayload> {
  const session = await requireAdmin();
  if (!roles.includes(session.role)) {
    redirect("/admins/unauthorized");
  }
  return session;
}
