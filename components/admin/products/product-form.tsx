"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { toast } from "sonner";
import {
  CheckCircle2,
  FileArchive,
  Loader2,
  Plus,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/admin/blog/rich-text-editor";
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
import { saveProductAction } from "@/lib/actions/admin/products";
import { PRODUCT_FILE_TYPE_LABELS } from "@/lib/admin/format";
import { slugify } from "@/lib/admin/slug";
import {
  productSchema,
  type ProductInput,
} from "@/lib/validations/admin/product";
import type {
  Product,
  ProductCategory,
  ProductChapter,
} from "@/lib/generated/prisma/client";

type ProductWithRelations = Product & {
  category: ProductCategory;
  chapters: ProductChapter[];
};

type UploadResponse = {
  storageKey?: string;
  filename?: string;
  error?: string;
};

const ACCEPTED_PRODUCT_FILES =
  ".pdf,.mp4,.webm,.zip,.rar,.7z,application/pdf,video/mp4,video/webm,application/zip,application/x-7z-compressed";
const PRIVATE_FILE_KEY_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-[a-zA-Z0-9._-]{1,120}$/;
const FILE_CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  mp4: "video/mp4",
  webm: "video/webm",
  zip: "application/zip",
  rar: "application/vnd.rar",
  "7z": "application/x-7z-compressed",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} کیلوبایت`;
  return `${(bytes / 1024 / 1024).toFixed(1)} مگابایت`;
}

function getFileContentType(file: File): string {
  if (file.type) return file.type;
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return FILE_CONTENT_TYPES[extension] ?? "application/octet-stream";
}

export function ProductForm({
  product,
  categories,
}: {
  product?: ProductWithRelations;
  categories: ProductCategory[];
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    size?: number;
  } | null>(
    product && PRIVATE_FILE_KEY_PATTERN.test(product.fileUrl)
      ? { name: "فایل امن فعلی پکیج" }
      : null,
  );

  const form = useForm<ProductInput>({
    resolver: standardSchemaResolver(productSchema),
    defaultValues: product
      ? {
          title: product.title,
          slug: product.slug,
          shortDescription: product.shortDescription,
          fullDescription: product.fullDescription,
          categoryId: product.categoryId,
          image: product.image,
          fileType: product.fileType,
          fileUrl: product.fileUrl,
          price: product.price,
          discountPrice: product.discountPrice,
          isFeatured: product.isFeatured,
          isPublished: product.isPublished,
          chapters: product.chapters.map((chapter) => ({
            title: chapter.title,
            sortOrder: chapter.sortOrder,
          })),
        }
      : {
          title: "",
          slug: "",
          shortDescription: "",
          fullDescription: "",
          categoryId: categories[0]?.id ?? "",
          image: "",
          fileType: "PDF",
          fileUrl: "",
          price: null,
          discountPrice: null,
          isFeatured: false,
          isPublished: true,
          chapters: [{ title: "", sortOrder: 0 }],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "chapters",
  });

  function uploadProductFile(file: File) {
    setUploading(true);
    setUploadProgress(0);

    const request = new XMLHttpRequest();
    request.open("POST", "/api/admin/products/upload");
    request.setRequestHeader("Content-Type", getFileContentType(file));
    request.setRequestHeader("X-File-Name", encodeURIComponent(file.name));

    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        setUploadProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    request.addEventListener("load", () => {
      let response: UploadResponse = {};
      try {
        response = JSON.parse(request.responseText) as UploadResponse;
      } catch {
        response = {};
      }

      if (
        request.status < 200 ||
        request.status >= 300 ||
        !response.storageKey
      ) {
        toast.error(response.error ?? "آپلود فایل ناموفق بود");
        setUploading(false);
        setUploadProgress(0);
        return;
      }

      form.setValue("fileUrl", response.storageKey, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setUploadedFile({ name: response.filename ?? file.name, size: file.size });
      setUploadProgress(100);
      setUploading(false);
      toast.success("فایل اصلی با موفقیت و به‌صورت امن آپلود شد");
    });

    request.addEventListener("error", () => {
      setUploading(false);
      setUploadProgress(0);
      toast.error("ارتباط هنگام آپلود قطع شد؛ دوباره تلاش کنید");
    });

    request.addEventListener("abort", () => {
      setUploading(false);
      setUploadProgress(0);
      toast.error("آپلود فایل متوقف شد");
    });

    request.send(file);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) uploadProductFile(file);
    event.target.value = "";
  }

  async function onSubmit(values: ProductInput) {
    if (uploading) {
      toast.error("تا پایان آپلود فایل منتظر بمانید");
      return;
    }

    const result = await saveProductAction(values, product?.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(product ? "پکیج به‌روزرسانی شد" : "پکیج ایجاد شد");
    router.push("/admins/products");
    router.refresh();
  }

  const isBusy = uploading || form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <section className="space-y-6">
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
                      disabled={isBusy}
                      onChange={(event) => {
                        field.onChange(event);
                        if (!product) {
                          form.setValue("slug", slugify(event.target.value));
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
                    <Input {...field} dir="ltr" disabled={isBusy} />
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
                  <Textarea {...field} rows={3} disabled={isBusy} />
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
                <FormLabel>توضیحات کامل</FormLabel>
                <FormControl>
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isBusy}
                    placeholder="توضیحات کامل پکیج را با تیتر، تصویر، جدول، لینک و قالب‌بندی دلخواه بنویسید…"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="space-y-6 border-t pt-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>دسته‌بندی</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isBusy}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب دسته" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
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
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تصویر کاور</FormLabel>
                  <FormControl>
                    <MediaPickerInput
                      {...field}
                      onValueChange={field.onChange}
                      disabled={isBusy}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border bg-white p-4">
                  <FormLabel>پکیج ویژه</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isBusy}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border bg-white p-4">
                  <FormLabel>منتشر شده</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isBusy}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="space-y-4 border-t pt-8">
          <div className="flex items-center justify-between">
            <FormLabel>سرفصل‌ها</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isBusy}
              onClick={() => append({ title: "", sortOrder: fields.length })}
            >
              <Plus className="size-4" />
              افزودن سرفصل
            </Button>
          </div>
          {fields.map((chapter, index) => (
            <div key={chapter.id} className="flex gap-3">
              <FormField
                control={form.control}
                name={`chapters.${index}.title`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="عنوان سرفصل"
                        disabled={isBusy}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`chapters.${index}.sortOrder`}
                render={({ field }) => (
                  <FormItem className="w-24">
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value}
                        disabled={isBusy}
                        onChange={(event) =>
                          field.onChange(event.target.valueAsNumber || 0)
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
                disabled={fields.length <= 1 || isBusy}
                onClick={() => remove(index)}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
        </section>

        <section className="space-y-6 border-t pt-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="fileType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع فایل</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isBusy}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(PRODUCT_FILE_TYPE_LABELS).map(
                        ([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
              <div className="flex items-center gap-2 font-medium text-primary">
                <ShieldCheck className="size-5" />
                نگهداری خصوصی فایل
              </div>
              <p className="mt-2 leading-6 text-muted-foreground">
                فایل خارج از پوشه عمومی ذخیره می‌شود و فقط خریدار احراز هویت‌شده
                امکان دانلود دارد.
              </p>
            </div>
          </div>

          <FormField
            control={form.control}
            name="fileUrl"
            render={() => (
              <FormItem>
                <FormLabel>فایل اصلی پکیج</FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-muted/20 px-4 py-6 text-center transition-colors hover:border-primary/50 hover:bg-primary/5">
                      <input
                        type="file"
                        className="sr-only"
                        accept={ACCEPTED_PRODUCT_FILES}
                        disabled={isBusy}
                        onChange={handleFileChange}
                      />
                      {uploading ? (
                        <Loader2 className="mb-3 size-8 animate-spin text-primary" />
                      ) : (
                        <UploadCloud className="mb-3 size-8 text-primary" />
                      )}
                      <span className="font-medium">
                        {uploading
                          ? "فایل سنگین در حال آپلود است…"
                          : product
                            ? "برای جایگزینی فایل کلیک کنید"
                            : "فایل اصلی پکیج را انتخاب کنید"}
                      </span>
                      <span className="mt-1 text-xs text-muted-foreground">
                        PDF، MP4، WebM، ZIP، RAR یا 7Z
                      </span>
                    </label>

                    {uploading && (
                      <div
                        className="space-y-2 rounded-lg border bg-white p-4"
                        role="status"
                        aria-live="polite"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span>در حال انتقال فایل؛ صفحه را نبندید</span>
                          <span className="font-semibold text-primary">
                            {uploadProgress}٪
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-[width] duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {uploadedFile && !uploading && (
                      <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">
                        <CheckCircle2 className="size-5 shrink-0" />
                        <FileArchive className="size-5 shrink-0" />
                        <div className="min-w-0 text-sm">
                          <p className="truncate font-medium">
                            {uploadedFile.name}
                          </p>
                          <p className="text-xs opacity-80">
                            {uploadedFile.size
                              ? `${formatFileSize(uploadedFile.size)} — آماده ذخیره`
                              : "ذخیره‌شده در فضای خصوصی"}
                          </p>
                        </div>
                      </div>
                    )}
                    {product && !uploadedFile && !uploading && (
                      <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                        فایل قبلی از نوع لینک عمومی است. برای ایمن‌سازی این پکیج،
                        فایل اصلی را دوباره از همین بخش آپلود کنید.
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>قیمت (تومان)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ""}
                      disabled={isBusy}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value === ""
                            ? null
                            : event.target.valueAsNumber,
                        )
                      }
                      placeholder="خالی = رایگان"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="discountPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>قیمت با تخفیف (تومان)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      value={field.value ?? ""}
                      disabled={isBusy}
                      onChange={(event) =>
                        field.onChange(
                          event.target.value === ""
                            ? null
                            : event.target.valueAsNumber,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <div className="flex gap-3 border-t pt-6">
          <Button type="submit" disabled={isBusy}>
            {isBusy && <Loader2 className="size-4 animate-spin" />}
            {uploading
              ? `در حال آپلود ${uploadProgress}٪`
              : form.formState.isSubmitting
                ? "در حال ذخیره…"
                : "ذخیره پکیج"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isBusy}
            onClick={() => router.back()}
          >
            انصراف
          </Button>
        </div>
      </form>
    </Form>
  );
}
