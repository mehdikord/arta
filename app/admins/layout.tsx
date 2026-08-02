import type { Metadata } from "next";
import "./globals-admin.css";

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
    <div className="admin-panel h-dvh min-h-0 overflow-hidden" dir="rtl">
      {children}
    </div>
  );
}
