"use client";

import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
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
import { slugify } from "@/lib/admin/slug";
import {
  portfolioCategorySchema,
  type PortfolioCategoryInput,
} from "@/lib/validations/admin/portfolio-category";
import type { PortfolioCategory } from "@/lib/generated/prisma/client";

interface PortfolioCategoryFormProps {
  category?: PortfolioCategory;
  onSubmit: (values: PortfolioCategoryInput) => Promise<void>;
  onCancel: () => void;
}

export function PortfolioCategoryForm({
  category,
  onSubmit,
  onCancel,
}: PortfolioCategoryFormProps) {
  const form = useForm<PortfolioCategoryInput>({
    resolver: standardSchemaResolver(portfolioCategorySchema),
    defaultValues: category
      ? { name: category.name, slug: category.slug }
      : { name: "", slug: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نام</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    if (!category) {
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
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            انصراف
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting && (
              <Loader2 className="size-4 animate-spin" />
            )}
            ذخیره
          </Button>
        </div>
      </form>
    </Form>
  );
}
