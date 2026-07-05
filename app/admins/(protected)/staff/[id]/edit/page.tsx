import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/shared/page-header";
import { StaffForm } from "@/components/admin/staff/staff-form";
import { getStaffMemberAction } from "@/lib/actions/admin/staff";

export const metadata = { title: "ویرایش مدیر" };

export default async function EditStaffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getStaffMemberAction(id);
  if (!member) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="ویرایش مدیر" description={member.name} />
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <StaffForm member={member} />
      </div>
    </div>
  );
}
