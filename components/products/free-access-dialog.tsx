"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import type { Product } from "@/types";

interface FreeAccessDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FreeAccessDialog({
  product,
  open,
  onOpenChange,
}: FreeAccessDialogProps) {
  const router = useRouter();
  const { addPurchase } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    const success = await addPurchase(product.id);
    setLoading(false);
    if (!success) {
      toast.error("خطا در فعال‌سازی دسترسی");
      return;
    }
    onOpenChange(false);
    toast.success("دسترسی رایگان فعال شد!", {
      description: `«${product.title}» به کتابخانه شما اضافه شد.`,
    });
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="size-5 text-accent" />
            دریافت رایگان
          </DialogTitle>
          <DialogDescription>
            این پکیج رایگان است. پس از تأیید به کتابخانه شما اضافه می‌شود.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-accent/30 bg-accent/10 p-4">
          <p className="font-semibold">{product.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {product.shortDescription}
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                در حال فعال‌سازی...
              </>
            ) : (
              <>
                <Gift className="size-4" />
                دریافت رایگان
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
