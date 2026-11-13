import { MediaLibrary } from "@/components/admin/media/media-library";
import { getMediaLibraryAction } from "@/lib/actions/admin/media";

export const metadata = { title: "کتابخانهٔ رسانه" };
export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const { files, usage } = await getMediaLibraryAction();
  return <MediaLibrary files={files} usage={usage} />;
}
