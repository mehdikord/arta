import { PageHeader } from "@/components/admin/shared/page-header";
import { SiteStatForm } from "@/components/admin/site-stats/site-stat-form";

export const metadata = { title: "آمار جدید" };

export default function NewSiteStatPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="آمار جدید" description="افزودن آمار صفحه اصلی" />
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <SiteStatForm />
      </div>
    </div>
  );
}
