"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/main-layout";
import { SectionContainer } from "@/components/shared/section-container";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <MainLayout>
      <SectionContainer className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-8" />
      </div>
      <h1 className="text-2xl font-bold">خطایی رخ داد</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        متأسفانه مشکلی در بارگذاری صفحه پیش آمد. لطفاً دوباره تلاش کنید.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={reset}>
          <RefreshCw className="size-4" />
          تلاش مجدد
        </Button>
        <Button asChild variant="outline">
          <Link href="/">بازگشت به خانه</Link>
        </Button>
      </div>
      </SectionContainer>
    </MainLayout>
  );
}
