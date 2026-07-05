import type { PortfolioItem } from "@/types";

/** Extract paragraphs and bullet points from full description */
export function parsePortfolioDescription(fullDescription: string) {
  const lines = fullDescription.split("\n");
  const paragraphs: string[] = [];
  const bullets: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("•")) {
      bullets.push(trimmed.replace(/^•\s*/, ""));
    } else {
      paragraphs.push(trimmed);
    }
  }

  return { paragraphs, bullets };
}

export const PORTFOLIO_CATEGORIES = ["سازمانی", "فردی", "کارگاه"] as const;

export type PortfolioCategory = (typeof PORTFOLIO_CATEGORIES)[number];

const categoryGradients: Record<string, string> = {
  سازمانی: "from-primary/80 via-primary/50 to-accent/40",
  فردی: "from-accent/70 via-accent/40 to-secondary/60",
  کارگاه: "from-secondary/80 via-primary/30 to-accent/30",
};

export function getPortfolioGradient(category: string): string {
  return categoryGradients[category] ?? "from-primary/60 to-accent/40";
}

/** Tiny blur placeholder for next/image */
export const PORTFOLIO_BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMmQ2QTYiLz48L3N2Zz4=";

export function getPortfolioCategoriesFromItems(items: PortfolioItem[]): string[] {
  return [...new Set(items.map((item) => item.category))];
}
