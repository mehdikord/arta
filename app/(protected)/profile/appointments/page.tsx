import { Calendar } from "lucide-react";
import { ProfilePageHeader } from "@/components/profile/profile-page-header";
import { AppointmentsList } from "@/components/profile/appointments-list";
import { getCurrentUserAction } from "@/lib/actions/auth";
import { getUserAppointments } from "@/lib/data/appointments";

export const dynamic = "force-dynamic";

export default async function ProfileAppointmentsPage() {
  const user = await getCurrentUserAction();
  if (!user) return null;

  const appointments = await getUserAppointments(user.id);

  return (
    <>
      <ProfilePageHeader
        title="نوبت‌های من"
        description="مشاهده، پیگیری و لغو نوبت‌های مشاوره رزرو شده"
        icon={<Calendar className="size-5" />}
      />
      <AppointmentsList appointments={appointments} />
    </>
  );
}
