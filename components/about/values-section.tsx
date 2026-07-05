import { Brain, Sprout, Shield, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimateIn } from "@/components/shared/animate-in";

const values = [
  {
    icon: Brain,
    title: "آگاهی",
    description: "خودشناسی و درک عمیق از الگوهای فکری و رفتاری",
  },
  {
    icon: Sprout,
    title: "رشد",
    description: "توسعه مستمر مهارت‌ها و توانمندی‌های فردی و حرفه‌ای",
  },
  {
    icon: Shield,
    title: "توانمندی",
    description: "تقویت توانایی مقابله و تصمیم‌گیری مستقل",
  },
  {
    icon: Heart,
    title: "آرامش",
    description: "ایجاد تعادل روانی و کیفیت زندگی پایدار",
  },
];

export function ValuesSection() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {values.map((value, i) => (
        <AnimateIn key={value.title} delay={(i % 3 + 1) as 1 | 2 | 3}>
          <Card className="group h-full text-center transition-all hover:-translate-y-1 hover:shadow-lg">
            <CardContent className="p-6">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-accent/15 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                <value.icon className="size-7" />
              </div>
              <h3 className="font-semibold">{value.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {value.description}
              </p>
            </CardContent>
          </Card>
        </AnimateIn>
      ))}
    </div>
  );
}
