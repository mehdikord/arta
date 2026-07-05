import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/shared/page-header";
import { ServiceForm } from "@/components/admin/services/service-form";
import { getServiceAction } from "@/lib/actions/admin/services";

export const metadata = { title: "ویرایش خدمت" };

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getServiceAction(id);
  if (!service) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="ویرایش خدمت" description={service.title} />
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <ServiceForm service={service} />
      </div>
    </div>
  );
}
