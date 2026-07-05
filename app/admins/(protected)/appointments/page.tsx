import { AppointmentsPageClient } from "@/components/admin/appointments/appointments-page-client";
import { getAppointmentsAction } from "@/lib/actions/admin/operations";

export const metadata = { title: "نوبت‌ها" };

export default async function AdminAppointmentsPage() {
  const appointments = await getAppointmentsAction();
  return <AppointmentsPageClient appointments={appointments} />;
}
