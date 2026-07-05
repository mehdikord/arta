import { PageHeader } from "@/components/admin/shared/page-header";
import { SiteSettingsForm } from "@/components/admin/settings/site-settings-form";
import { getSiteSettingsAction } from "@/lib/actions/admin/site-settings";

export const metadata = { title: "تنظیمات سایت" };

export default async function AdminSettingsPage() {
  const settings = await getSiteSettingsAction();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="تنظیمات سایت"
        description="اطلاعات تماس و شبکه‌های اجتماعی"
      />
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <SiteSettingsForm settings={settings} />
      </div>
    </div>
  );
}
