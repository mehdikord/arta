import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../lib/generated/prisma/client";

const adapter = new PrismaMariaDb(process.env.DATABASE_URL as string);
const prisma = new PrismaClient({ adapter });

const PRODUCT_CATEGORIES = [
  { slug: "personal-growth", name: "رشد فردی" },
  { slug: "stress-management", name: "مدیریت استرس" },
  { slug: "mindfulness", name: "ذهن‌آگاهی" },
  { slug: "relationships", name: "روابط و ازدواج" },
  { slug: "child-psychology", name: "روانشناسی کودک" },
];

const BLOG_CATEGORIES = [
  { slug: "psychology", name: "روانشناسی" },
  { slug: "personal-growth", name: "رشد فردی" },
  { slug: "family", name: "خانواده" },
  { slug: "business", name: "کسب‌وکار" },
  { slug: "academy-news", name: "اخبار آکادمی" },
];

const PORTFOLIO_CATEGORIES = [
  { slug: "organizational", name: "سازمانی" },
  { slug: "individual", name: "فردی" },
  { slug: "workshop", name: "کارگاه" },
];

const SITE_SETTINGS = [
  { key: "name", value: "آکادمی توانمندسازی آرتا" },
  { key: "tagline", value: "مسیر رشد، از آگاهی تا توانمندی" },
  {
    key: "description",
    value:
      "آکادمی توانمندسازی آرتا با ارائه خدمات مشاوره، کوچینگ و آموزش، همراه شما در مسیر رشد فردی و سازمانی است.",
  },
  { key: "phone", value: "۰۲۱-۸۸۷۷۶۶۵۵" },
  { key: "email", value: "info@arta-academy.ir" },
  {
    key: "address",
    value: "تهران، خیابان ولیعصر، بالاتر از پارک ساعی، پلاک ۱۲۳۴، واحد ۵",
  },
  { key: "workingHours", value: "شنبه تا چهارشنبه، ۸:۰۰ تا ۱۴:۰۰" },
  { key: "instagram", value: "https://instagram.com/arta_academy" },
  { key: "telegram", value: "https://t.me/arta_academy" },
  { key: "linkedin", value: "https://linkedin.com/company/arta-academy" },
  { key: "whatsapp", value: "https://wa.me/989123456789" },
];

