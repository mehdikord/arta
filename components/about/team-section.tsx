import { SectionTitle } from "@/components/shared/section-title";
import { AnimateIn } from "@/components/shared/animate-in";
import { TeamCard } from "./team-card";
import { getManagementTeam, getStaffTeam } from "@/lib/data";

export async function TeamSection() {
  const [management, staff] = await Promise.all([
    getManagementTeam(),
    getStaffTeam(),
  ]);

  return (
    <div className="space-y-16">
      <div>
        <SectionTitle title="تیم مدیریت" subtitle="رهبری و نظارت علمی آکادمی" />
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {management.map((member, i) => (
            <AnimateIn key={member.id} delay={(i + 1) as 1 | 2}>
              <TeamCard member={member} />
            </AnimateIn>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle
          title="مشاوران و مربیان"
          subtitle="متخصصان حوزه‌های مختلف"
        />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((member, i) => (
            <AnimateIn key={member.id} delay={(i % 3 + 1) as 1 | 2 | 3}>
              <TeamCard member={member} />
            </AnimateIn>
          ))}
        </div>
      </div>
    </div>
  );
}
