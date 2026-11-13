"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { toast } from "sonner";
import { HardDriveUpload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { saveSiteSettingsAction } from "@/lib/actions/admin/site-settings";
import {
  DEFAULT_PRODUCT_UPLOAD_MAX_SIZE_GB,
  MAX_PRODUCT_UPLOAD_MAX_SIZE_GB,
  MIN_PRODUCT_UPLOAD_MAX_SIZE_GB,
  siteSettingsSchema,
  type SiteSettingsInput,
} from "@/lib/validations/admin/site-settings";

/** Persian/Arabic digits and decimal separators → parseable Latin string. */
function normalizeNumber(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[٫,/]/g, ".")
    .replace(/[^\d.]/g, "");
}

export function SiteSettingsForm({
  settings,
}: {
  settings: SiteSettingsInput;
}) {
  const router = useRouter();
  const [uploadSizeText, setUploadSizeText] = useState(
    settings.productUploadMaxSizeGb == null ? "" : String(settings.productUploadMaxSizeGb),
  );
  const form = useForm<SiteSettingsInput>({
    resolver: standardSchemaResolver(siteSettingsSchema),
    defaultValues: settings,
  });

  async function onSubmit(values: SiteSettingsInput) {
    const result = await saveSiteSettingsAction(values);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("تنظیمات ذخیره شد");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نام سایت</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tagline"
            render={({ field }) => (
              <FormItem>
                <FormLabel>شعار</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>توضیحات</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تلفن</FormLabel>
                <FormControl>
                  <Input {...field} dir="ltr" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ایمیل</FormLabel>
                <FormControl>
                  <Input {...field} type="email" dir="ltr" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>آدرس</FormLabel>
              <FormControl>
                <Textarea {...field} rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="workingHours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ساعات کاری</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اینستاگرام</FormLabel>
                <FormControl>
                  <Input {...field} dir="ltr" placeholder="https://..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="telegram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تلگرام</FormLabel>
                <FormControl>
                  <Input {...field} dir="ltr" placeholder="https://..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="linkedin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>لینکدین</FormLabel>
                <FormControl>
                  <Input {...field} dir="ltr" placeholder="https://..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>واتساپ</FormLabel>
                <FormControl>
                  <Input {...field} dir="ltr" placeholder="https://..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <section className="space-y-4 rounded-xl border border-primary/15 bg-primary/[0.03] p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HardDriveUpload className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">آپلود فایل‌های پکیج</h2>
              <p className="text-xs leading-5 text-muted-foreground">
                محدودیت حجم هر فایل هنگام آپلود در بخش مدیریت پکیج‌ها
              </p>
            </div>
          </div>
          <FormField
            control={form.control}
            name="productUploadMaxSizeGb"
            render={({ field }) => (
              <FormItem className="max-w-sm">
                <FormLabel>حداکثر حجم مجاز آپلود</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      type="text"
                      inputMode="decimal"
                      dir="ltr"
                      className="pl-20"
                      placeholder={String(DEFAULT_PRODUCT_UPLOAD_MAX_SIZE_GB)}
                      value={uploadSizeText}
                      onChange={(event) => {
                        const text = normalizeNumber(event.target.value);
                        setUploadSizeText(text);
                        field.onChange(text === "" || text === "." ? null : Number(text));
                      }}
                    />
                  </FormControl>
                  <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-xs text-muted-foreground">
                    گیگابایت
                  </span>
                </div>
                <FormDescription className="text-xs leading-5">
                  عدد به گیگابایت (مثلاً ۲ یا ۰٫۵). اگر خالی بماند، پیش‌فرض{" "}
                  {DEFAULT_PRODUCT_UPLOAD_MAX_SIZE_GB.toLocaleString("fa-IR")} گیگابایت
                  اعمال می‌شود. بازهٔ مجاز:{" "}
                  {MIN_PRODUCT_UPLOAD_MAX_SIZE_GB.toLocaleString("fa-IR")} تا{" "}
                  {MAX_PRODUCT_UPLOAD_MAX_SIZE_GB.toLocaleString("fa-IR")} گیگابایت.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && (
            <Loader2 className="size-4 animate-spin" />
          )}
          ذخیره تنظیمات
        </Button>
      </form>
    </Form>
  );
}
