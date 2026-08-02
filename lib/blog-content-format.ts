const HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*>/i;

export function isHtmlContent(content: string): boolean {
  return HTML_TAG_PATTERN.test(content);
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function legacyContentToHtml(content: string): string {
  if (!content.trim()) return "";
  if (isHtmlContent(content)) return content;

  return content
    .trim()
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      const lines = trimmed.split("\n");

      if (trimmed.startsWith("## ")) {
        return `<h2>${escapeHtml(trimmed.replace(/^##\s+/, ""))}</h2>`;
      }
      if (trimmed.startsWith("### ")) {
        return `<h3>${escapeHtml(trimmed.replace(/^###\s+/, ""))}</h3>`;
      }
      if (trimmed.startsWith("> ")) {
        return `<blockquote><p>${escapeHtml(trimmed.replace(/^>\s+/, ""))}</p></blockquote>`;
      }
      if (lines.every((line) => line.startsWith("- "))) {
        const items = lines
          .map((line) => `<li><p>${escapeHtml(line.replace(/^-\s+/, ""))}</p></li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }

      return `<p>${lines.map(escapeHtml).join("<br>")}</p>`;
    })
    .join("");
}
