"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  ImageIcon,
  Loader2,
  Save,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/admin/blog/rich-text-editor";
import { MediaPickerInput } from "@/components/admin/media/media-picker-input";
import { ConfirmDialog } from "@/components/admin/shared/confirm-dialog";
import { ProductChaptersField } from "@/components/admin/products/product-chapters-field";
import { ProductFilesField } from "@/components/admin/products/product-files-field";
import {
  Form,
  FormControl,
  FormDescription,
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
import { slugify } from "@/lib/admin/slug";
import { productSchema, type ProductInput } from "@/lib/validations/admin/product";
import { cn } from "@/lib/utils";
import type {
  Product,
  ProductCategory,
  ProductChapter,
  ProductFile,
} from "@/lib/generated/prisma/client";

type ProductWithRelations = Product & {
  category: ProductCategory;
  chapters: ProductChapter[];
  files: ProductFile[];
};

const SHORT_DESCRIPTION_MAX = 500;

function Section({
  title,
  description,
  icon,
  children,
  className,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-xl border bg-white shadow-xs", className)}>
      <header className="flex items-start gap-3 border-b px-4 py-3.5 sm:px-5">
        {icon && (
          <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary [&_svg]:size-4">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-sm font-semibold leading-6">{title}</h2>
          {description && (
            <p className="text-xs leading-5 text-muted-foreground">{description}</p>
          )}
        </div>
      </header>
      <div className="space-y-5 p-4 sm:p-5">{children}</div>
    </section>
  );
}

function toman(value: number) {
  return `${value.toLocaleString("fa-IR")} تومان`;
}

export function ProductForm({
  product,
  categories,
  maxUploadSize,
}: {
  product?: ProductWithRelations;
  categories: ProductCategory[];
  maxUploadSize: number;
}) {
  const router = useRouter();
  const freshKeysRef = useRef(new Set<string>());
  const slugTouched = useRef(Boolean(product));
  const [uploading, setUploading] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

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
          price: product.price,
          discountPrice: product.discountPrice,
          isFeatured: product.isFeatured,
          isPublished: product.isPublished,
          chapters: product.chapters.map((chapter) => ({
            title: chapter.title,
            sortOrder: chapter.sortOrder,
          })),
          files: product.files.map((file) => ({
            clientId: file.id,
            displayName: file.displayName,
            storageKey: file.storageKey,
            kind: file.kind,
            sortOrder: file.sortOrder,
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
          price: null,
          discountPrice: null,
          isFeatured: false,
          isPublished: true,
          chapters: [{ title: "", sortOrder: 0 }],
          files: [],
        },
  });

  const [slug, image, price, discountPrice, shortDescription, isPublished] = useWatch({
    control: form.control,
    name: ["slug", "image", "price", "discountPrice", "shortDescription", "isPublished"],
  });

  const { isDirty, isSubmitting } = form.formState;
  const isBusy = uploading || isSubmitting;
  const hasUnsaved = isDirty;

  const handleBusyChange = useCallback((busy: boolean) => setUploading(busy), []);

  // Warn before closing the tab with unsaved changes or running uploads.
  useEffect(() => {
    if (!hasUnsaved && !uploading) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsaved, uploading]);

  async function onSubmit(values: ProductInput) {
    if (uploading) {
      toast.error("تا پایان آپلود فایل‌ها منتظر بمانید");
      return;
    }

    const payload: ProductInput = {
      ...values,
      slug: values.slug.trim(),
      chapters: values.chapters.map((chapter, index) => ({
        title: chapter.title.trim(),
        sortOrder: index,
      })),
      files: values.files.map((file, index) => ({
        displayName: file.displayName.trim(),
        storageKey: file.storageKey,
        kind: file.kind,
        sortOrder: index,
      })),
    };

    const result = await saveProductAction(payload, product?.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    freshKeysRef.current.clear();
    form.reset(values);
    toast.success(product ? "پکیج به‌روزرسانی شد" : "پکیج ایجاد شد");
    router.push("/admins/products");
    router.refresh();
  }

  function onInvalid() {
    toast.error("برخی فیلدها نیاز به اصلاح دارند");
  }

  function discardAndLeave() {
    for (const key of freshKeysRef.current) {
      void fetch(`/api/admin/products/upload?key=${encodeURIComponent(key)}`, {
        method: "DELETE",
        keepalive: true,
      }).catch(() => undefined);
    }
    freshKeysRef.current.clear();
    setLeaveOpen(false);
    router.push("/admins/products");
  }

  function handleCancel() {
    if (hasUnsaved || uploading) setLeaveOpen(true);
    else router.push("/admins/products");
  }

  const discountPercent =
    price && discountPrice != null && discountPrice < price
      ? Math.round(((price - discountPrice) / price) * 100)
      : null;
  const shortLength = shortDescription?.length ?? 0;

  return (
    <Form {...form}>
      <form
        onSubmit={(event) => form.handleSubmit(onSubmit, onInvalid)(event)}
        className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
        noValidate
      >
        {/* ---------- Main column ---------- */}
        <div className="min-w-0 space-y-6">
          <Section title="اطلاعات پایه" description="عنوان و معرفی کوتاه پکیج">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان پکیج</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="مثلاً: دورهٔ جامع مهارت‌های ارتباطی"
                      disabled={isBusy}
                      onChange={(event) => {
                        field.onChange(event);
                        if (!slugTouched.current) {
                          form.setValue("slug", slugify(event.target.value), {
                            shouldValidate: form.formState.isSubmitted,
                          });
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
                  <FormLabel>نامک (Slug)</FormLabel>
                  <div
                    dir="ltr"
                    className="flex h-9 items-center overflow-hidden rounded-md border bg-transparent shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-aria-invalid:border-destructive"
                  >
                    <span className="flex h-full shrink-0 items-center border-e bg-muted/50 px-3 text-xs text-muted-foreground">
                      /products/
                    </span>
                    <FormControl>
                      <input
                        {...field}
                        disabled={isBusy}
                        className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm outline-none disabled:opacity-50"
                        onChange={(event) => {
                          slugTouched.current = true;
                          field.onChange(event);
                        }}
                        onBlur={(event) => {
                          field.onBlur();
                          const normalized = slugify(event.target.value);
                          if (normalized && normalized !== event.target.value) {
                            form.setValue("slug", normalized, { shouldDirty: true });
                          }
                        }}
                      />
                    </FormControl>
                  </div>
                  <FormDescription>آدرس صفحهٔ پکیج در سایت؛ از عنوان ساخته می‌شود.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>توضیح کوتاه</FormLabel>
                    <span
                      className={cn(
                        "text-xs tabular-nums text-muted-foreground",
                        shortLength > SHORT_DESCRIPTION_MAX && "text-destructive",
                      )}
                    >
                      {shortLength.toLocaleString("fa-IR")} / {SHORT_DESCRIPTION_MAX.toLocaleString("fa-IR")}
                    </span>
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      className="resize-y"
                      placeholder="خلاصه‌ای که در کارت پکیج و نتایج جستجو نمایش داده می‌شود"
                      disabled={isBusy}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Section>

          <Section title="توضیحات کامل" description="معرفی کامل پکیج با تیتر، تصویر، جدول و لینک">
            <FormField
              control={form.control}
              name="fullDescription"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RichTextEditor
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isBusy}
                      placeholder="توضیحات کامل پکیج را بنویسید…"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Section>

          <Section title="سرفصل‌ها" description="فهرست مطالبی که در این پکیج آموزش داده می‌شود">
            <ProductChaptersField form={form} disabled={isBusy} />
          </Section>

          <Section
            title="فایل‌های پکیج"
            description="سند، PDF، ویدیو، صوت و فایل فشرده — نوع هر فایل خودکار تشخیص داده می‌شود"
          >
            <div className="flex items-start gap-2.5 rounded-lg bg-emerald-50 px-3 py-2.5 text-xs leading-6 text-emerald-900">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <p>
                فایل‌ها در فضای خصوصی سرور ذخیره می‌شوند و لینک مستقیم ندارند؛ فقط
                خریدار با لینک اختصاصی و زمان‌دار می‌تواند آن‌ها را دانلود کند.
              </p>
            </div>
            <ProductFilesField
              form={form}
              disabled={isSubmitting}
              maxUploadSize={maxUploadSize}
              freshKeysRef={freshKeysRef}
              onBusyChange={handleBusyChange}
            />
          </Section>
        </div>

        {/* ---------- Sidebar ---------- */}
        <aside className="min-w-0 space-y-6">
          <Section title="انتشار" icon={<Eye />}>
            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <FormLabel>نمایش در سایت</FormLabel>
                    <FormDescription className="text-xs">
                      {field.value ? "پکیج برای کاربران قابل مشاهده است" : "پیش‌نویس؛ فقط در پنل دیده می‌شود"}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isBusy} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between gap-3 border-t pt-5">
                  <div className="space-y-0.5">
                    <FormLabel className="flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-amber-500" />
                      پکیج ویژه
                    </FormLabel>
                    <FormDescription className="text-xs">در صفحهٔ اصلی برجسته می‌شود</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} disabled={isBusy} />
                  </FormControl>
                </FormItem>
              )}
            />
          </Section>

          <Section title="دسته‌بندی و کاور" icon={<ImageIcon />}>
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>دسته‌بندی</FormLabel>
                  {categories.length === 0 ? (
                    <p className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                      هنوز دسته‌ای ساخته نشده.{" "}
                      <Link href="/admins/products/categories" className="font-medium text-primary underline-offset-4 hover:underline">
                        ساخت دسته‌بندی
                      </Link>
                    </p>
                  ) : (
                    <Select onValueChange={field.onChange} value={field.value} disabled={isBusy}>
                      <FormControl>
                        <SelectTrigger className="w-full">
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
                  )}
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
                  <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted/40">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt="پیش‌نمایش کاور" className="size-full object-cover" />
                    ) : (
                      <div className="flex size-full flex-col items-center justify-center gap-1 text-muted-foreground">
                        <ImageIcon className="size-6" />
                        <span className="text-xs">تصویری انتخاب نشده</span>
                      </div>
                    )}
                  </div>
                  <FormControl>
                    <MediaPickerInput {...field} onValueChange={field.onChange} disabled={isBusy} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Section>

          <Section title="قیمت‌گذاری">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>قیمت اصلی</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        dir="ltr"
                        className="pl-14"
                        value={field.value ?? ""}
                        disabled={isBusy}
                        placeholder="0"
                        onChange={(event) => {
                          const next = event.target.value === "" ? null : event.target.valueAsNumber;
                          field.onChange(next);
                          if (!next && form.getValues("discountPrice") != null) {
                            form.setValue("discountPrice", null, { shouldDirty: true });
                          }
                        }}
                      />
                      <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-xs text-muted-foreground">
                        تومان
                      </span>
                    </div>
                  </FormControl>
                  <FormDescription className="text-xs">خالی بگذارید تا پکیج رایگان باشد.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="discountPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>قیمت با تخفیف</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        dir="ltr"
                        className="pl-14"
                        value={field.value ?? ""}
                        disabled={isBusy || !price}
                        placeholder="اختیاری"
                        onChange={(event) =>
                          field.onChange(event.target.value === "" ? null : event.target.valueAsNumber)
                        }
                      />
                      <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-xs text-muted-foreground">
                        تومان
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <p className="mb-1 text-xs text-muted-foreground">قیمت نهایی برای کاربر</p>
              {!price ? (
                <p className="font-semibold text-emerald-700">رایگان</p>
              ) : discountPercent !== null ? (
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-semibold">{toman(discountPrice!)}</span>
                  <span className="text-xs text-muted-foreground line-through">{toman(price)}</span>
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                    {discountPercent.toLocaleString("fa-IR")}٪ تخفیف
                  </span>
                </div>
              ) : (
                <p className="font-semibold">{toman(price)}</p>
              )}
            </div>
          </Section>
        </aside>

        {/* ---------- Sticky action bar ---------- */}
        <div className="sticky bottom-0 z-20 -mb-4 pb-4 md:-mb-6 md:pb-6 lg:col-span-2 lg:-mb-8 lg:pb-8">
          <div className="flex flex-col gap-3 rounded-xl border bg-white/95 px-4 py-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-white/80 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              {uploading ? (
                <>
                  <Loader2 className="size-4 animate-spin text-primary" />
                  در حال آپلود فایل‌ها…
                </>
              ) : Object.keys(form.formState.errors).length > 0 && form.formState.isSubmitted ? (
                <>
                  <AlertCircle className="size-4 text-destructive" />
                  <span className="text-destructive">برخی فیلدها نیاز به اصلاح دارند</span>
                </>
              ) : hasUnsaved ? (
                <>
                  <span className="size-2 rounded-full bg-amber-500" />
                  تغییرات ذخیره نشده‌اند
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  {product ? "همه تغییرات ذخیره شده است" : "اطلاعات پکیج را وارد کنید"}
                </>
              )}
              {slug && isPublished && product && !hasUnsaved && (
                <Link
                  href={`/products/${slug}`}
                  target="_blank"
                  className="hidden text-xs text-primary underline-offset-4 hover:underline sm:inline"
                >
                  مشاهده در سایت
                </Link>
              )}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 sm:flex-none"
                disabled={isSubmitting}
                onClick={handleCancel}
              >
                انصراف
              </Button>
              <Button type="submit" className="flex-1 sm:min-w-36 sm:flex-none" disabled={isBusy}>
                {isBusy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {uploading ? "در حال آپلود…" : isSubmitting ? "در حال ذخیره…" : product ? "ذخیره تغییرات" : "ایجاد پکیج"}
              </Button>
            </div>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        title="خروج بدون ذخیره؟"
        description={
          uploading
            ? "آپلود برخی فایل‌ها هنوز تمام نشده است. با خروج، آپلودها لغو و تغییرات ذخیره‌نشده از بین می‌روند."
            : "تغییرات ذخیره‌نشده و فایل‌های تازه آپلودشده حذف خواهند شد."
        }
        confirmLabel="خروج"
        cancelLabel="ادامهٔ ویرایش"
        variant="destructive"
        onConfirm={discardAndLeave}
      />
    </Form>
  );
}
