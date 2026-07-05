import { UsersPageClient } from "@/components/admin/users/users-page-client";
import { getUsersAction } from "@/lib/actions/admin/operations";

export const metadata = { title: "کاربران" };

export default async function AdminUsersPage() {
  const users = await getUsersAction();
  return <UsersPageClient users={users} />;
}
