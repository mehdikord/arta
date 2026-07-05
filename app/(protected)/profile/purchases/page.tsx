import { Package } from "lucide-react";
import { ProfilePageHeader } from "@/components/profile/profile-page-header";
import { PurchasesList } from "@/components/profile/purchases-list";
import { getCurrentUserAction } from "@/lib/actions/auth";
import { getProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ProfilePurchasesPage() {
  const user = await getCurrentUserAction();
  const allProducts = await getProducts();
  const products = allProducts.filter((p) =>
    user?.purchases.includes(p.id),
  );

  return (
    <>
      <ProfilePageHeader
        title="پکیج‌های من"
        description="پکیج‌های خریداری‌شده و رایگان — دسترسی مستقیم به فایل‌ها"
        icon={<Package className="size-5" />}
      />
      <PurchasesList products={products} />
    </>
  );
}
