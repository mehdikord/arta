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
import { RichTextEditor } from "@/components/admin/blog/rich-text-editor";
import { MediaPickerInput } from "@/components/admin/media/media-picker-input";
import {
  Form,
  FormControl,
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
import { saveBlogPostAction } from "@/lib/actions/admin/blog";
import { slugify } from "@/lib/admin/slug";
import {
  blogPostSchema,
  type BlogPostInput,
} from "@/lib/validations/admin/blog";
import type { BlogCategory, BlogPost } from "@/lib/generated/prisma/client";

type BlogPostWithCategory = BlogPost & { category: BlogCategory };

export function BlogForm({
  post,
  categories,
}: {
  post?: BlogPostWithCategory;
  categories: BlogCategory[];
}) {
  const router = useRouter();
  const form = useForm<BlogPostInput>({
    resolver: standardSchemaResolver(blogPostSchema),
    defaultValues: post
      ? {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          image: post.image,
          author: post.author,
          readTime: post.readTime,
          publishedAt: post.publishedAt.toISOString().slice(0, 10),
          categoryId: post.categoryId,
          isPublished: post.isPublished,
        }
      : {
          title: "",
          slug: "",
          excerpt: "",
          content: "",
          image: "",
          author: "",
          readTime: 5,
          publishedAt: new Date().toISOString().slice(0, 10),
          categoryId: categories[0]?.id ?? "",
          isPublished: true,
        },
  });

  async function onSubmit(values: BlogPostInput) {
    const result = await saveBlogPostAction(values, post?.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(post ? "مقاله به‌روزرسانی شد" : "مقاله ایجاد شد");
    router.push("/admins/blog");
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>عنوان</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      if (!post) {
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
        </div>

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>خلاصه</FormLabel>
              <FormControl>
                <Textarea {...field} rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>محتوا</FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  disabled={form.formState.isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>دسته‌بندی</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب دسته" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نویسنده</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="readTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>زمان مطالعه (دقیقه)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
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
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تصویر شاخص</FormLabel>
                <FormControl>
                  <MediaPickerInput
                    {...field}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="publishedAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تاریخ انتشار</FormLabel>
                <FormControl>
                  <Input {...field} type="date" dir="ltr" />
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
