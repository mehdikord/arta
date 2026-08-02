"use client";

import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MediaPickerInput } from "@/components/admin/media/media-picker-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { savePortfolioItemAction } from "@/lib/actions/admin/portfolio";
import { slugify } from "@/lib/admin/slug";
import {
  portfolioSchema,
  type PortfolioInput,
} from "@/lib/validations/admin/portfolio";
import type {
  PortfolioCategory,
  PortfolioImage,
  PortfolioItem,
} from "@/lib/generated/prisma/client";

type PortfolioWithRelations = PortfolioItem & {
  category: PortfolioCategory;
  gallery: PortfolioImage[];
};

export function PortfolioForm({
  item,
  categories,
}: {
  item?: PortfolioWithRelations;
  categories: PortfolioCategory[];
}) {
  const router = useRouter();
  const form = useForm<PortfolioInput>({
    resolver: standardSchemaResolver(portfolioSchema),
    defaultValues: item
      ? {
          title: item.title,
          slug: item.slug,
          shortDescription: item.shortDescription,
          fullDescription: item.fullDescription,
          categoryId: item.categoryId,
          image: item.image,
          year: item.year,
          client: item.client,
          sortOrder: item.sortOrder,
          isPublished: item.isPublished,
          gallery: item.gallery.map((g) => ({
            url: g.url,
            sortOrder: g.sortOrder,
          })),
        }
      : {
          title: "",
          slug: "",
          shortDescription: "",
          fullDescription: "",
          categoryId: categories[0]?.id ?? "",
          image: "",
          year: null,
          client: null,
          sortOrder: 0,
          isPublished: true,
          gallery: [],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "gallery",
  });

  async function onSubmit(values: PortfolioInput) {
    const result = await savePortfolioItemAction(values, item?.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(item ? "نمونه‌کار به‌روزرسانی شد" : "نمونه‌کار ایجاد شد");
    router.push("/admins/portfolio");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>عنوان</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      if (!item) {
                        form.setValue("slug", slugify(e.target.value));
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input {...field} dir="ltr" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="shortDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>توضیح کوتاه</FormLabel>
              <FormControl>
                <Textarea {...field} rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fullDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>توضیح کامل</FormLabel>
              <FormControl>
                <Textarea {...field} rows={6} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>دسته‌بندی</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب دسته" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>سال</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? null : e.target.valueAsNumber,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sortOrder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ترتیب</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value}
                    onChange={(e) =>
                      field.onChange(e.target.valueAsNumber || 0)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="client"
            render={({ field }) => (
              <FormItem>
                <FormLabel>کارفرما</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(e.target.value || null)
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تصویر اصلی</FormLabel>
                <FormControl>
                  <MediaPickerInput
                    {...field}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>گالری تصاویر</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ url: "", sortOrder: fields.length })
              }
            >
              <Plus className="size-4" />
              افزودن تصویر
            </Button>
          </div>
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-3">
              <FormField
                control={form.control}
                name={`gallery.${index}.url`}
                render={({ field: f }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <MediaPickerInput
                        {...f}
                        onValueChange={f.onChange}
                        placeholder="انتخاب تصویر گالری"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`gallery.${index}.sortOrder`}
                render={({ field: f }) => (
                  <FormItem className="w-24">
                    <FormControl>
                      <Input
                        type="number"
                        value={f.value}
                        onChange={(e) =>
                          f.onChange(e.target.valueAsNumber || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <FormField
          control={form.control}
          name="isPublished"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border bg-white p-4">
              <FormLabel>منتشر شده</FormLabel>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && (
              <Loader2 className="size-4 animate-spin" />
            )}
            ذخیره
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            انصراف
          </Button>
        </div>
      </form>
    </Form>
  );
}
