import { z } from "zod";

export const productCategorySchema = z.object({
  name: z.string().min(2, "نام الزامی است").max(100),
  slug: z.string().min(2).max(191),
});

export type ProductCategoryInput = z.infer<typeof productCategorySchema>;
