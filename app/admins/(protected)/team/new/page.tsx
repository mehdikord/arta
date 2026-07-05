import { PageHeader } from "@/components/admin/shared/page-header";
import { TeamForm } from "@/components/admin/team/team-form";

export const metadata = { title: "عضو جدید" };

export default function NewTeamPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="عضو جدید" description="افزودن عضو تیم" />
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <TeamForm />
      </div>
    </div>
  );
}
