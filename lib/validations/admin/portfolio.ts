import { z } from "zod";

export const portfolioGallerySchema = z.object({
  url: z.string().min(1).max(500),
  sortOrder: z.number().int().min(0),
});

export const portfolioSchema = z.object({
  title: z.string().min(2).max(191),
  slug: z.string().min(2).max(191),
  shortDescription: z.string().min(10).max(500),
  fullDescription: z.string().min(20),
  categoryId: z.string().uuid(),
  image: z.string().min(1).max(500),
  year: z.number().int().min(1990).max(2100).nullable(),
  client: z.string().max(191).nullable(),
  sortOrder: z.number().int().min(0),
  isPublished: z.boolean(),
  gallery: z.array(portfolioGallerySchema),
});

export type PortfolioInput = z.infer<typeof portfolioSchema>;
