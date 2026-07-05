import { TeamPageClient } from "@/components/admin/team/team-page-client";
import { getTeamMembersAction } from "@/lib/actions/admin/team";

export const metadata = { title: "تیم" };

export default async function AdminTeamPage() {
  const members = await getTeamMembersAction();
  return <TeamPageClient members={members} />;
}
