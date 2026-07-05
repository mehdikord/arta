import { z } from "zod";

export const faqSchema = z.object({
  question: z.string().min(5).max(500),
  answer: z.string().min(10),
  category: z.string().min(2).max(100),
  sortOrder: z.number().int().min(0),
  isPublished: z.boolean(),
});

export type FaqInput = z.infer<typeof faqSchema>;
