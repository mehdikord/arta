"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { saveTestimonialAction } from "@/lib/actions/admin/testimonials";
import {
  testimonialSchema,
  type TestimonialInput,
} from "@/lib/validations/admin/testimonial";
import type { Testimonial } from "@/lib/generated/prisma/client";

export function TestimonialForm({
  testimonial,
}: {
  testimonial?: Testimonial;
}) {
  const router = useRouter();
  const form = useForm<TestimonialInput>({
    resolver: standardSchemaResolver(testimonialSchema),
    defaultValues: testimonial
      ? {
          name: testimonial.name,
          role: testimonial.role,
          content: testimonial.content,
          rating: testimonial.rating,
          sortOrder: testimonial.sortOrder,
          isPublished: testimonial.isPublished,
        }
      : {
          name: "",
          role: "",
          content: "",
          rating: 5,
          sortOrder: 0,
          isPublished: true,
        },
  });

  async function onSubmit(values: TestimonialInput) {
    const result = await saveTestimonialAction(values, testimonial?.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(testimonial ? "نظر به‌روزرسانی شد" : "نظر ایجاد شد");
    router.push("/admins/testimonials");
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
                <FormLabel>نام</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>سمت</FormLabel>
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
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>متن نظر</FormLabel>
              <FormControl>
                <Textarea {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="rating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>امتیاز (۱–۵)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={field.value}
                    onChange={(e) =>
                      field.onChange(e.target.valueAsNumber || 1)
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
