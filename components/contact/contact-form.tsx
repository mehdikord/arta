"use client";

import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  contactSchema,
  type ContactInput,
} from "@/lib/validations/contact";
import { submitContactFormAction } from "@/lib/actions/contact";

export function ContactForm() {
  const form = useForm<ContactInput>({
    resolver: standardSchemaResolver(contactSchema),
    defaultValues: {
      name: "",
      mobile: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(data: ContactInput) {
    const result = await submitContactFormAction(data);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("پیام شما با موفقیت ارسال شد", {
      description: "به زودی با شما تماس خواهیم گرفت.",
    });
    form.reset();
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>فرم تماس</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نام و نام خانوادگی</FormLabel>
                  <FormControl>
                    <Input placeholder="نام خود را وارد کنید" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="mobile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>شماره موبایل</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="09123456789"
                      dir="ltr"
                      className="text-end"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>موضوع</FormLabel>
                  <FormControl>
                    <Input placeholder="موضوع پیام" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    پیام{" "}
                    <span className="text-muted-foreground">(اختیاری)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="پیام خود را بنویسید..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              <Send className="size-4" />
              ارسال پیام
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
