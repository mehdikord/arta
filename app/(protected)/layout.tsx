import { redirect } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Footer } from "@/components/layout/footer";
import { UserSessionProvider } from "@/components/auth/user-session-provider";
import { getCurrentUserAction } from "@/lib/actions/auth";
import { getSiteConfig } from "@/lib/data";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, site] = await Promise.all([
    getCurrentUserAction(),
    getSiteConfig(),
  ]);

  if (!user) {
    redirect("/auth/login?redirect=/profile");
  }

  return (
    <UserSessionProvider user={user}>
      <MainLayout site={site} footer={<Footer site={site} />}>
        {children}
      </MainLayout>
    </UserSessionProvider>
  );
}
