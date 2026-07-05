import dayjs from "dayjs";
import jalaliday from "jalaliday";
import type { TimeSlot } from "@/types";

dayjs.extend(jalaliday);

/** Format price in Iranian Toman with thousand separators */
export function formatPrice(amount: number | null): string {
  if (amount === null || amount === 0) return "رایگان";
  return `${amount.toLocaleString("fa-IR")} تومان`;
}

/** Format ISO date to Jalali display string */
export function formatJalaliDate(date: string | Date): string {
  return dayjs(date).calendar("jalali").locale("fa").format("D MMMM YYYY");
}

/** Format time slot for Persian display */
export function formatTimeSlot(slot: TimeSlot | string): string {
  const [start, end] = slot.split("-");
  if (!start || !end) return slot;
  return `${start} تا ${end}`;
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}…`;
}
