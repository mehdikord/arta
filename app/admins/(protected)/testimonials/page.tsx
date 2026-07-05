import { TestimonialsPageClient } from "@/components/admin/testimonials/testimonials-page-client";
import { getTestimonialsAction } from "@/lib/actions/admin/testimonials";

export const metadata = { title: "نظرات مشتریان" };

export default async function AdminTestimonialsPage() {
  const testimonials = await getTestimonialsAction();
  return <TestimonialsPageClient testimonials={testimonials} />;
}
