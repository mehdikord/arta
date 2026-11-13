"use client";

import { useFieldArray, type UseFormReturn } from "react-hook-form";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import type { ProductInput } from "@/lib/validations/admin/product";

export function ProductChaptersField({
  form,
  disabled,
}: {
  form: UseFormReturn<ProductInput>;
  disabled: boolean;
}) {
  const { fields, append, insert, remove, move } = useFieldArray({
    control: form.control,
    name: "chapters",
  });

  return (
    <div className="space-y-3">
      <ol className="space-y-2">
        {fields.map((chapter, index) => (
          <li key={chapter.id} className="flex items-start gap-2">
            <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
              {(index + 1).toLocaleString("fa-IR")}
            </span>
            <FormField
              control={form.control}
              name={`chapters.${index}.title`}
              render={({ field }) => (
                <FormItem className="min-w-0 flex-1 gap-1">
                  <FormControl>
                    <Input
                      {...field}
                      aria-label={`عنوان سرفصل ${index + 1}`}
                      placeholder="عنوان سرفصل"
                      disabled={disabled}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                          event.preventDefault();
                          insert(index + 1, { title: "", sortOrder: index + 1 });
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex shrink-0 items-center">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                title="انتقال به بالا"
                aria-label="انتقال به بالا"
                disabled={disabled || index === 0}
                onClick={() => move(index, index - 1)}
              >
                <ArrowUp className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                title="انتقال به پایین"
                aria-label="انتقال به پایین"
                disabled={disabled || index === fields.length - 1}
                onClick={() => move(index, index + 1)}
              >
                <ArrowDown className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                title="حذف سرفصل"
                aria-label="حذف سرفصل"
                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                disabled={disabled || fields.length <= 1}
                onClick={() => remove(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </li>
        ))}
      </ol>

      <Button
        type="button"
        variant="outline"
        className="w-full border-dashed"
        disabled={disabled}
        onClick={() => append({ title: "", sortOrder: fields.length })}
      >
        <Plus className="size-4" />
        افزودن سرفصل
      </Button>
      <p className="text-xs text-muted-foreground">
        با زدن Enter در هر سرفصل، سرفصل بعدی ساخته می‌شود.
      </p>
    </div>
  );
}
