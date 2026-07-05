import { z } from "zod";

const iranianMobileRegex = /^09\d{9}$/;

export const contactSchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد"),
  mobile: z
    .string()
    .regex(iranianMobileRegex, "شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد"),
  subject: z.string().min(3, "موضوع باید حداقل ۳ کاراکتر باشد"),
  message: z
    .string()
    .refine((val) => val.length === 0 || val.length >= 10, {
      message: "پیام باید حداقل ۱۰ کاراکتر باشد",
    }),
});

export type ContactInput = z.infer<typeof contactSchema>;
