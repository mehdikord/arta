"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
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
import { CardContent } from "@/components/ui/card";
import { settingsSchema, type SettingsInput } from "@/lib/validations/profile";
import { useAuth } from "@/hooks/use-auth";

export function SettingsForm() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const formValues = useMemo(
    () => ({ name: user?.name ?? "" }),
    [user?.name],
  );

  const form = useForm<SettingsInput>({
    resolver: standardSchemaResolver(settingsSchema),
    defaultValues: formValues,
    values: formValues,
  });

  function onSubmit(data: SettingsInput) {
    setLoading(true);
    updateProfile(data.name);
    setLoading(false);
    toast.success("اطلاعات با موفقیت ذخیره شد");
  }

  if (!user) return null;

  return (
    <div className="overflow-hidden rounded-2xl border bg-gradient-to-bl from-card to-muted/20 shadow-sm">
      <div className="border-b bg-muted/30 px-6 py-5">
        <h2 className="font-semibold">اطلاعات حساب</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          نام نمایشی خود را ویرایش کنید
        </p>
      </div>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نام و نام خانوادگی</FormLabel>
                  <FormControl>
                    <Input placeholder="نام شما" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>شماره موبایل</FormLabel>
              <Input
                value={user.mobile}
                disabled
                dir="ltr"
                className="text-end opacity-70"
              />
              <p className="text-xs text-muted-foreground">
                شماره موبایل قابل تغییر نیست
              </p>
            </FormItem>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              ذخیره تغییرات
            </Button>
          </form>
        </Form>
      </CardContent>
    </div>
  );
}
