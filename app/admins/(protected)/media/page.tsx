import { MediaPageClient } from "@/components/admin/media/media-page-client";
import { getMediaFilesAction } from "@/lib/actions/admin/media";

export const metadata = { title: "رسانه" };

export default async function AdminMediaPage() {
  const files = await getMediaFilesAction();
  return <MediaPageClient files={files} />;
}
