"use client";

import { useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { loginAdminAction } from "@/lib/actions/admin/auth";
import {
  adminLoginSchema,
  type AdminLoginInput,
} from "@/lib/validations/admin/auth";
import { cn } from "@/lib/utils";

/** Persian/Arabic digits → Latin, drop everything that isn't a digit. */
function normalizeMobile(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/\D/g, "")
    .slice(0, 11);
}

const inputClass =
  "h-12 w-full rounded-xl border border-input bg-slate-50/60 pr-11 pl-4 text-[15px] tracking-wide text-foreground outline-none transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground/60 hover:border-slate-300 focus:border-[#2d6a6a] focus:bg-white focus:ring-4 focus:ring-[#2d6a6a]/12 disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-destructive/15";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState(0);
  const [success, setSuccess] = useState(false);

  const form = useForm<AdminLoginInput>({
    resolver: standardSchemaResolver(adminLoginSchema),
    defaultValues: { mobile: "", password: "" },
  });
  const loading = form.formState.isSubmitting || success;

  function trackCapsLock(event: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(event.getModifierState?.("CapsLock") ?? false);
  }

  async function onSubmit(values: AdminLoginInput) {
    setServerError(null);
    try {
      const result = await loginAdminAction(values);
      if (!result.success) {
        setServerError(result.error);
        setErrorKey((k) => k + 1);
        form.setValue("password", "");
        form.setFocus("password");
        return;
      }
      setSuccess(true);
      toast.success("ورود موفق؛ در حال انتقال به داشبورد");
      router.push(result.data.redirect);
      router.refresh();
    } catch {
      setServerError("ارتباط با سرور برقرار نشد؛ دوباره تلاش کنید");
      setErrorKey((k) => k + 1);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, () => setErrorKey((k) => k + 1))}
        className="space-y-5"
        noValidate
      >
        {serverError && (
          <div
            key={errorKey}
            role="alert"
            className="admin-login-shake flex items-start gap-2.5 rounded-xl border border-destructive/20 bg-destructive/5 px-3.5 py-3 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <FormField
          control={form.control}
          name="mobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-semibold">شماره موبایل</FormLabel>
              <div className="relative">
                <Smartphone className="pointer-events-none absolute inset-y-0 right-4 my-auto size-[18px] text-muted-foreground" />
                <FormControl>
                  <input
                    {...field}
                    type="tel"
                    inputMode="numeric"
                    dir="ltr"
                    placeholder="09xx xxx xxxx"
                    autoComplete="username"
                    autoFocus
                    disabled={loading}
                    className={cn(inputClass, "text-right placeholder:text-right")}
                    onChange={(event) => {
                      field.onChange(normalizeMobile(event.target.value));
                      if (serverError) setServerError(null);
                    }}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] font-semibold">گذرواژه</FormLabel>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute inset-y-0 right-4 my-auto size-[18px] text-muted-foreground" />
                <FormControl>
                  <input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    dir="ltr"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={loading}
                    className={cn(inputClass, "pl-12 text-right placeholder:text-right")}
                    onKeyDown={trackCapsLock}
                    onKeyUp={trackCapsLock}
                    onBlur={() => {
                      field.onBlur();
                      setCapsLock(false);
                    }}
                    onChange={(event) => {
                      field.onChange(event);
                      if (serverError) setServerError(null);
                    }}
                  />
                </FormControl>
                <button
                  type="button"
                  aria-label={showPassword ? "پنهان کردن گذرواژه" : "نمایش گذرواژه"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 left-1.5 my-auto flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d6a6a]/40"
                >
                  {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                </button>
              </div>
              {capsLock && (
                <p className="flex items-center gap-1.5 text-xs text-amber-600">
                  <AlertCircle className="size-3.5" />
                  Caps Lock روشن است
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "admin-login-sheen group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl text-[15px] font-bold text-white shadow-lg shadow-[#2d6a6a]/30 transition-[transform,box-shadow,filter] duration-200",
            "bg-gradient-to-l from-[#2d6a6a] via-[#357a7a] to-[#6f63a8]",
            "hover:shadow-xl hover:shadow-[#2d6a6a]/40 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2d6a6a]/30",
            "disabled:cursor-not-allowed disabled:opacity-80",
            success && "from-emerald-600 via-emerald-600 to-emerald-500",
          )}
        >
          {success ? (
            <>
              <CheckCircle2 className="size-5" />
              ورود موفق
            </>
          ) : loading ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              در حال بررسی…
            </>
          ) : (
            <>
              ورود به پنل
              <ArrowLeft className="size-5 transition-transform duration-200 group-hover:-translate-x-1" />
            </>
          )}
        </button>

        <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          <Link
            href="/"
            className="inline-flex items-center gap-1 rounded-md px-1 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2d6a6a]/30"
          >
            <ArrowRight className="size-3.5" />
            بازگشت به سایت
          </Link>
          <span className="h-px flex-1 bg-border" />
        </div>
      </form>
    </Form>
  );
}
