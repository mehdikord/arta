"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { saveSiteStatAction } from "@/lib/actions/admin/site-stats";
import {
  siteStatSchema,
  type SiteStatInput,
} from "@/lib/validations/admin/site-stat";
import type { SiteStat } from "@/lib/generated/prisma/client";

export function SiteStatForm({ stat }: { stat?: SiteStat }) {
  const router = useRouter();
  const form = useForm<SiteStatInput>({
    resolver: standardSchemaResolver(siteStatSchema),
    defaultValues: stat
      ? {
          label: stat.label,
          value: stat.value,
          sortOrder: stat.sortOrder,
        }
      : {
          label: "",
          value: "",
          sortOrder: 0,
        },
  });

  async function onSubmit(values: SiteStatInput) {
    const result = await saveSiteStatAction(values, stat?.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(stat ? "آمار به‌روزرسانی شد" : "آمار ایجاد شد");
    router.push("/admins/site-stats");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>برچسب</FormLabel>
              <FormControl>
                <Input {...field} placeholder="مثلاً: مشتری راضی" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>مقدار</FormLabel>
              <FormControl>
                <Input {...field} placeholder="مثلاً: ۵۰۰+" />
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
