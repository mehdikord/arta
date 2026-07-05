import { z } from "zod";

export const blogCategorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(191),
});

export type BlogCategoryInput = z.infer<typeof blogCategorySchema>;
