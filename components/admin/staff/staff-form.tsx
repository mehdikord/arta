"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import { useAdminSession } from "@/components/admin/layout/admin-session-context";
import { saveStaffAction } from "@/lib/actions/admin/staff";
import { ADMIN_ROLES_LABELS } from "@/lib/admin/constants";
import { staffSchema, type StaffInput } from "@/lib/validations/admin/staff";
import type { AdminRole } from "@/lib/admin/constants";

type StaffMember = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: AdminRole;
  isActive: boolean;
};

export function StaffForm({ member }: { member?: StaffMember }) {
  const router = useRouter();
  const admin = useAdminSession();
  const form = useForm<StaffInput>({
    resolver: standardSchemaResolver(staffSchema),
    defaultValues: member
      ? {
          name: member.name,
          email: member.email,
          mobile: member.mobile,
          password: "",
          role: member.role,
          isActive: member.isActive,
        }
      : {
          name: "",
          email: "",
          mobile: "",
          password: "",
          role: "EDITOR",
          isActive: true,
        },
  });

  async function onSubmit(values: StaffInput) {
    const result = await saveStaffAction(
      values,
      member?.id,
      admin.adminId,
    );
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(member ? "مدیر به‌روزرسانی شد" : "مدیر ایجاد شد");
    router.push("/admins/staff");
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

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="mobile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>موبایل</FormLabel>
                <FormControl>
                  <Input {...field} dir="ltr" placeholder="09xxxxxxxxx" />
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
                <FormLabel>نقش</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(ADMIN_ROLES_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {member ? "رمز عبور جدید" : "رمز عبور"}
              </FormLabel>
              <FormControl>
                <Input {...field} type="password" dir="ltr" />
              </FormControl>
              {member && (
                <FormDescription>
                  برای تغییر ندادن، خالی بگذارید
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border bg-white p-4">
              <FormLabel>فعال</FormLabel>
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
