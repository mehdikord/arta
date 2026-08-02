import Image from "next/image";
import { FileQuestion, FileText, Video } from "lucide-react";
import type { MediaFile } from "@/lib/actions/admin/media";
import { cn } from "@/lib/utils";

export function MediaThumbnail({
  file,
  className,
  sizes = "120px",
}: {
  file: MediaFile;
  className?: string;
  sizes?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex size-full items-center justify-center overflow-hidden bg-muted/40",
        className,
      )}
    >
      {file.type === "image" ? (
        <Image
          src={file.url}
          alt={file.name}
          fill
          className="object-cover"
          sizes={sizes}
        />
      ) : file.type === "video" ? (
        <Video className="size-7 text-muted-foreground" />
      ) : file.type === "document" ? (
        <FileText className="size-7 text-muted-foreground" />
      ) : (
        <FileQuestion className="size-7 text-muted-foreground" />
      )}
    </div>
  );
}
