export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}

export interface RecentActivity {
  id: string;
  type: "purchase" | "appointment" | "contact" | "register";
  title: string;
  description: string;
  time: string;
}

export const mockDashboardStats: DashboardStat[] = [
  {
    id: "users",
    label: "کاربران ثبت‌نام‌شده",
    value: "۱۲۸",
    change: "+۱۲٪",
    trend: "up",
  },
  {
    id: "appointments",
    label: "نوبت‌های فعال",
    value: "۲۴",
    change: "+۵٪",
    trend: "up",
  },
  {
    id: "purchases",
    label: "خریدهای این ماه",
    value: "۴۵",
    change: "+۱۸٪",
    trend: "up",
  },
  {
    id: "contacts",
    label: "پیام‌های جدید",
    value: "۷",
    change: "۳ مورد",
    trend: "neutral",
  },
];

export const mockRecentActivity: RecentActivity[] = [
  {
    id: "1",
    type: "purchase",
    title: "خرید پکیج",
    description: "رضا موسوی — مهارت‌های ارتباط مؤثر",
    time: "۲ ساعت پیش",
  },
  {
    id: "2",
    type: "appointment",
    title: "رزرو نوبت",
    description: "فاطمه حسینی — ۱۴۰۵/۰۴/۱۵، ۱۰:۰۰–۱۱:۰۰",
    time: "۳ ساعت پیش",
  },
  {
    id: "3",
    type: "contact",
    title: "پیام تماس",
    description: "امیر کریمی — درخواست مشاوره سازمانی",
    time: "۵ ساعت پیش",
  },
  {
    id: "4",
    type: "register",
    title: "ثبت‌نام کاربر",
    description: "زهرا مرادی — ۰۹۱۲۳۴۵۶۷۸۹",
    time: "۶ ساعت پیش",
  },
  {
    id: "5",
    type: "purchase",
    title: "دریافت پکیج رایگان",
    description: "پویا نادری — راهنمای مدیریت استرس",
    time: "۸ ساعت پیش",
  },
  {
    id: "6",
    type: "appointment",
    title: "لغو نوبت",
    description: "کاربر آزمایشی — ۱۴۰۵/۰۴/۱۲",
    time: "۱ روز پیش",
  },
  {
    id: "7",
    type: "contact",
    title: "پیام تماس",
    description: "مینا اکبری — سوال درباره کارگاه",
    time: "۱ روز پیش",
  },
  {
    id: "8",
    type: "purchase",
    title: "خرید پکیج",
    description: "سارا احمدی — جعبه‌ابزار مقابله با اضطراب",
    time: "۲ روز پیش",
  },
  {
    id: "9",
    type: "register",
    title: "ثبت‌نام کاربر",
    description: "علی رضایی — ۰۹۱۲۱۱۱۱۱۱۱",
    time: "۲ روز پیش",
  },
  {
    id: "10",
    type: "appointment",
    title: "رزرو نوبت",
    description: "نرگس محمدی — ۱۴۰۵/۰۴/۱۸، ۰۸:۰۰–۰۹:۰۰",
    time: "۳ روز پیش",
  },
];
