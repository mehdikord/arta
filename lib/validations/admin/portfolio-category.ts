import { z } from "zod";

export const portfolioCategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(191),
});

export type PortfolioCategoryInput = z.infer<typeof portfolioCategorySchema>;
