import { z } from "zod";

export const testimonialSchema = z.object({
  name: z.string().min(2).max(100),
  role: z.string().min(2).max(150),
  content: z.string().min(20),
  rating: z.number().int().min(1).max(5),
  sortOrder: z.number().int().min(0),
  isPublished: z.boolean(),
});

export type TestimonialInput = z.infer<typeof testimonialSchema>;
