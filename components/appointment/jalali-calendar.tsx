"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isUnavailableAppointmentDate, toISODate } from "@/lib/date";
import {
  addJalaliMonths,
  dateToJalali,
  formatJalaliDay,
  formatJalaliMonthYear,
  getJalaliMonthGrid,
  getTodayJalali,
  isSameJalaliDay,
  jalaliToDate,
  JALALI_WEEKDAYS_SHORT,
  type JalaliDateParts,
} from "@/lib/jalali-calendar";
import { cn } from "@/lib/utils";

interface JalaliCalendarProps {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
}

function isDisabled(parts: JalaliDateParts): boolean {
  const iso = toISODate(jalaliToDate(parts));
  return isUnavailableAppointmentDate(iso);
}

export function JalaliCalendar({ selected, onSelect }: JalaliCalendarProps) {
  const today = getTodayJalali();
  const selectedJalali = selected ? dateToJalali(selected) : null;

  const [view, setView] = useState<JalaliDateParts>(() => {
    if (selected) return dateToJalali(selected);
    return { year: today.year, month: today.month, day: 1 };
  });

  const cells = useMemo(
    () => getJalaliMonthGrid(view.year, view.month),
    [view.year, view.month],
  );

  function goMonth(delta: number) {
    setView((v) => addJalaliMonths(v.year, v.month, delta));
  }

  function handleSelect(parts: JalaliDateParts) {
    if (isDisabled(parts)) return;
    onSelect(jalaliToDate(parts));
  }

  return (
    <div className="w-full max-w-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between rounded-xl bg-gradient-to-l from-primary/10 via-accent/5 to-transparent px-2 py-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 rounded-lg hover:bg-primary/10 hover:text-primary"
          onClick={() => goMonth(-1)}
          aria-label="ماه قبل"
        >
          <ChevronRight className="size-4" />
        </Button>

        <div className="text-center">
          <p className="text-base font-bold text-foreground">
            {formatJalaliMonthYear(view.year, view.month)}
          </p>
          <p className="text-[11px] text-muted-foreground">تقویم شمسی</p>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-9 rounded-lg hover:bg-primary/10 hover:text-primary"
          onClick={() => goMonth(1)}
          aria-label="ماه بعد"
        >
          <ChevronLeft className="size-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {JALALI_WEEKDAYS_SHORT.map((name) => (
          <div
            key={name}
            className="py-1 text-center text-xs font-semibold text-muted-foreground"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell) => {
          const disabled = !cell.inMonth || isDisabled(cell.parts);
          const isSelected =
            selectedJalali && isSameJalaliDay(cell.parts, selectedJalali);
          const isToday = isSameJalaliDay(cell.parts, today);

          return (
            <button
              key={`${cell.parts.year}-${cell.parts.month}-${cell.parts.day}`}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(cell.parts)}
              aria-label={`${cell.parts.day} ${formatJalaliMonthYear(cell.parts.year, cell.parts.month)}`}
              aria-pressed={isSelected ?? false}
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-xl text-sm font-medium transition-all",
                !cell.inMonth && "invisible",
                cell.inMonth && !disabled && "hover:bg-primary/10 hover:text-primary",
                disabled && cell.inMonth && "cursor-not-allowed text-muted-foreground/40",
                isToday &&
                  !isSelected &&
                  "ring-2 ring-primary/30 ring-offset-1 ring-offset-background",
                isSelected &&
                  "bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary hover:text-primary-foreground",
              )}
            >
              {formatJalaliDay(cell.parts.day)}
              {isToday && !isSelected && (
                <span className="absolute bottom-1 size-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-primary" />
          انتخاب شده
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full ring-2 ring-primary/30" />
          امروز
        </span>
      </div>
    </div>
  );
}
