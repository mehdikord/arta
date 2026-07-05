"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/admin/shared/page-header";
import { StatusBadge, type StatusBadgeVariant } from "@/components/admin/shared/status-badge";
import { updateContactStatusAction } from "@/lib/actions/admin/contacts";
import { CONTACT_STATUS_LABELS } from "@/lib/admin/format";
import type {
  ContactStatus,
  ContactSubmission,
} from "@/lib/generated/prisma/client";

function contactStatusVariant(status: ContactStatus): StatusBadgeVariant {
  switch (status) {
    case "NEW":
      return "new";
    case "IN_PROGRESS":
      return "in_progress";
    case "RESOLVED":
      return "resolved";
  }
}

export function ContactDetailClient({
  contact,
}: {
  contact: ContactSubmission;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ContactStatus>(contact.status);
  const [loading, setLoading] = useState(false);

  async function handleStatusChange(value: ContactStatus) {
    setLoading(true);
    const result = await updateContactStatusAction(contact.id, value);
    setLoading(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    setStatus(value);
    toast.success("وضعیت به‌روزرسانی شد");
    router.refresh();
  }

  return (
    <>
      <PageHeader
        title={contact.subject}
        description={`پیام از ${contact.name}`}
        actions={
          <Button variant="outline" asChild>
            <Link href="/admins/contacts">
              <ArrowRight className="size-4" />
              بازگشت
            </Link>
          </Button>
        }
      />

      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <StatusBadge
            variant={contactStatusVariant(status)}
            label={CONTACT_STATUS_LABELS[status]}
          />
          <Select
            value={status}
            onValueChange={(v) => handleStatusChange(v as ContactStatus)}
            disabled={loading}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CONTACT_STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">نام</dt>
            <dd className="font-medium">{contact.name}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">موبایل</dt>
            <dd className="font-medium" dir="ltr">
              {contact.mobile}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">تاریخ</dt>
            <dd className="font-medium">
              {new Date(contact.createdAt).toLocaleString("fa-IR")}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">موضوع</dt>
            <dd className="font-medium">{contact.subject}</dd>
          </div>
        </dl>

        {contact.message && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">پیام</p>
            <p className="whitespace-pre-wrap rounded-lg bg-muted/30 p-4 text-sm leading-relaxed">
              {contact.message}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
