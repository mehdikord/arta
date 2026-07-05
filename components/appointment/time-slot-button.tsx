"use client";

import { cn } from "@/lib/utils";
import type { TimeSlot } from "@/types";
import { formatTimeSlot } from "@/lib/format";

export type SlotStatus = "available" | "selected" | "booked" | "past";

interface TimeSlotButtonProps {
  slot: TimeSlot;
  status: SlotStatus;
  onSelect: (slot: TimeSlot) => void;
}

const statusStyles: Record<SlotStatus, string> = {
  available:
    "border-border bg-card hover:border-primary hover:bg-primary/5 cursor-pointer",
  selected: "border-primary bg-primary text-primary-foreground shadow-md",
  booked:
    "border-destructive/50 bg-destructive text-destructive-foreground cursor-not-allowed opacity-90",
  past: "border-muted bg-muted text-muted-foreground cursor-not-allowed opacity-60",
};

export function TimeSlotButton({ slot, status, onSelect }: TimeSlotButtonProps) {
  const disabled = status === "booked" || status === "past";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onSelect(slot)}
      className={cn(
        "rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all",
        statusStyles[status],
      )}
      aria-label={`بازه ${formatTimeSlot(slot)}${status === "booked" ? " — رزرو شده" : ""}`}
    >
      {formatTimeSlot(slot)}
    </button>
  );
}
