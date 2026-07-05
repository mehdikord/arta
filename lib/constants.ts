import type { TimeSlot } from "@/types";

export const TIME_SLOTS: TimeSlot[] = [
  "08:00-09:00",
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "13:00-14:00",
];

export const SITE_CONFIG = {
  name: "آکادمی توانمندسازی آرتا",
  shortName: "آرتا",
  tagline: "مسیر رشد، از آگاهی تا توانمندی",
  description:
    "آکادمی توانمندسازی آرتا با ارائه خدمات مشاوره، کوچینگ و آموزش، همراه شما در مسیر رشد فردی و سازمانی است.",
  phone: "۰۲۱-۸۸۷۷۶۶۵۵",
  email: "info@arta-academy.ir",
  address: "تهران، خیابان ولیعصر، بالاتر از پارک ساعی، پلاک ۱۲۳۴، واحد ۵",
  workingHours: "شنبه تا چهارشنبه، ۸:۰۰ تا ۱۴:۰۰",
  social: {
    instagram: "https://instagram.com/arta_academy",
    telegram: "https://t.me/arta_academy",
    linkedin: "https://linkedin.com/company/arta-academy",
    whatsapp: "https://wa.me/989123456789",
  },
} as const;

export const NAV_ITEMS = [
  { label: "خانه", href: "/" },
  { label: "درباره ما", href: "/about" },
  { label: "خدمات", href: "/services" },
  { label: "نمونه‌کارها", href: "/portfolio" },
  { label: "پکیج‌ها", href: "/products" },
  { label: "وبلاگ", href: "/blog" },
  { label: "رزرو نوبت", href: "/appointment" },
  { label: "تماس", href: "/contact" },
] as const;

export const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  individual: "فردی",
  couple: "زوجی و خانواده",
  organizational: "سازمانی",
  educational: "آموزشی",
};
