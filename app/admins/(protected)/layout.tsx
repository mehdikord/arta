import { AdminShell } from "@/components/admin/layout/admin-shell";
import { requireAdmin } from "@/lib/admin/auth";
import { getNewContactsCount } from "@/lib/admin/queries/dashboard";
import { canManageOperations } from "@/lib/admin/permissions";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  const newContactsCount = canManageOperations(admin.role)
    ? await getNewContactsCount()
    : 0;

  return (
    <AdminShell admin={admin} contactsBadge={newContactsCount}>
      {children}
    </AdminShell>
  );
}