async function main() {
  for (const c of PRODUCT_CATEGORIES) {
    await prisma.productCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: c,
    });
  }
  for (const c of BLOG_CATEGORIES) {
    await prisma.blogCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: c,
    });
  }
  for (const c of PORTFOLIO_CATEGORIES) {
    await prisma.portfolioCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name },
      create: c,
    });
  }

  for (const s of SITE_SETTINGS) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  const adminPasswordHash = await bcrypt.hash("admin1234", 10);
  await prisma.admin.upsert({
    where: { mobile: "09120000000" },
    update: {},
    create: {
      name: "مدیر ارشد آرتا",
      email: "admin@arta-academy.ir",
      mobile: "09120000000",
      passwordHash: adminPasswordHash,
      role: "SUPER_ADMIN",
    },
  });

  const userPasswordHash = await bcrypt.hash("12345678", 10);
  await prisma.user.upsert({
    where: { mobile: "09123456789" },
    update: {},
    create: {
      name: "کاربر آزمایشی",
      mobile: "09123456789",
      passwordHash: userPasswordHash,
    },
  });

  const stressCat = await prisma.productCategory.findUniqueOrThrow({
    where: { slug: "stress-management" },
  });
  const growthCat = await prisma.productCategory.findUniqueOrThrow({
    where: { slug: "personal-growth" },
  });
  const orgCat = await prisma.portfolioCategory.findUniqueOrThrow({
    where: { slug: "organizational" },
  });
  const blogCat = await prisma.blogCategory.findUniqueOrThrow({
    where: { slug: "psychology" },
  });

  await prisma.service.upsert({
    where: { slug: "individual-counseling" },
    update: {},
    create: {
      slug: "individual-counseling",
      title: "مشاوره فردی",
      shortDescription: "جلسات مشاوره تخصصی برای رشد شخصی و سلامت روان.",
      fullDescription:
        "مشاوره فردی با رویکرد علمی و انسان‌محور برای مقابله با چالش‌های روزمره، اضطراب، افسردگی و تصمیم‌گیری‌های مهم زندگی.",
      category: "INDIVIDUAL",
      icon: "User",
      image: "/images/services/individual.svg",
      sortOrder: 1,
    },
  });

  await prisma.product.upsert({
    where: { slug: "stress-management-guide" },
    update: {},
    create: {
      slug: "stress-management-guide",
      title: "راهنمای جامع مدیریت استرس",
      shortDescription: "کتاب الکترونیکی ۸۰ صفحه‌ای با تمرین‌های عملی روزانه.",
      fullDescription:
        "این پکیج شامل راهنمای گام‌به‌گام مدیریت استرس، چک‌لیست‌های روزانه و فایل صوتی مدیتیشن ۱۵ دقیقه‌ای است.",
      categoryId: stressCat.id,
      image: "/images/products/stress-guide.svg",
      fileType: "PDF",
      fileUrl: "/files/sample.pdf",
      price: null,
      isFeatured: true,
      chapters: {
        create: [
          { title: "آشنایی با استرس", sortOrder: 0 },
          { title: "تکنیک‌های تنفسی", sortOrder: 1 },
          { title: "مدیریت افکار", sortOrder: 2 },
          { title: "برنامه عملی ۲۱ روزه", sortOrder: 3 },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: "communication-skills" },
    update: {},
    create: {
      slug: "communication-skills",
      title: "مهارت‌های ارتباط مؤثر",
      shortDescription: "دوره جامع ارتباطات بین‌فردی با مثال‌های واقعی.",
      fullDescription:
        "شامل ۱۲ فصل ویدیویی، کاربرگ‌های تمرینی و راهنمای مکالمات دشوار.",
      categoryId: growthCat.id,
      image: "/images/products/communication.svg",
      fileType: "MIXED",
      fileUrl: "/files/sample.pdf",
      price: 450000,
      discountPrice: 320000,
      isFeatured: true,
      chapters: {
        create: [
          { title: "مبانی ارتباط", sortOrder: 0 },
          { title: "شنیدن فعال", sortOrder: 1 },
          { title: "بازخورد سازنده", sortOrder: 2 },
        ],
      },
    },
  });

  await prisma.portfolioItem.upsert({
    where: { slug: "stress-workshop-company-x" },
    update: {},
    create: {
      slug: "stress-workshop-company-x",
      title: "کارگاه مدیریت استرس — شرکت X",
      shortDescription: "برگزاری کارگاه ۲ روزه برای ۴۰ نفر از کارکنان.",
      fullDescription:
        "طراحی و اجرای کارگاه تخصصی مدیریت استرس با تمرین‌های عملی گروهی و فردی.",
      categoryId: orgCat.id,
      image: "/images/portfolio/workshop.svg",
      year: 2025,
      client: "شرکت X",
      sortOrder: 1,
    },
  });

  await prisma.blogPost.upsert({
    where: { slug: "mindfulness-daily-practice" },
    update: {},
    create: {
      slug: "mindfulness-daily-practice",
      title: "ذهن‌آگاهی در زندگی روزمره",
      excerpt: "چگونه با ۱۰ دقیقه تمرین روزانه آرامش بیشتری تجربه کنیم.",
      content:
        "ذهن‌آگاهی یک مهارت قابل یادگیری است که با تمرین منظم می‌تواند کیفیت زندگی را بهبود بخشد...",
      image: "/images/blog/mindfulness.svg",
      author: "دکتر سارا احمدی",
      readTime: 6,
      publishedAt: new Date("2025-03-01"),
      categoryId: blogCat.id,
    },
  });

  const faqCount = await prisma.faq.count();
  if (faqCount === 0) {
    await prisma.faq.createMany({
      data: [
        {
          question: "چگونه نوبت مشاوره رزرو کنم؟",
          answer: "از بخش رزرو نوبت در سایت، تاریخ و ساعت مورد نظر را انتخاب کنید.",
          category: "نوبت‌دهی",
          sortOrder: 0,
        },
        {
          question: "پکیج‌های رایگان چگونه دریافت می‌شوند؟",
          answer: "پس از ثبت‌نام، روی دکمه دریافت رایگان کلیک کنید.",
          category: "پکیج‌ها",
          sortOrder: 1,
        },
      ],
    });
  }

  const teamCount = await prisma.teamMember.count();
  if (teamCount === 0) {
    await prisma.teamMember.createMany({
      data: [
        {
          name: "دکتر سارا احمدی",
          role: "مدیر علمی آکادمی",
          bio: "روانشناس بالینی با ۱۵ سال سابقه در مشاوره فردی و خانوادگی.",
          image: "/images/team/sara.svg",
          isManagement: true,
          sortOrder: 0,
        },
        {
          name: "مهدی رضایی",
          role: "مشاور و مربی",
          bio: "متخصص کوچینگ رشد فردی و مهارت‌های زندگی.",
          image: "/images/team/mehdi.svg",
          isManagement: false,
          sortOrder: 1,
        },
      ],
    });
  }

  const statsCount = await prisma.siteStat.count();
  if (statsCount === 0) {
    await prisma.siteStat.createMany({
      data: [
        { label: "مراجع راضی", value: "۲,۵۰۰+", sortOrder: 0 },
        { label: "سال فعالیت", value: "۱۲", sortOrder: 1 },
        { label: "جلسه مشاوره", value: "۱۵,۰۰۰+", sortOrder: 2 },
        { label: "کارگاه آموزشی", value: "۸۰+", sortOrder: 3 },
      ],
    });
  }

  const testimonialCount = await prisma.testimonial.count();
  if (testimonialCount === 0) {
    await prisma.testimonial.createMany({
      data: [
        {
          name: "مینا اکبری",
          role: "مدیر منابع انسانی",
          content:
            "کارگاه مدیریت استرس آرتا واقعاً تغییر‌آفرین بود.",
          rating: 5,
          sortOrder: 0,
        },
        {
          name: "امیر حسینی",
          role: "کارآفرین",
          content: "جلسات کوچینگ به من کمک کرد اولویت‌هایم را شفاف کنم.",
          rating: 5,
          sortOrder: 1,
        },
      ],
    });
  }

  // Ensure seeded products have their content files registered in
  // product_files (legacy public file shared by both packages).
  await ensureProductFile("stress-management-guide", {
    displayName: "راهنمای جامع مدیریت استرس (PDF)",
    storageKey: "/files/sample.pdf",
    kind: "TEXT",
  });
  await ensureProductFile("communication-skills", {
    displayName: "مهارت‌های ارتباط مؤثر (PDF)",
    storageKey: "/files/sample.pdf",
    kind: "TEXT",
  });

  console.log("✅ Seed completed.");
}

/**
 * Create a product_files row for a seeded product when it does not exist
 * yet (identified by storage key). Idempotent across re-seeds.
 */
async function ensureProductFile(
  productSlug: string,
  data: {
    displayName: string;
    storageKey: string;
    kind: "TEXT" | "VIDEO" | "AUDIO" | "ARCHIVE";
  },
) {
  const product = await prisma.product.findUnique({ where: { slug: productSlug } });
  if (!product) return;

  const existing = await prisma.productFile.count({
    where: { productId: product.id, storageKey: data.storageKey },
  });
  if (existing > 0) return;

  const maxOrder = await prisma.productFile.aggregate({
    where: { productId: product.id },
    _max: { sortOrder: true },
  });

  await prisma.productFile.create({
    data: {
      productId: product.id,
      displayName: data.displayName,
      storageKey: data.storageKey,
      kind: data.kind,
      sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
