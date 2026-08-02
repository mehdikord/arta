import { sanitizeBlogContent } from "@/lib/blog-content";

interface BlogContentProps {
  content: string;
}

export function BlogContent({ content }: BlogContentProps) {
  const safeContent = sanitizeBlogContent(content);

  return (
    <article
      className="prose-rtl max-w-none"
      dangerouslySetInnerHTML={{ __html: safeContent }}
    />
  );
}
