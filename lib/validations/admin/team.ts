import { z } from "zod";

export const teamMemberSchema = z.object({
  name: z.string().min(2).max(100),
  role: z.string().min(2).max(150),
  bio: z.string().min(20),
  image: z.string().min(1).max(500),
  isManagement: z.boolean(),
  sortOrder: z.number().int().min(0),
  isPublished: z.boolean(),
});

export type TeamMemberInput = z.infer<typeof teamMemberSchema>;
