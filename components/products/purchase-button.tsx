"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Gift,
  CheckCircle2,
  Download,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { isFree, isPurchased } from "@/lib/product";
import { PurchaseDialog } from "./purchase-dialog";
import { FreeAccessDialog } from "./free-access-dialog";
import type { Product } from "@/types";

interface PurchaseButtonProps {
  product: Product;
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function PurchaseButton({
  product,
  size = "lg",
  className,
}: PurchaseButtonProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [purchaseOpen, setPurchaseOpen] = useState(false);
  const [freeOpen, setFreeOpen] = useState(false);

  const purchased = isPurchased(user, product.id);
  const free = isFree(product);

  function handleClick() {
    if (purchased) return;

    if (!isAuthenticated) {
      router.push(
        `/auth/login?redirect=${encodeURIComponent(`/products/${product.slug}`)}`,
      );
      return;
    }

    if (free) {
      setFreeOpen(true);
    } else {
      setPurchaseOpen(true);
    }
  }

  if (purchased) {
    return (
      <Button size={size} variant="secondary" disabled className={className}>
        <CheckCircle2 className="size-4" />
        خریداری شده
      </Button>
    );
  }

  return (
    <>
      <Button size={size} onClick={handleClick} className={className}>
        {!isAuthenticated ? (
          <>
            <Lock className="size-4" />
            {free ? "ورود برای دریافت رایگان" : "ورود و خرید"}
          </>
        ) : free ? (
          <>
            <Gift className="size-4" />
            دریافت رایگان
          </>
        ) : (
          <>
            <ShoppingCart className="size-4" />
            خرید پکیج
          </>
        )}
      </Button>

      <PurchaseDialog
        product={product}
        open={purchaseOpen}
        onOpenChange={setPurchaseOpen}
      />
      <FreeAccessDialog
        product={product}
        open={freeOpen}
        onOpenChange={setFreeOpen}
      />
    </>
  );
}

/** Download / access button shown after purchase */
export function ProductAccessButton({
  product,
  size = "default",
  className,
}: {
  product: Product;
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  return (
    <Button asChild size={size} variant="outline" className={className}>
      <a href={`/api/products/${product.id}/download`}>
        <Download className="size-4" />
        دانلود پکیج
      </a>
    </Button>
  );
}
