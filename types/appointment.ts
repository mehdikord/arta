/** Appointment booking status */
export type AppointmentStatus = "confirmed" | "cancelled" | "completed";

/** Booked counseling appointment */
export interface Appointment {
  id: string;
  userId: string;
  /** ISO date YYYY-MM-DD */
  date: string;
  /** e.g. "08:00-09:00" */
  timeSlot: string;
  status: AppointmentStatus;
  createdAt: string;
}
