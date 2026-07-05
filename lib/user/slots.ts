import type { AppointmentSlot } from "@/lib/generated/prisma/client";
import type { TimeSlot } from "@/types";

const SLOT_MAP: Record<TimeSlot, AppointmentSlot> = {
  "08:00-09:00": "SLOT_08_09",
  "09:00-10:00": "SLOT_09_10",
  "10:00-11:00": "SLOT_10_11",
  "11:00-12:00": "SLOT_11_12",
  "12:00-13:00": "SLOT_12_13",
  "13:00-14:00": "SLOT_13_14",
};

const REVERSE_SLOT_MAP = Object.fromEntries(
  Object.entries(SLOT_MAP).map(([time, db]) => [db, time]),
) as Record<AppointmentSlot, TimeSlot>;

export function timeSlotToAppointmentSlot(slot: TimeSlot): AppointmentSlot {
  return SLOT_MAP[slot];
}

export function appointmentSlotToTimeSlot(slot: AppointmentSlot): TimeSlot {
  return REVERSE_SLOT_MAP[slot];
}
