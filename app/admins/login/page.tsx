import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  CalendarCheck2,
  LayoutDashboard,
  Lock,
  Package,
  ShieldCheck,
  Users,
} from "lucide-react";
import { LoginForm } from "@/components/admin/auth/login-form";
import { getAdminSession } from "@/lib/admin/auth";
import {
  ADMIN_BRAND_NAME,
  ADMIN_DASHBOARD_PATH,
} from "@/lib/admin/constants";

export const metadata: Metadata = {
  title: "ورود به پنل",
  robots: { index: false, follow: false },
};

const FEATURES = [
  { icon: Package, label: "پکیج‌ها و فایل‌های امن" },
  { icon: CalendarCheck2, label: "نوبت‌ها و مشاوره‌ها" },
  { icon: Users, label: "کاربران و خریدها" },
] as const;

/** Decorative, data-free preview of the panel (aria-hidden). */
function PanelPreview() {
  return (
    <div aria-hidden className="relative mt-12 hidden h-64 select-none lg:block">
      {/* Main window */}
      <div className="admin-login-float absolute inset-x-0 top-0 mx-auto w-[88%] rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/40 backdrop-blur-md">
        <div className="mb-4 flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-rose-400/70" />
          <span className="size-2.5 rounded-full bg-amber-300/70" />
          <span className="size-2.5 rounded-full bg-emerald-400/70" />
          <span className="ms-3 h-2 w-24 rounded-full bg-white/10" />
        </div>
        <div className="grid grid-cols-[3.5rem_1fr] gap-4">
          <div className="space-y-2.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={`block h-2 rounded-full ${i === 1 ? "bg-[#3699ff]/70" : "bg-white/10"}`}
              />
            ))}
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {["from-[#2d6a6a]/60", "from-[#9b8ec4]/60", "from-[#3699ff]/50"].map((g) => (
                <div key={g} className={`h-12 rounded-lg bg-gradient-to-br ${g} to-transparent ring-1 ring-white/10`} />
              ))}
            </div>
            <div className="flex h-20 items-end gap-1.5 rounded-lg bg-white/[0.03] p-2 ring-1 ring-white/5">
              {[40, 65, 45, 80, 55, 90, 70, 100, 60, 85].map((h, i) => (
                <span
                  key={i}
                  className="admin-login-bar flex-1 rounded-sm bg-gradient-to-t from-[#2d6a6a] to-[#9b8ec4]"
                  style={{ height: `${h}%`, animationDelay: `${i * 70}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating chips */}
      <div className="admin-login-float-slow absolute -start-2 bottom-2 flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#16161f]/90 px-3.5 py-2.5 shadow-xl backdrop-blur">
        <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-300">
          <ShieldCheck className="size-4" />
        </span>
        <span className="space-y-1">
          <span className="block text-xs font-medium text-white/90">دسترسی امن</span>
          <span className="block h-1.5 w-16 rounded-full bg-white/10" />
        </span>
      </div>
      <div className="admin-login-float absolute -end-2 bottom-10 flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#16161f]/90 px-3.5 py-2.5 shadow-xl backdrop-blur [animation-delay:-3s]">
        <span className="flex size-8 items-center justify-center rounded-lg bg-[#9b8ec4]/20 text-[#c9bff0]">
          <LayoutDashboard className="size-4" />
        </span>
        <span className="space-y-1">
          <span className="block text-xs font-medium text-white/90">داشبورد زنده</span>
          <span className="block h-1.5 w-12 rounded-full bg-white/10" />
        </span>
      </div>
    </div>
  );
}

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect(ADMIN_DASHBOARD_PATH);

  return (
    <div className="admin-login relative h-full overflow-y-auto overflow-x-hidden bg-[#0c0c14] text-white">
      {/* Background: aurora + grid + noise vignette */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="admin-login-aurora absolute -top-40 start-[-10%] size-[42rem] rounded-full bg-[#2d6a6a] opacity-40 blur-[120px]" />
        <div className="admin-login-aurora absolute -bottom-48 end-[-10%] size-[38rem] rounded-full bg-[#9b8ec4] opacity-30 blur-[120px] [animation-delay:-9s]" />
        <div className="admin-login-aurora absolute top-1/3 start-1/3 size-[22rem] rounded-full bg-[#3699ff] opacity-[0.12] blur-[100px] [animation-delay:-4s]" />
        <div className="admin-login-grid absolute inset-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#0c0c14_100%)]" />
      </div>

      <div className="relative mx-auto flex min-h-full w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:py-10">
        {/* Top bar */}
        <header className="admin-login-enter flex items-center justify-between" style={{ ["--d" as string]: "0ms" }}>
          <div className="flex items-center gap-3">
            <span className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2f8f8f] via-[#3b7f8f] to-[#7b6cc0] text-lg font-black shadow-lg shadow-[#2d6a6a]/40">
              آ
              <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/25" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold">آرتا</span>
              <span className="block text-[11px] text-white/50">Admin Console</span>
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/60 backdrop-blur">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:hidden" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
            </span>
            اتصال امن
          </span>
        </header>

        <main className="grid flex-1 content-center items-center gap-8 py-10 lg:grid-cols-[1fr_minmax(0,27rem)] lg:gap-16">
          {/* Brand story */}
          <section className="hidden lg:block">
            <p
              className="admin-login-enter mb-5 inline-flex items-center gap-2 rounded-full border border-[#9b8ec4]/30 bg-[#9b8ec4]/10 px-3 py-1 text-xs text-[#d4cbf5]"
              style={{ ["--d" as string]: "80ms" }}
            >
              <Lock className="size-3.5" />
              فقط برای مدیران و ویرایشگران
            </p>
            <h1
              className="admin-login-enter text-5xl font-black leading-[1.25] tracking-tight"
              style={{ ["--d" as string]: "140ms" }}
            >
              همه‌چیز آرتا،
              <br />
              <span className="admin-login-gradient-text">در یک نگاه.</span>
            </h1>
            <p
              className="admin-login-enter mt-5 max-w-md text-base leading-8 text-white/60"
              style={{ ["--d" as string]: "200ms" }}
            >
              مدیریت محتوا، کاربران، نوبت‌ها و فروش {ADMIN_BRAND_NAME} — سریع، امن
              و از هر جا.
            </p>
            <ul className="admin-login-enter mt-7 flex flex-wrap gap-2" style={{ ["--d" as string]: "260ms" }}>
              {FEATURES.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/75 backdrop-blur"
                >
                  <Icon className="size-4 text-[#7fc4c4]" />
                  {label}
                </li>
              ))}
            </ul>
            <div className="admin-login-enter" style={{ ["--d" as string]: "340ms" }}>
              <PanelPreview />
            </div>
          </section>

          {/* Mobile headline */}
          <div className="admin-login-enter text-center lg:hidden" style={{ ["--d" as string]: "60ms" }}>
            <h1 className="text-3xl font-black leading-snug tracking-tight">
              همه‌چیز آرتا، <span className="admin-login-gradient-text">در یک نگاه.</span>
            </h1>
          </div>

          {/* Login card */}
          <section
            className="admin-login-enter relative mx-auto w-full max-w-md lg:max-w-none"
            style={{ ["--d" as string]: "120ms" }}
          >
            <div aria-hidden className="absolute -inset-px rounded-[1.75rem] bg-gradient-to-br from-[#2d6a6a]/70 via-white/10 to-[#9b8ec4]/70 opacity-80" />
            <div className="relative rounded-[1.75rem] bg-white p-6 text-foreground shadow-2xl shadow-black/50 sm:p-8">
              <div className="mb-7">
                <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2d6a6a]/15 to-[#9b8ec4]/20 text-[#2d6a6a] ring-1 ring-[#2d6a6a]/15">
                  <ShieldCheck className="size-6" />
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight">خوش برگشتید</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  برای ورود به پنل مدیریت، شماره موبایل و گذرواژهٔ خود را وارد کنید.
                </p>
              </div>
              <LoginForm />
            </div>
          </section>
        </main>

        <footer className="admin-login-enter text-center text-[11px] text-white/35" style={{ ["--d" as string]: "400ms" }}>
          {ADMIN_BRAND_NAME} · پنل مدیریت
        </footer>
      </div>
    </div>
  );
}
