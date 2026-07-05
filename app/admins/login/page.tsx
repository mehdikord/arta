import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Shield } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/admin/auth/login-form";
import { getAdminSession } from "@/lib/admin/auth";
import {
  ADMIN_BRAND_NAME,
  ADMIN_DASHBOARD_PATH,
  ADMIN_PANEL_NAME,
} from "@/lib/admin/constants";

export const metadata: Metadata = {
  title: "ورود به پنل",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect(ADMIN_DASHBOARD_PATH);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="grid w-full max-w-4xl gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="hidden flex-col justify-center lg:flex">
          <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Shield className="size-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {ADMIN_PANEL_NAME}
          </h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            مدیریت محتوا، کاربران، نوبت‌ها و تنظیمات{" "}
            <span className="font-medium text-foreground">{ADMIN_BRAND_NAME}</span>
          </p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center lg:text-right">
            <CardTitle className="text-xl">ورود به پنل مدیریت</CardTitle>
            <CardDescription>
              با شماره موبایل و گذرواژه وارد شوید
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
