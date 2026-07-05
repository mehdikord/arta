"use server";

import { revalidatePath } from "next/cache";
import { getBookedSlotsForDate } from "@/lib/data/appointments";
import type { TimeSlot } from "@/types";

export async function getBookedSlotsForDateAction(
  date: string,
): Promise<TimeSlot[]> {
  return getBookedSlotsForDate(date);
}

export async function revalidateAppointmentPathsAction() {
  revalidatePath("/profile/appointments");
  revalidatePath("/appointment");
}
