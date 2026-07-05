import { MapPin } from "lucide-react";

export function ContactMap() {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-gradient-to-bl from-primary/10 to-secondary/30">
      <div className="absolute inset-0 section-pattern opacity-30" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <MapPin className="size-12 text-primary/40" />
        <p className="text-sm font-medium">نقشه موقعیت آکادمی</p>
        <p className="max-w-xs text-center text-xs">
          تهران، خیابان ولیعصر — (Mock)
        </p>
      </div>
    </div>
  );
}
