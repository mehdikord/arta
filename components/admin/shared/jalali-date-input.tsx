"use client";

import { forwardRef, useMemo, useState } from "react";
import dayjs from "dayjs";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

/** Parse "YYYY-MM-DD" as a local calendar day. */
function parseIsoDay(value: string | undefined): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.toDate() : undefined;
}

const fullFormat = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * Jalali (Persian) date field. Value/onChange use a Gregorian "YYYY-MM-DD"
 * string, so it drops in where a native `<input type="date">` was used.
 */
export const JalaliDateInput = forwardRef<
  HTMLButtonElement,
  {
    value?: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    disabled?: boolean;
    placeholder?: string;
    id?: string;
    "aria-invalid"?: boolean;
    "aria-describedby"?: string;
  }
>(function JalaliDateInput(
  { value, onChange, onBlur, disabled, placeholder = "انتخاب تاریخ", ...aria },
  ref,
) {
  const selected = parseIsoDay(value);
  const selectedParts = selected ? dateToJalali(selected) : null;
  const today = getTodayJalali();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<JalaliDateParts>(() =>
    selectedParts
      ? { ...selectedParts, day: 1 }
      : { year: today.year, month: today.month, day: 1 },
  );
  const cells = useMemo(() => getJalaliMonthGrid(view.year, view.month), [view.year, view.month]);

  function pick(parts: JalaliDateParts) {
    onChange(dayjs(jalaliToDate(parts)).format("YYYY-MM-DD"));
    setOpen(false);
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next && selectedParts) setView({ ...selectedParts, day: 1 });
        if (!next) onBlur?.();
      }}
    >
      <PopoverTrigger asChild>
        <button
          ref={ref}
          type="button"
          disabled={disabled}
          {...aria}
          className={cn(
            "flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 text-start text-sm shadow-xs transition-[color,box-shadow] outline-none",
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
            "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
          )}
        >
          <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
          <span className={cn("flex-1 truncate", !selected && "text-muted-foreground")}>
            {selected ? fullFormat.format(selected) : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-3" dir="rtl">
        <div className="mb-3 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="ماه قبل"
            onClick={() => setView((v) => addJalaliMonths(v.year, v.month, -1))}
          >
            <ChevronRight className="size-4" />
          </Button>
          <p className="text-sm font-bold">{formatJalaliMonthYear(view.year, view.month)}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="ماه بعد"
            onClick={() => setView((v) => addJalaliMonths(v.year, v.month, 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
        </div>
        <div className="mb-1 grid grid-cols-7 gap-1">
          {JALALI_WEEKDAYS_SHORT.map((name) => (
            <div key={name} className="py-1 text-center text-[11px] font-semibold text-muted-foreground">
              {name}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell) => {
            const isSelected = selectedParts && isSameJalaliDay(cell.parts, selectedParts);
            const isToday = isSameJalaliDay(cell.parts, today);
            return (
              <button
                key={`${cell.parts.year}-${cell.parts.month}-${cell.parts.day}`}
                type="button"
                onClick={() => pick(cell.parts)}
                aria-label={`${formatJalaliDay(cell.parts.day)} ${formatJalaliMonthYear(cell.parts.year, cell.parts.month)}`}
                aria-pressed={Boolean(isSelected)}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-lg text-sm transition-colors",
                  cell.inMonth ? "hover:bg-primary/10 hover:text-primary" : "text-muted-foreground/40 hover:bg-muted",
                  isToday && !isSelected && "font-bold text-primary ring-1 ring-primary/30",
                  isSelected && "bg-primary font-semibold text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                )}
              >
                {formatJalaliDay(cell.parts.day)}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex justify-between border-t pt-3">
          <Button type="button" variant="ghost" size="sm" onClick={() => pick(today)}>
            امروز
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
            بستن
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
});
