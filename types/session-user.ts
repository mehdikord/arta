/** User data exposed to the client session (no password). */
export interface SessionUser {
  id: string;
  name: string;
  mobile: string;
  createdAt: string;
  purchases: string[];
  appointments: string[];
  activeAppointmentCount: number;
}
