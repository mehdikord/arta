import { getCurrentUserAction } from "@/lib/actions/auth";
import { UserSessionProvider } from "@/components/auth/user-session-provider";

export async function UserSessionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUserAction();
  return <UserSessionProvider user={user}>{children}</UserSessionProvider>;
}
