"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
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
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/lib/validations/profile";
import { useAuth } from "@/hooks/use-auth";

export function ChangePasswordForm() {
  const { changePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const form = useForm<ChangePasswordInput>({
    resolver: standardSchemaResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function onSubmit(data: ChangePasswordInput) {
    setLoading(true);
    const success = changePassword(data.currentPassword, data.newPassword);
    setLoading(false);

    if (!success) {
      toast.error("رمز فعلی اشتباه است");
      return;
    }

    form.reset();
    toast.success("رمز عبور با موفقیت تغییر کرد");
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-gradient-to-bl from-card to-muted/20 shadow-sm">
      <div className="border-b bg-muted/30 px-6 py-5">
        <h2 className="font-semibold">تغییر رمز عبور</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          رمز عبور حساب خود را به‌روز کنید
        </p>
      </div>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رمز فعلی</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showCurrent ? "text" : "password"}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute end-0 top-0 h-full px-3"
                        onClick={() => setShowCurrent(!showCurrent)}
                        aria-label="نمایش رمز"
                      >
                        {showCurrent ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رمز جدید</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type={showNew ? "text" : "password"} {...field} />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute end-0 top-0 h-full px-3"
                        onClick={() => setShowNew(!showNew)}
                        aria-label="نمایش رمز جدید"
                      >
                        {showNew ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تکرار رمز جدید</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <KeyRound className="size-4" />
              )}
              تغییر رمز عبور
            </Button>
          </form>
        </Form>
      </CardContent>
    </div>
  );
}
