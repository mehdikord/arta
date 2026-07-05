import { z } from "zod";

export const siteSettingsSchema = z.object({
  name: z.string().min(2).max(191),
  tagline: z.string().min(2).max(191),
  description: z.string().min(10),
  phone: z.string().min(5).max(50),
  email: z.string().email(),
  address: z.string().min(5),
  workingHours: z.string().min(5),
  instagram: z.string().url().or(z.literal("")),
  telegram: z.string().url().or(z.literal("")),
  linkedin: z.string().url().or(z.literal("")),
  whatsapp: z.string().url().or(z.literal("")),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
