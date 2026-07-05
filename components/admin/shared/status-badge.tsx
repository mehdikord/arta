import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusBadgeVariant =
  | "published"
  | "draft"
  | "active"
  | "inactive"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "new"
  | "in_progress"
  | "resolved"
  | "free"
  | "paid"
  | "featured";

const VARIANT_CONFIG: Record<
  StatusBadgeVariant,
  { label: string; className: string }
> = {
  published: {
    label: "منتشرشده",
    className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  },
  draft: {
    label: "پیش‌نویس",
    className: "bg-slate-100 text-slate-700 hover:bg-slate-100",
  },
  active: {
    label: "فعال",
    className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  },
  inactive: {
    label: "غیرفعال",
    className: "bg-slate-100 text-slate-600 hover:bg-slate-100",
  },
  confirmed: {
    label: "تأییدشده",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  cancelled: {
    label: "لغوشده",
    className: "bg-red-100 text-red-700 hover:bg-red-100",
  },
  completed: {
    label: "تکمیل‌شده",
    className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  },
  new: {
    label: "جدید",
    className: "bg-sky-100 text-sky-800 hover:bg-sky-100",
  },
  in_progress: {
    label: "در حال بررسی",
    className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  },
  resolved: {
    label: "حل‌شده",
    className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  },
  free: {
    label: "رایگان",
    className: "bg-violet-100 text-violet-800 hover:bg-violet-100",
  },
  paid: {
    label: "پولی",
    className: "bg-primary/10 text-primary hover:bg-primary/10",
  },
  featured: {
    label: "ویژه",
    className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  },
};

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  label?: string;
  className?: string;
}

export function StatusBadge({ variant, label, className }: StatusBadgeProps) {
  const config = VARIANT_CONFIG[variant];

  return (
    <Badge
      variant="secondary"
      className={cn("font-medium", config.className, className)}
    >
      {label ?? config.label}
    </Badge>
  );
}
