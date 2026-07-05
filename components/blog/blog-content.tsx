interface BlogContentProps {
  content: string;
}

export function BlogContent({ content }: BlogContentProps) {
  const blocks = content.split("\n\n").filter(Boolean);

  return (
    <article className="prose-rtl max-w-none">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={i} className="mb-4 mt-8 text-xl font-bold text-foreground first:mt-0">
              {trimmed.replace(/^##\s+/, "")}
            </h2>
          );
        }
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={i} className="mb-3 mt-6 text-lg font-semibold text-foreground">
              {trimmed.replace(/^###\s+/, "")}
            </h3>
          );
        }
        if (trimmed.startsWith("> ")) {
          return (
            <blockquote
              key={i}
              className="my-6 border-s-4 border-primary/40 bg-primary/5 px-5 py-4 text-muted-foreground italic"
            >
              {trimmed.replace(/^>\s+/, "")}
            </blockquote>
          );
        }
        if (trimmed.startsWith("- ")) {
          const items = trimmed.split("\n").map((l) => l.replace(/^-\s+/, ""));
          return (
            <ul key={i} className="my-4 list-disc space-y-2 ps-6 text-muted-foreground">
              {items.map((item, j) => (
                <li key={j} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="mb-4 leading-8 text-muted-foreground">
            {trimmed}
          </p>
        );
      })}
    </article>
  );
}
