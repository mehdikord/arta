import { FaqPageClient } from "@/components/admin/faq/faq-page-client";
import { getFaqsAction } from "@/lib/actions/admin/faq";

export const metadata = { title: "سوالات متداول" };

export default async function AdminFaqPage() {
  const faqs = await getFaqsAction();
  return <FaqPageClient faqs={faqs} />;
}
