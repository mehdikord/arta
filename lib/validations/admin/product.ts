import { z } from "zod";

const PRIVATE_FILE_KEY_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-[a-zA-Z0-9._-]{1,120}$/;

export const productChapterSchema = z.object({
  title: z.string().min(1, "عنوان سرفصل الزامی است").max(255),
  sortOrder: z.number().int().min(0),
});

export const productSchema = z
  .object({
    title: z.string().min(2).max(191),
    slug: z.string().min(2).max(191),
    shortDescription: z.string().min(10).max(500),
    fullDescription: z.string().min(20),
    categoryId: z.string().uuid("دسته‌بندی الزامی است"),
    image: z.string().min(1).max(500),
    fileType: z.enum(["PDF", "VIDEO", "MIXED"]),
    fileUrl: z
      .string()
      .regex(PRIVATE_FILE_KEY_PATTERN, "فایل اصلی پکیج باید آپلود شود"),
    price: z.number().int().min(0).nullable(),
    discountPrice: z.number().int().min(0).nullable(),
    isFeatured: z.boolean(),
    isPublished: z.boolean(),
    chapters: z.array(productChapterSchema).min(1, "حداقل یک سرفصل لازم است"),
  })
  .refine(
    (data) => {
      if (data.price != null && data.discountPrice != null) {
        return data.discountPrice < data.price;
      }
      return true;
    },
    { message: "قیمت تخفیف باید کمتر از قیمت اصلی باشد", path: ["discountPrice"] },
  );

export type ProductInput = z.infer<typeof productSchema>;
export type ProductChapterInput = z.infer<typeof productChapterSchema>;
