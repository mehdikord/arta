import Link from "next/link";
import { Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionContainer } from "@/components/shared/section-container";

export default function NotFound() {
  return (
    <SectionContainer className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 text-8xl font-bold text-primary/20">۴۰۴</div>
      <h1 className="text-2xl font-bold">صفحه یافت نشد</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        متأسفانه صفحه‌ای که به دنبال آن هستید وجود ندارد یا منتقل شده است.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/">
            <Home className="size-4" />
            بازگشت به خانه
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/services">
            <Search className="size-4" />
            مشاهده خدمات
          </Link>
        </Button>
      </div>
    </SectionContainer>
  );
}
