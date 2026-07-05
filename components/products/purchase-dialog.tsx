"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard, ShieldCheck } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { PriceDisplay } from "@/components/shared/price-display";
import { useAuth } from "@/hooks/use-auth";
import { getFinalPrice } from "@/lib/product";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types";

interface PurchaseDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PurchaseDialog({
  product,
  open,
  onOpenChange,
}: PurchaseDialogProps) {
  const router = useRouter();
  const { addPurchase } = useAuth();
  const [loading, setLoading] = useState(false);

  const finalPrice = getFinalPrice(product);

  async function handlePurchase() {
    setLoading(true);
    const success = await addPurchase(product.id);
    setLoading(false);
    if (!success) {
      toast.error("خطا در ثبت خرید");
      return;
    }
    onOpenChange(false);
    toast.success("خرید با موفقیت انجام شد!", {
      description: `«${product.title}» به کتابخانه شما اضافه شد.`,
    });
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تأیید خرید</DialogTitle>
          <DialogDescription>
            پرداخت Mock — بدون درگاه واقعی
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="font-semibold">{product.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {product.category}
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">مبلغ قابل پرداخت</span>
            <PriceDisplay
              price={product.price}
              discountPrice={product.discountPrice}
              size="lg"
            />
          </div>

          {finalPrice > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 shrink-0 text-primary" />
              پرداخت امن Mock — شبیه‌سازی ۱.۵ ثانیه‌ای
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button onClick={handlePurchase} disabled={loading} className="min-w-32">
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                در حال پرداخت...
              </>
            ) : (
              <>
                <CreditCard className="size-4" />
                پرداخت {formatPrice(finalPrice)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
