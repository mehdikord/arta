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
  return <div className="admin-panel h-screen overflow-hidden" dir="rtl">{children}</div>;
}
