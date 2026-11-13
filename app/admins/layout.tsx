import type { Metadata } from "next";
import "./globals-admin.css";
import { AdminDirectionProvider } from "@/components/admin/layout/admin-direction-provider";

export const metadata: Metadata = {
  title: "پنل مدیریت",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-panel relative h-dvh min-h-0 overflow-hidden" dir="rtl">
      <AdminDirectionProvider>{children}</AdminDirectionProvider>
    </div>
  );
}
