import { Award, Building2, GraduationCap, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const certifications = [
  {
    icon: GraduationCap,
    title: "مجوز نظام روانشناسی",
    org: "سازمان نظام روانشناسی",
  },
  {
    icon: Award,
    title: "گواهی ICF",
    org: "فدراسیون بین‌المللی کوچینگ",
  },
  {
    icon: Building2,
    title: "همکاری سازمانی",
    org: "بیش از ۵۰ سازمان",
  },
  {
    icon: ShieldCheck,
    title: "استاندارد ISO",
    org: "مدیریت کیفیت خدمات",
  },
];

export function Certifications() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {certifications.map((cert) => (
        <Card
          key={cert.title}
          className="border-dashed bg-muted/20 text-center"
        >
          <CardContent className="p-5">
            <cert.icon className="mx-auto mb-3 size-8 text-primary/60" />
            <p className="text-sm font-medium">{cert.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{cert.org}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
