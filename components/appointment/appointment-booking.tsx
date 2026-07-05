"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, CalendarPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/shared/page-hero";
import { SectionContainer } from "@/components/shared/section-container";
import { AppointmentCalendar } from "./appointment-calendar";
import { TimeSlotPicker } from "./time-slot-picker";
import { AppointmentSummary } from "./appointment-summary";
import { createAppointmentAction } from "@/lib/actions/auth";
import { useAuth } from "@/hooks/use-auth";
import { toISODate } from "@/lib/date";
import type { TimeSlot } from "@/types";

export function AppointmentBooking() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const dateStr = selectedDate ? toISODate(selectedDate) : null;

  function handleDateSelect(date: Date | undefined) {
    setSelectedDate(date);
    setSelectedSlot(null);
    if (date) setStep(2);
  }

  function handleSlotSelect(slot: TimeSlot) {
    setSelectedSlot(slot);
    setStep(3);
  }

  async function handleConfirm() {
    if (!user || !dateStr || !selectedSlot) return;
    setLoading(true);
    const result = await createAppointmentAction(dateStr, selectedSlot);
    setLoading(false);

    if (!result.success) {
      toast.error("رزرو ناموفق", { description: result.error });
      return;
    }

    setSuccess(true);
    router.refresh();
    toast.success("نوبت با موفقیت ثبت شد!");
  }

  if (success) {
    return (
      <SectionContainer className="py-16">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-10" />
          </div>
          <h2 className="text-2xl font-bold">نوبت شما ثبت شد!</h2>
          <p className="mt-2 text-muted-foreground">
            جزئیات نوبت در بخش «نوبت‌های من» قابل مشاهده است.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild>
              <Link href="/profile/appointments">مشاهده نوبت‌ها</Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSuccess(false);
                setStep(1);
                setSelectedDate(undefined);
                setSelectedSlot(null);
              }}
            >
              رزرو مجدد
            </Button>
          </div>
        </div>
      </SectionContainer>
    );
  }

  return (
    <>
      <PageHero
        title="رزرو نوبت مشاوره"
        description="تاریخ و ساعت مورد نظر خود را انتخاب کنید"
        breadcrumbs={[{ label: "رزرو نوبت" }]}
      />

      <SectionContainer>
        <div className="mb-8 flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex size-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`h-0.5 w-8 sm:w-16 ${step > s ? "bg-primary" : "bg-muted"}`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-sm text-primary">
                  ۱
                </span>
                انتخاب تاریخ
              </h2>
              <AppointmentCalendar
                selected={selectedDate}
                onSelect={handleDateSelect}
              />
            </div>

            {step >= 2 && (
              <div>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-sm text-primary">
                    ۲
                  </span>
                  انتخاب ساعت
                </h2>
                <TimeSlotPicker
                  date={dateStr}
                  selectedSlot={selectedSlot}
                  onSelect={handleSlotSelect}
                />
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="size-3 rounded bg-destructive" /> رزرو شده
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-3 rounded bg-muted" /> گذشته
                  </span>
                </div>
              </div>
            )}
          </div>

          {step >= 3 && dateStr && selectedSlot && user && (
            <div className="space-y-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-sm text-primary">
                  ۳
                </span>
                تأیید و ثبت
              </h2>
              <AppointmentSummary
                date={dateStr}
                timeSlot={selectedSlot}
                userName={user.name}
              />
              <Button
                size="lg"
                className="w-full"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CalendarPlus className="size-4" />
                )}
                ثبت نهایی نوبت
              </Button>
            </div>
          )}
        </div>
      </SectionContainer>
    </>
  );
}
