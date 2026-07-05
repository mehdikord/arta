import type { Metadata } from "next";
import { ProfileSidebar } from "@/components/profile/profile-sidebar";

export const metadata: Metadata = {
  title: "پروفایل",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[70vh]">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -start-32 top-0 size-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -end-20 top-40 size-72 rounded-full bg-accent/8 blur-3xl" />
        <div className="section-pattern absolute inset-0 opacity-40" />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-primary">حساب کاربری</p>
          <h2 className="mt-1 text-2xl font-bold md:text-3xl">
            پنل <span className="text-gradient">شخصی</span> شما
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:gap-8">
          <ProfileSidebar />
          <main className="min-w-0 rounded-2xl border bg-card/80 p-6 shadow-sm backdrop-blur-sm sm:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
