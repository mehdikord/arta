/** Portfolio project showcase */
export interface PortfolioItem {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  image: string;
  gallery?: string[];
  category: string;
  year?: number;
  client?: string;
}
