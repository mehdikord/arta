import { z } from "zod";

export const adminLoginSchema = z.object({
  mobile: z
    .string()
    .trim()
    .regex(/^09\d{9}$/, "شماره موبایل باید به فرمت 09xxxxxxxxx باشد"),
  password: z.string().min(8, "گذرواژه باید حداقل ۸ کاراکتر باشد"),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
