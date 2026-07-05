import { PageHeader } from "@/components/admin/shared/page-header";
import { StaffForm } from "@/components/admin/staff/staff-form";

export const metadata = { title: "مدیر جدید" };

export default function NewStaffPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="مدیر جدید" description="ایجاد حساب مدیر جدید" />
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <StaffForm />
      </div>
    </div>
  );
}
