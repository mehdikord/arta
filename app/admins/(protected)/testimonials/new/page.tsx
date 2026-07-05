import { PageHeader } from "@/components/admin/shared/page-header";
import { TestimonialForm } from "@/components/admin/testimonials/testimonial-form";

export const metadata = { title: "نظر جدید" };

export default function NewTestimonialPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="نظر جدید" description="افزودن نظر مشتری" />
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <TestimonialForm />
      </div>
    </div>
  );
}
