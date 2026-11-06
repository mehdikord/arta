"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { TIME_SLOTS } from "@/lib/constants";
import { getBookedSlotsForDateAction } from "@/lib/actions/appointments";
import { getPastSlotsForToday, isToday } from "@/lib/date";
import type { TimeSlot } from "@/types";
import { TimeSlotButton, type SlotStatus } from "./time-slot-button";

interface TimeSlotPickerProps {
  date: string | null;
  selectedSlot: TimeSlot | null;
  onSelect: (slot: TimeSlot) => void;
}

export function TimeSlotPicker({
  date,
  selectedSlot,
  onSelect,
}: TimeSlotPickerProps) {
  const [bookedSlots, setBookedSlots] = useState<TimeSlot[]>([]);
  const [loadedDate, setLoadedDate] = useState<string | null>(null);

  useEffect(() => {
    if (!date) return;
    let cancelled = false;

    getBookedSlotsForDateAction(date)
      .then((slots) => {
        if (!cancelled) setBookedSlots(slots);
      })
      .finally(() => {
        if (!cancelled) setLoadedDate(date);
      });

    return () => {
      cancelled = true;
    };
  }, [date]);

  if (!date) {
    return (
      <p className="rounded-xl border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        ابتدا یک تاریخ انتخاب کنید
      </p>
    );
  }

  const pastSlots = isToday(date) ? getPastSlotsForToday() : [];
  const loading = loadedDate !== date;

  const slots = TIME_SLOTS.map((slot) => {
    let status: SlotStatus = "available";
    if (selectedSlot === slot) status = "selected";
    else if (bookedSlots.includes(slot)) status = "booked";
    else if (pastSlots.includes(slot)) status = "past";
    return { slot, status };
  });

  const allUnavailable = slots.every(
    (s) => s.status !== "available" && s.status !== "selected",
  );

  return (
    <div className="space-y-4">
      {loading && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          در حال بارگذاری بازه‌های زمانی...
        </div>
      )}
      {allUnavailable && !loading && (
        <p className="rounded-lg bg-destructive/10 p-3 text-center text-sm text-destructive">
          تمام بازه‌های این روز پر است. لطفاً روز دیگری انتخاب کنید.
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {slots.map(({ slot, status }) => (
          <TimeSlotButton
            key={slot}
            slot={slot}
            status={status}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
