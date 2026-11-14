# آکادمی توانمندسازی آرتا — فرانت Mock

پروژه فرانت‌اند Mock وب‌سایت آکادمی توانمندسازی آرتا با Next.js 16.

> **توجه:** این پروژه Mock است و Backend ندارد. داده‌ها از فایل‌های `lib/mock-data` و Zustand + localStorage تأمین می‌شوند.

## پیش‌نیازها

- Node.js 20.9+
- pnpm

## اجرا

```bash
pnpm install
pnpm dev
```

سایت روی [http://localhost:3000](http://localhost:3000) اجرا می‌شود.

## اسکریپت‌ها

| دستور | توضیح |
|-------|--------|
| `pnpm dev` | سرور توسعه |
| `pnpm build` | ساخت production |
| `pnpm start` | اجرای build |
| `pnpm lint` | بررسی ESLint |

## فایل خصوصی پکیج‌ها

هر پکیج (دوره) می‌تواند **چندین فایل** داشته باشد؛ نام نمایشی، نوع (متنی/ویدیو/صوتی —
هنگام آپلود خودکار تشخیص داده می‌شود) و ترتیب هر فایل جداگانه در پنل مدیریت
(`پکیج‌ها → ویرایش`) ثبت می‌شود. فایل اصلی پکیج خارج از پوشه `public` ذخیره می‌شود
و **هیچ لینک مستقیمی برای دانلود وجود ندارد**: فقط خریدار پکیج، با کلیک روی
دکمهٔ دانلود، یک لینک **امضاشدهٔ مخصوصِ کاربر** دریافت می‌کند که مدت محدود
(پیش‌فرض ۴ ساعت) معتبر است و پس از انقضای باطل می‌شود. در هر درخواست دانلود،
خرید کاربر دوباره بازبینی می‌شود (کاربر حذف‌شده یا استردادشده دسترسی خود را
از دست می‌دهد).

در محیط production مقدار `PRODUCT_FILE_STORAGE_DIR` را روی یک مسیر پایدار و غیرعمومی
با دسترسی خواندن/نوشتن برای پردازش برنامه تنظیم کنید. مقدار پیش‌فرض
`storage/product-files` است.

- حداکثر حجم هر فایل پکیج از **پنل مدیریت ← تنظیمات سایت** (به گیگابایت) تنظیم می‌شود؛ اگر خالی باشد ۱ گیگابایت است. در production حدِ حجم بدنه در رِورس‌پروکسی را هم متناسب با آن باز کنید (nginx: `client_max_body_size` · Apache: `LimitRequestBody`).
- `PRODUCT_FILE_LINK_TTL_HOURS` — مدت اعتبار لینک دانلود امضاشده (پیش‌فرض ۴ ساعت)
- `PRODUCT_FILE_LINK_SECRET` — راز امضای لینک‌ها (در نبود آن از راز session کاربر استفاده می‌شود)

## استقرار پشت رِورس‌پروکسی (Apache + PM2)

روت‌های آپلود پنل مدیریت (`/api/admin/products/upload` و `/api/admin/upload`) یک چک‌ساز
same-origin دارند که `Origin` مرورگر را با اورijin عمومی سایت مقایسه می‌کند. وقتی سایت
پشت Apache با PM2 اجرا می‌شود، Apache باید هاست و پروتکلِ عمومی را به برنامه فوروارد کند؛
وگرنه **همهٔ** آپلودها با 403 «درخواست ناماعتبر است» رد می‌شوند (نسخهٔ لوکال چون پروکسی
ندارد، کار می‌کند):

```apache
# داخل virtualhost Apache، پیش از ProxyPass
RequestHeader set X-Forwarded-Host  "%{HTTP_HOST}"
RequestHeader set X-Forwarded-Proto  expr=%{scheme}h
ProxyPass / http://127.0.0.1:3000/
ProxyPassReverse / http://127.0.0.1:3000/
```

اگر نمی‌خواهید Apache را دست بزنید، روی سرور متغیر `APP_PUBLIC_ORIGIN` را با اورijin
عمومی (مثلاً `https://arta.example.com`) ست کنید؛ چک‌ساز از آن به‌عنوان اورijin معتبر
استفاده می‌کند (و دیگر به هدرهای فوروارد اتکا ندارد).

فایل‌های پکیج در هر دو حالت از دسترسیِ مستقیمِ لینک محروم می‌مانند: خارج از `public/`
ذخیره می‌شوند و تنها از مسیر لینکِ دانلودِ امضاشدهٔ بسته‌به-کاربر و با مدت محدود
دسترسی‌پذیرند.

## کاربر دمو

- موبایل: `09123456789`
- رمز: `12345678`
- پکیج‌های اولیه: `prd-1`, `prd-3`
- نوبت‌های اولیه: `apt-1`, `apt-2`, `apt-12`

## صفحات

| مسیر | توضیح |
|------|--------|
| `/` | صفحه اصلی |
| `/about`, `/contact`, `/services`, `/faq` | صفحات عمومی |
| `/portfolio`, `/portfolio/[slug]` | نمونه‌کارها |
| `/products`, `/products/[slug]` | پکیج‌های آموزشی |
| `/blog`, `/blog/[slug]` | وبلاگ |
| `/auth/login`, `/auth/register` | احراز هویت |
| `/appointment` | رزرو نوبت (محافظت‌شده) |
| `/profile/settings` | تنظیمات پروفایل |
| `/profile/purchases` | پکیج‌های خریداری‌شده |
| `/profile/appointments` | نوبت‌های من |

## ساختار

```
app/           # Route groups: (public), (auth), (protected)
components/    # ui, layout, shared, home, blog, profile, appointment
lib/           # mock-data, stores, validations, data, date, blog
types/         # TypeScript interfaces
hooks/         # use-auth و ...
public/        # تصاویر SVG placeholder
```

## محدودیت‌های Mock

- احراز هویت با Zustand + localStorage (بدون JWT/API)
- ثبت‌نام‌های جدید در `arta-registered-users` ذخیره می‌شوند
- خرید و رزرو نوبت شبیه‌سازی‌شده است
- نقاط `// TODO: replace with API` برای اتصال Backend

## مستندات

- [فازبندی پیاده‌سازی](../docs/front-tasks/README.md)
- [PRD پروژه](../docs/project-prd.md)
