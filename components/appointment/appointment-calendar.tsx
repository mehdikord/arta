"use client";

import { JalaliCalendar } from "./jalali-calendar";

interface AppointmentCalendarProps {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
}

export function AppointmentCalendar({
  selected,
  onSelect,
}: AppointmentCalendarProps) {
  return (
    <div className="flex justify-center rounded-2xl border bg-gradient-to-bl from-card via-card to-primary/5 p-6 shadow-sm">
      <JalaliCalendar selected={selected} onSelect={onSelect} />
    </div>
  );
}
