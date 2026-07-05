import { z } from "zod";

export const blogPostSchema = z.object({
  title: z.string().min(2).max(191),
  slug: z.string().min(2).max(191),
  excerpt: z.string().min(10).max(500),
  content: z.string().min(50),
  image: z.string().min(1).max(500),
  author: z.string().min(2).max(100),
  readTime: z.number().int().min(1).max(120),
  publishedAt: z.string().min(1),
  categoryId: z.string().uuid(),
  isPublished: z.boolean(),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;
