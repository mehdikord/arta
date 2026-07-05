"use client";

import { Separator } from "@/components/ui/separator";
import { useSiteConfig } from "@/components/site/site-config-provider";
import { formatJalaliFull } from "@/lib/date";
import { formatTimeSlot } from "@/lib/format";
import { Calendar, Clock, MapPin, User } from "lucide-react";
import type { TimeSlot } from "@/types";

interface AppointmentSummaryProps {
  date: string;
  timeSlot: TimeSlot;
  userName: string;
}

export function AppointmentSummary({
  date,
  timeSlot,
  userName,
}: AppointmentSummaryProps) {
  const site = useSiteConfig();

  return (
    <div className="rounded-2xl border bg-gradient-to-bl from-primary/5 to-accent/5 p-6">
      <h3 className="mb-4 font-semibold">خلاصه نوبت</h3>
      <dl className="space-y-4 text-sm">
        <div className="flex items-center gap-3">
          <User className="size-4 text-primary" />
          <div>
            <dt className="text-muted-foreground">مراجع</dt>
            <dd className="font-medium">{userName}</dd>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="size-4 text-primary" />
          <div>
            <dt className="text-muted-foreground">تاریخ</dt>
            <dd className="font-medium">{formatJalaliFull(date)}</dd>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Clock className="size-4 text-primary" />
          <div>
            <dt className="text-muted-foreground">ساعت</dt>
            <dd className="font-medium">{formatTimeSlot(timeSlot)}</dd>
          </div>
        </div>
        <Separator />
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 size-4 text-primary" />
          <div>
            <dt className="text-muted-foreground">آدرس</dt>
            <dd className="font-medium">{site.address}</dd>
            <dd className="mt-1 text-xs text-muted-foreground">
              {site.workingHours}
            </dd>
          </div>
        </div>
      </dl>
    </div>
  );
}
