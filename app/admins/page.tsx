import { redirect } from "next/navigation";
import { ADMIN_DASHBOARD_PATH } from "@/lib/admin/constants";

/** Redirect /admins → dashboard (auth guard added in phase 2). */
export default function AdminIndexPage() {
  redirect(ADMIN_DASHBOARD_PATH);
}
