import { MainLayout } from "@/components/layout/main-layout";
import { Footer } from "@/components/layout/footer";
import { UserSessionWrapper } from "@/components/auth/user-session-wrapper";
import { getSiteConfig } from "@/lib/data";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = await getSiteConfig();

  return (
    <UserSessionWrapper>
      <MainLayout site={site} footer={<Footer site={site} />}>
        {children}
      </MainLayout>
    </UserSessionWrapper>
  );
}
