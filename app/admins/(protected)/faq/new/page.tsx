import { PageHeader } from "@/components/admin/shared/page-header";
import { FaqForm } from "@/components/admin/faq/faq-form";

export const metadata = { title: "سؤال جدید" };

export default function NewFaqPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="سؤال جدید" description="ایجاد سؤال متداول جدید" />
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <FaqForm />
      </div>
    </div>
  );
}
