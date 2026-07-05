import type { AdminNavItem, AdminRole } from "@/lib/admin/constants";

export function canManageStaff(role: AdminRole): boolean {
  return role === "SUPER_ADMIN";
}

export function canManageOperations(role: AdminRole): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function canEditContent(role: AdminRole): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN" || role === "EDITOR";
}

export function canAccessNavItem(role: AdminRole, item: AdminNavItem): boolean {
  if (!item.roles?.length) return true;
  return item.roles.includes(role);
}
