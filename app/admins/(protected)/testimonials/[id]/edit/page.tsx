import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/shared/page-header";
import { TestimonialForm } from "@/components/admin/testimonials/testimonial-form";
import { getTestimonialAction } from "@/lib/actions/admin/testimonials";

export const metadata = { title: "ویرایش نظر" };

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const testimonial = await getTestimonialAction(id);
  if (!testimonial) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="ویرایش نظر" description={testimonial.name} />
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <TestimonialForm testimonial={testimonial} />
      </div>
    </div>
  );
}
