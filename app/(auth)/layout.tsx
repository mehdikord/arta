import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { getSiteConfig } from "@/lib/data";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = await getSiteConfig();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-bl from-secondary/40 via-background to-primary/5 px-4 py-12">
      <div className="absolute inset-0 section-pattern opacity-30" />
      <Link
        href="/"
        className="relative z-10 mb-8 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        بازگشت به خانه
      </Link>
      <div className="relative z-10 mb-6 flex items-center gap-2">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Sparkles className="size-5" />
        </span>
        <span className="font-bold">{site.name}</span>
      </div>
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
