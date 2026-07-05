import dayjs from "dayjs";
import jalaliday from "jalaliday";

dayjs.extend(jalaliday);

export const JALALI_WEEKDAYS_SHORT = [
  "ش",
  "ی",
  "د",
  "س",
  "چ",
  "پ",
  "ج",
] as const;

export const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

export interface JalaliDateParts {
  year: number;
  month: number;
  day: number;
}

export interface JalaliCalendarCell {
  parts: JalaliDateParts;
  gregorian: Date;
  inMonth: boolean;
}

/** Iran week starts Saturday — map dayjs weekday to 0=Sat … 6=Fri */
export function toIranWeekday(dayjsWeekday: number): number {
  return (dayjsWeekday + 1) % 7;
}

export function getTodayJalali(): JalaliDateParts {
  const d = dayjs().calendar("jalali");
  return { year: d.year(), month: d.month() + 1, day: d.date() };
}

export function dateToJalali(date: Date): JalaliDateParts {
  const d = dayjs(date).calendar("jalali");
  return { year: d.year(), month: d.month() + 1, day: d.date() };
}

export function jalaliToDate(parts: JalaliDateParts): Date {
  return dayjs(`${parts.year}/${parts.month}/${parts.day}`, {
    jalali: true,
  }).toDate();
}

export function isSameJalaliDay(
  a: JalaliDateParts,
  b: JalaliDateParts,
): boolean {
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

export function formatJalaliMonthYear(year: number, month: number): string {
  return `${JALALI_MONTHS[month - 1]} ${year.toLocaleString("fa-IR")}`;
}

export function formatJalaliDay(day: number): string {
  return day.toLocaleString("fa-IR");
}

/** Build 6-week grid for a Jalali month view */
export function getJalaliMonthGrid(
  viewYear: number,
  viewMonth: number,
): JalaliCalendarCell[] {
  const firstOfMonth = dayjs(`${viewYear}/${viewMonth}/1`, { jalali: true });
  const startOffset = toIranWeekday(firstOfMonth.day());
  let cursor = firstOfMonth.subtract(startOffset, "day");

  return Array.from({ length: 42 }, () => {
    const j = cursor.calendar("jalali");
    const parts: JalaliDateParts = {
      year: j.year(),
      month: j.month() + 1,
      day: j.date(),
    };
    const cell: JalaliCalendarCell = {
      parts,
      gregorian: cursor.toDate(),
      inMonth: parts.year === viewYear && parts.month === viewMonth,
    };
    cursor = cursor.add(1, "day");
    return cell;
  });
}

export function addJalaliMonths(
  year: number,
  month: number,
  delta: number,
): JalaliDateParts {
  const d = dayjs(`${year}/${month}/1`, { jalali: true }).add(delta, "month");
  const j = d.calendar("jalali");
  return { year: j.year(), month: j.month() + 1, day: 1 };
}
