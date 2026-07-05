import dayjs from "dayjs";
import type { AppointmentStatus as DbAppointmentStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { appointmentSlotToTimeSlot } from "@/lib/user/slots";
import type { Appointment, AppointmentStatus, TimeSlot } from "@/types";

const STATUS_MAP: Record<DbAppointmentStatus, AppointmentStatus> = {
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

function mapAppointment(row: {
  id: string;
  userId: string;
  date: Date;
  slot: Parameters<typeof appointmentSlotToTimeSlot>[0];
  status: DbAppointmentStatus;
  createdAt: Date;
}): Appointment {
  return {
    id: row.id,
    userId: row.userId,
    date: dayjs(row.date).format("YYYY-MM-DD"),
    timeSlot: appointmentSlotToTimeSlot(row.slot),
    status: STATUS_MAP[row.status],
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getUserAppointments(userId: string) {
  const rows = await prisma.appointment.findMany({
    where: { userId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(mapAppointment);
}

export async function getBookedSlotsForDate(date: string): Promise<TimeSlot[]> {
  const rows = await prisma.appointment.findMany({
    where: {
      date: new Date(date),
      status: { in: ["CONFIRMED", "COMPLETED"] },
    },
    select: { slot: true },
  });
  return rows.map((row) => appointmentSlotToTimeSlot(row.slot));
}

export async function getActiveAppointmentCount(userId: string) {
  const today = dayjs().startOf("day").toDate();
  return prisma.appointment.count({
    where: {
      userId,
      status: "CONFIRMED",
      date: { gte: today },
    },
  });
}
