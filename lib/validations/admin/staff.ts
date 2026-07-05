import { z } from "zod";

export const staffSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  mobile: z.string().regex(/^09\d{9}$/, "شماره موبایل معتبر نیست"),
  password: z.string().min(8).optional().or(z.literal("")),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR"]),
  isActive: z.boolean(),
});

export type StaffInput = z.infer<typeof staffSchema>;
