import { ServicesPageClient } from "@/components/admin/services/services-page-client";
import { getServicesAction } from "@/lib/actions/admin/services";

export const metadata = { title: "خدمات" };

export default async function AdminServicesPage() {
  const services = await getServicesAction();
  return <ServicesPageClient services={services} />;
}
