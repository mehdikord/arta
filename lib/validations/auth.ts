import { z } from "zod";

const iranianMobileRegex = /^09\d{9}$/;

export const loginSchema = z.object({
  mobile: z
    .string()
    .regex(iranianMobileRegex, "شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد"),
  password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
    mobile: z
      .string()
      .regex(
        iranianMobileRegex,
        "شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد",
      ),
    password: z.string().min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمز عبور و تکرار آن یکسان نیستند",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
