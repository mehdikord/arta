import dayjs from "dayjs";
import jalaliday from "jalaliday";
import type { TimeSlot } from "@/types";
import { TIME_SLOTS } from "@/lib/constants";

dayjs.extend(jalaliday);

/** Format ISO date to Jalali display */
export function toJalali(date: string | Date): string {
  return dayjs(date).calendar("jalali").locale("fa").format("YYYY/MM/DD");
}

/** Full Jalali date e.g. «شنبه ۱۵ تیر ۱۴۰۵» */
export function formatJalaliFull(date: string | Date): string {
  return dayjs(date).calendar("jalali").locale("fa").format("dddd D MMMM YYYY");
}

/** Check if date is before today */
export function isPastDate(date: string): boolean {
  return dayjs(date).isBefore(dayjs(), "day");
}

/** Check if date is today */
export function isToday(date: string): boolean {
  return dayjs(date).isSame(dayjs(), "day");
}

/** Friday is not available for appointments */
export function isFriday(date: string): boolean {
  return dayjs(date).day() === 5;
}

/** Dates that cannot be booked */
export function isUnavailableAppointmentDate(date: string): boolean {
  return isPastDate(date) || isFriday(date);
}

/** Get past time slots for today based on current hour */
export function getPastSlotsForToday(): TimeSlot[] {
  const hour = dayjs().hour();
  return TIME_SLOTS.filter((slot) => {
    const startHour = parseInt(slot.split(":")[0] ?? "0", 10);
    return startHour <= hour;
  });
}

/** Convert Date to ISO date string YYYY-MM-DD */
export function toISODate(date: Date): string {
  return dayjs(date).format("YYYY-MM-DD");
}
