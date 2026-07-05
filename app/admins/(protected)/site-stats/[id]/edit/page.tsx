import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/shared/page-header";
import { SiteStatForm } from "@/components/admin/site-stats/site-stat-form";
import { getSiteStatAction } from "@/lib/actions/admin/site-stats";

export const metadata = { title: "ویرایش آمار" };

export default async function EditSiteStatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const stat = await getSiteStatAction(id);
  if (!stat) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="ویرایش آمار" description={stat.label} />
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <SiteStatForm stat={stat} />
      </div>
    </div>
  );
}
