import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/shared/page-header";
import { TeamForm } from "@/components/admin/team/team-form";
import { getTeamMemberAction } from "@/lib/actions/admin/team";

export const metadata = { title: "ویرایش عضو" };

export default async function EditTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getTeamMemberAction(id);
  if (!member) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="ویرایش عضو" description={member.name} />
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <TeamForm member={member} />
      </div>
    </div>
  );
}
