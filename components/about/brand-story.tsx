import { Target, Eye, History } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimateIn } from "@/components/shared/animate-in";

const storyItems = [
  {
    icon: History,
    title: "تاریخچه",
    content:
      "آکادمی آرتا در سال ۱۳۹۲ با هدف ایجاد فضایی تخصصی برای رشد فردی و سازمانی تأسیس شد. از یک دفتر کوچک مشاوره تا مجموعه‌ای جامع با تیم ۵ نفره متخصص.",
  },
  {
    icon: Target,
    title: "مأموریت",
    content:
      "توانمندسازی افراد و سازمان‌ها از طریق ارائه خدمات مشاوره، کوچینگ و آموزش مبتنی بر شواهد علمی، با رویکردی انسان‌محور و بدون قضاوت.",
  },
  {
    icon: Eye,
    title: "چشم‌انداز",
    content:
      "تبدیل شدن به مرجع پیشرو مشاوره و توانمندسازی در ایران، با گسترش خدمات دیجیتال و دسترسی آسان‌تر برای همه اقشار جامعه.",
  },
];

export function BrandStory() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {storyItems.map((item, i) => (
        <AnimateIn key={item.title} delay={(i + 1) as 1 | 2 | 3}>
          <Card className="h-full border-none bg-gradient-to-bl from-card to-muted/30 shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <item.icon className="size-6" />
              </div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {item.content}
              </p>
            </CardContent>
          </Card>
        </AnimateIn>
      ))}
    </div>
  );
}
