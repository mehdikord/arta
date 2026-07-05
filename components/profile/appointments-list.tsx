"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Calendar, CalendarPlus, Clock, Loader2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cancelAppointmentAction } from "@/lib/actions/auth";
import { formatJalaliFull, isPastDate } from "@/lib/date";
import { formatTimeSlot } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Appointment, AppointmentStatus } from "@/types";

const statusConfig: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  confirmed: {
    label: "تأیید شده",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  cancelled: {
    label: "لغو شده",
    className: "bg-muted text-muted-foreground border-border",
  },
  completed: {
    label: "انجام شده",
    className: "bg-accent/10 text-accent border-accent/20",
  },
};

function canCancel(appointment: Appointment): boolean {
  return (
    appointment.status === "confirmed" && !isPastDate(appointment.date)
  );
}

interface AppointmentRowProps {
  appointment: Appointment;
  onCancel: (id: string) => Promise<void>;
}

export function AppointmentRow({ appointment, onCancel }: AppointmentRowProps) {
  const [open, setOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const config = statusConfig[appointment.status];
  const cancellable = canCancel(appointment);

  async function handleCancel() {
    setCancelling(true);
    await onCancel(appointment.id);
    setCancelling(false);
    setOpen(false);
    toast.success("نوبت با موفقیت لغو شد");
  }

  return (
    <article className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-md">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Calendar className="size-5" />
          </div>
          <div className="space-y-1.5">
            <p className="font-semibold leading-snug">
              {formatJalaliFull(appointment.date)}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="size-3.5" />
              {formatTimeSlot(appointment.timeSlot)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:shrink-0">
          <Badge
            variant="outline"
            className={cn("rounded-full px-3 py-1", config.className)}
          >
            {config.label}
          </Badge>
          {cancellable && (
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/5 hover:text-destructive"
                >
                  <XCircle className="size-4" />
                  لغو
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>لغو نوبت</AlertDialogTitle>
                  <AlertDialogDescription>
                    آیا از لغو این نوبت اطمینان دارید؟ این عمل قابل بازگشت
                    نیست.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={cancelling}>
                    انصراف
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {cancelling ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      "لغو نوبت"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </article>
  );
}

interface AppointmentsListProps {
  appointments: Appointment[];
}

export function AppointmentsList({ appointments }: AppointmentsListProps) {
  const router = useRouter();

  async function handleCancel(id: string) {
    const result = await cancelAppointmentAction(id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  if (appointments.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-dashed bg-gradient-to-bl from-muted/50 via-background to-accent/5 p-12 text-center">
        <div className="absolute -end-8 -top-8 size-32 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-muted">
            <Calendar className="size-8 text-muted-foreground/60" />
          </div>
          <p className="text-lg font-semibold">نوبتی ثبت نشده است</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            برای رزرو مشاوره، تاریخ و ساعت مورد نظر خود را انتخاب کنید
          </p>
          <Button asChild className="mt-8 shadow-md" size="lg">
            <Link href="/appointment">
              <CalendarPlus className="size-4" />
              رزرو نوبت
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {appointments.map((apt) => (
        <AppointmentRow
          key={apt.id}
          appointment={apt}
          onCancel={handleCancel}
        />
      ))}
    </div>
  );
}
