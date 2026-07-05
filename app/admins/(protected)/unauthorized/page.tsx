import { ShieldX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminUnauthorizedPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md border-0 shadow-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldX className="size-7" />
          </div>
          <CardTitle>دسترسی غیرمجاز</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            شما مجوز دسترسی به این بخش را ندارید.
          </p>
          <Button asChild>
            <Link href="/admins/dashboard">بازگشت به داشبورد</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
