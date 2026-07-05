import { z } from "zod";

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
    fileUrl: z.string().min(1).max(500),
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
