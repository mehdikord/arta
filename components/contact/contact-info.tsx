import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getSiteConfig } from "@/lib/data";

const contactItems = [
  { icon: Phone, label: "تلفن", key: "phone" as const, dir: "ltr" },
  { icon: Mail, label: "ایمیل", key: "email" as const },
  { icon: MapPin, label: "آدرس", key: "address" as const },
  { icon: Clock, label: "ساعات پاسخگویی", key: "workingHours" as const },
];

export async function ContactInfo() {
  const site = await getSiteConfig();

  return (
    <div className="space-y-4">
      {contactItems.map((item) => (
        <Card key={item.key} className="border-none bg-muted/30 shadow-sm">
          <CardContent className="flex items-start gap-4 p-5">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <item.icon className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {item.label}
              </p>
              <p
                className="mt-1 text-foreground"
                dir={item.dir}
              >
                {site[item.key]}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
