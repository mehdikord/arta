import { ContactsPageClient } from "@/components/admin/contacts/contacts-page-client";
import { getContactsAction } from "@/lib/actions/admin/contacts";

export const metadata = { title: "پیام‌های تماس" };

export default async function AdminContactsPage() {
  const contacts = await getContactsAction();
  return <ContactsPageClient contacts={contacts} />;
}
