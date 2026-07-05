import { notFound } from "next/navigation";
import { ContactDetailClient } from "@/components/admin/contacts/contact-detail-client";
import { getContactAction } from "@/lib/actions/admin/contacts";

export const metadata = { title: "جزئیات پیام" };

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contact = await getContactAction(id);
  if (!contact) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <ContactDetailClient contact={contact} />
    </div>
  );
}
