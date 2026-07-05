import { z } from "zod";

export const siteStatSchema = z.object({
  label: z.string().min(2).max(100),
  value: z.string().min(1).max(50),
  sortOrder: z.number().int().min(0),
});

export type SiteStatInput = z.infer<typeof siteStatSchema>;
