import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/shared/page-header";
import { FaqForm } from "@/components/admin/faq/faq-form";
import { getFaqAction } from "@/lib/actions/admin/faq";

export const metadata = { title: "ویرایش سؤال" };

export default async function EditFaqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const faq = await getFaqAction(id);
  if (!faq) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="ویرایش سؤال" description={faq.question} />
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <FaqForm faq={faq} />
      </div>
    </div>
  );
}
