import type { Metadata } from "next";
import { AppointmentBooking } from "@/components/appointment/appointment-booking";

export const metadata: Metadata = {
  title: "رزرو نوبت",
  description: "رزرو آنلاین نوبت مشاوره در آکادمی آرتا",
};

export const dynamic = "force-dynamic";

export default function AppointmentPage() {
  return <AppointmentBooking />;
}
