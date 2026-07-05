import { PurchasesPageClient } from "@/components/admin/purchases/purchases-page-client";
import { getPurchasesAction } from "@/lib/actions/admin/operations";

export const metadata = { title: "خریدها" };

export default async function AdminPurchasesPage() {
  const purchases = await getPurchasesAction();
  return <PurchasesPageClient purchases={purchases} />;
}
