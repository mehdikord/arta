import type { Metadata } from "next";
import { Settings } from "lucide-react";
import { ProfilePageHeader } from "@/components/profile/profile-page-header";
import { SettingsForm } from "@/components/profile/settings-form";
import { ChangePasswordForm } from "@/components/profile/change-password-form";

export const metadata: Metadata = {
  title: "تنظیمات پروفایل",
};

export const dynamic = "force-dynamic";

export default function ProfileSettingsPage() {
  return (
    <>
      <ProfilePageHeader
        title="تنظیمات"
        description="نام نمایشی و رمز عبور حساب خود را مدیریت کنید"
        icon={<Settings className="size-5" />}
      />
      <div className="space-y-6">
        <SettingsForm />
        <ChangePasswordForm />
      </div>
    </>
  );
}
