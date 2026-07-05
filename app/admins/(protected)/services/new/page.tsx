import { PageHeader } from "@/components/admin/shared/page-header";
import { ServiceForm } from "@/components/admin/services/service-form";

export const metadata = { title: "خدمت جدید" };

export default function NewServicePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="خدمت جدید" description="ایجاد خدمت جدید" />
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <ServiceForm />
      </div>
    </div>
  );
}
