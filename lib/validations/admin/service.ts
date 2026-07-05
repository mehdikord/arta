import { z } from "zod";

export const serviceSchema = z.object({
  title: z.string().min(2, "عنوان الزامی است").max(191),
  slug: z.string().min(2).max(191),
  shortDescription: z.string().min(10).max(500),
  fullDescription: z.string().min(20),
  category: z.enum(["INDIVIDUAL", "COUPLE", "ORGANIZATIONAL", "EDUCATIONAL"]),
  icon: z.string().min(1).max(100),
  image: z.string().max(500).optional().nullable(),
  sortOrder: z.number().int().min(0),
  isPublished: z.boolean(),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
