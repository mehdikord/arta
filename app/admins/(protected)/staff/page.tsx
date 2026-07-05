import { StaffPageClient } from "@/components/admin/staff/staff-page-client";
import { getStaffAction } from "@/lib/actions/admin/staff";

export const metadata = { title: "مدیران" };

export default async function AdminStaffPage() {
  const staff = await getStaffAction();
  return <StaffPageClient staff={staff} />;
}
