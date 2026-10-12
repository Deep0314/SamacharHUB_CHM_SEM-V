/**
 * SamacharHUB — Database Seed Script
 * Seeds the MongoDB database with initial categories, breaking news,
 * a default admin user, and sample articles for development/testing.
 *
 * Usage:
 *   pnpm seed
 *
 * WARNING: This will not overwrite existing data.
 * Run only on a fresh/empty database.
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Automatically resolve .env from api-server directory if needed
if (!process.env.MONGODB_URI) {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const envPath = path.resolve(currentDir, "..", ".env");
  if (fs.existsSync(envPath) && typeof process.loadEnvFile === "function") {
    process.loadEnvFile(envPath);
  }
}

// --- DB Connection ---
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("MONGODB_URI environment variable is required");

await mongoose.connect(MONGODB_URI, { dbName: "samacharhub_enewspaper" });
console.log("✅ Connected to MongoDB");

// --- Category Schema ---
const CategorySchema = new mongoose.Schema({
  name: String, nameMr: String, slug: String, color: String, order: Number,
});
const Category = mongoose.model("Category", CategorySchema);

// --- AdminUser Schema ---
const AdminUserSchema = new mongoose.Schema({
  email: String, name: String, password: String, role: String,
}, { timestamps: true });
const AdminUser = mongoose.model("AdminUser", AdminUserSchema);

// --- SiteSettings Schema ---
const SiteSettingsSchema = new mongoose.Schema({
  siteDescription: String,
  siteDescriptionMr: String,
  hotspotUIConfig: mongoose.Schema.Types.Mixed,
  aboutContent: String,
  aboutContentMr: String,
  poweredByText: String,
  poweredByUrl: String,
  defaultLanguage: String,
}, { strict: false });
const SiteSettings = mongoose.model("SiteSettings", SiteSettingsSchema);

// --- Article Schema ---
const ArticleSchema = new mongoose.Schema({
  title: String, titleMr: String, slug: String, summary: String, summaryMr: String,
  content: String, contentMr: String, category: mongoose.Schema.Types.ObjectId,
  author: String, imageUrl: String, tags: [String], status: String,
  featured: Boolean, lang: String, viewCount: Number, publishedAt: Date,
}, { timestamps: true });
const Article = mongoose.model("Article", ArticleSchema);

// --- Breaking News Schema ---
const BreakingNewsSchema = new mongoose.Schema({
  text: String, textMr: String, link: String, active: Boolean, lang: String,
}, { timestamps: true });
const BreakingNews = mongoose.model("BreakingNews", BreakingNewsSchema);

// ============================================================
// SEED CATEGORIES
// ============================================================
const categories = [
  { name: "Politics",     nameMr: "राजकारण",  slug: "politics",    color: "#e53e3e", order: 0 },
  { name: "Sports",       nameMr: "क्रीडा",    slug: "sports",      color: "#38a169", order: 1 },
  { name: "Business",     nameMr: "व्यापार",   slug: "business",    color: "#3182ce", order: 2 },
  { name: "Entertainment",nameMr: "मनोरंजन",  slug: "entertainment",color: "#805ad5", order: 3 },
  { name: "Education",    nameMr: "शिक्षण",    slug: "education",   color: "#d69e2e", order: 4 },
  { name: "Technology",   nameMr: "तंत्रज्ञान", slug: "technology",  color: "#00b5d8", order: 5 },
  { name: "Local",        nameMr: "स्थानिक",  slug: "local",       color: "#ed8936", order: 6 },
  { name: "National",     nameMr: "राष्ट्रीय", slug: "national",    color: "#e53e3e", order: 7 },
];

let seededCategories = 0;
const categoryMap: Record<string, mongoose.Types.ObjectId> = {};
for (const cat of categories) {
  const existing = await Category.findOne({ slug: cat.slug });
  if (!existing) {
    const created = await Category.create(cat);
    categoryMap[cat.slug] = created._id as mongoose.Types.ObjectId;
    seededCategories++;
  } else {
    categoryMap[cat.slug] = existing._id as mongoose.Types.ObjectId;
  }
}
console.log(`✅ Categories: ${seededCategories} seeded (${categories.length - seededCategories} already existed)`);

// ============================================================
// SEED ADMIN USER
// ============================================================
const adminUsers = [
  { email: "admin@example.com", name: "SamacharHUB Admin", password: "password123", role: "admin" },
  { email: "admin@samacharhub.com", name: "SamacharHUB Admin", password: "Admin@123", role: "admin" },
];

for (const admin of adminUsers) {
  const hashedPassword = await bcrypt.hash(admin.password, 12);
  await AdminUser.findOneAndUpdate(
    { email: admin.email },
    {
      email: admin.email,
      name: admin.name,
      password: hashedPassword,
      role: admin.role,
    },
    { upsert: true, new: true }
  );
  console.log(`✅ Admin user seeded/updated: ${admin.email} / ${admin.password}`);
}

// ============================================================
// SEED SITE SETTINGS & LOGO
// ============================================================
const defaultSettings = {
  siteDescription: "SamacharHUB — Read without language barriers, share without limits.",
  siteDescriptionMr: "SamacharHUB — भाषेच्या मर्यादांशिवाय वाचा, अमर्याद शेअर करा.",
  aboutContent: "SamacharHUB is a leading regional e-newspaper platform committed to providing accurate and timely news without language barriers.",
  aboutContentMr: "समाचार हब हे भाषेच्या मर्यादांशिवाय अचूक आणि वेळेवर बातम्या देण्यासाठी वचनबद्ध असलेले एक अग्रगण्य प्रादेशिक ई-वृत्तपत्र आहे.",
  poweredByText: "Deep Kamble",
  poweredByUrl: "https://deepkamble.online",
  defaultLanguage: "en",
  maintenanceMode: false,
  maintenanceMessage: "We are currently under maintenance. Please check back soon.",
  maintenanceMessageMr: "आम्ही सध्या देखभाल करत आहोत. कृपया लवकरच परत या.",
  hotspotUIConfig: {
    showLogo: true,
    logoUrl: "/logo.jpg",
    logoText: "SamacharHUB",
    tagline: "Read without language barriers, share without limits.",
    taglineMr: "भाषेच्या मर्यादांशिवाय वाचा, अमर्याद शेअर करा.",
    popupHeaderText: "SamacharHUB Clip",
    popupHeaderTextMr: "वृत्तपत्र क्लिप",
    footerSiteUrl: "www.samacharhub.com",
    footerPoweredBy: "Powered by | Deep Kamble",
    showFooterDate: true,
    showFooterPage: true,
    homeScrollEnabled: true,
    homeScrollSpeed: 30,
    homePageMode: "today",
    showArticleDetails: true,
    showZoomHint: true,
    showCopyLink: true,
    showDownload: true,
    showReadArticle: true,
    showPrint: true,
    showEditionShareBar: true,
    tickerContinuous: true,
    showBreakingNewsStrip: true,
    showEditionsStrip: true,
    shareButtons: {
      whatsapp: true,
      facebook: true,
      instagram: true,
      twitter: true,
      telegram: true,
      email: true,
      linkedin: true,
    },
  },
};

const existingSettings = await SiteSettings.findOne();
if (!existingSettings) {
  await SiteSettings.create(defaultSettings);
  console.log("✅ Site settings and logo seeded to DB (/logo.jpg)");
} else {
  existingSettings.hotspotUIConfig = {
    ...(existingSettings.hotspotUIConfig || {}),
    ...defaultSettings.hotspotUIConfig,
    logoUrl: "/logo.jpg",
    showLogo: true,
    logoText: "SamacharHUB",
    tagline: "Read without language barriers, share without limits.",
    taglineMr: "भाषेच्या मर्यादांशिवाय वाचा, अमर्याद शेअर करा.",
  };
  existingSettings.siteDescription = defaultSettings.siteDescription;
  existingSettings.siteDescriptionMr = defaultSettings.siteDescriptionMr;
  await existingSettings.save();
  console.log("✅ Site settings and logo updated in DB (/logo.jpg)");
}

// ============================================================
// SEED BREAKING NEWS
// ============================================================
const breakingNewsItems = [
  {
    text: "Welcome to SamacharHUB — Your trusted digital e-newspaper!",
    textMr: "SamacharHUB मध्ये आपले स्वागत आहे — तुमचे विश्वासू डिजिटल वृत्तपत्र!",
    link: null,
    active: true,
    lang: "both",
  },
];

let seededBreaking = 0;
for (const item of breakingNewsItems) {
  const existing = await BreakingNews.findOne({ text: item.text });
  if (!existing) {
    await BreakingNews.create(item);
    seededBreaking++;
  }
}
console.log(`✅ Breaking news: ${seededBreaking} seeded`);

// ============================================================
// SEED SAMPLE ARTICLES
// ============================================================
function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

const sampleArticles = [
  {
    title: "SamacharHUB Launches as Maharashtra's New Digital Newspaper",
    titleMr: "महाराष्ट्राचे नवे डिजिटल वृत्तपत्र SamacharHUB सुरू झाले",
    summary: "SamacharHUB is set to transform how readers in Maharashtra access their daily news, offering a seamless bilingual experience.",
    summaryMr: "SamacharHUB महाराष्ट्रातील वाचक दैनंदिन बातम्या कसे वाचतात हे बदलण्यास तयार आहे.",
    content: "<p>SamacharHUB has launched as a comprehensive digital newspaper platform designed to serve readers across Maharashtra with the latest news in both English and Marathi.</p><p>The platform features interactive newspaper editions, breaking news alerts, and a fully bilingual experience to cater to readers who prefer either language.</p>",
    contentMr: "<p>SamacharHUB हे एक सर्वसमावेशक डिजिटल वृत्तपत्र व्यासपीठ म्हणून सुरू झाले आहे.</p>",
    categorySlug: "local",
    author: "Editorial Team",
    tags: ["launch", "digital", "newspaper", "Maharashtra"],
    featured: true,
    lang: "both",
    status: "published",
  },
  {
    title: "How to Read Today's Digital Edition",
    titleMr: "आजची डिजिटल आवृत्ती कशी वाचावी",
    summary: "A quick guide for readers on how to navigate and read the digital edition of SamacharHUB with interactive article links.",
    summaryMr: "वाचकांसाठी SamacharHUB च्या डिजिटल आवृत्तीमध्ये नेव्हिगेट करण्यासाठी एक द्रुत मार्गदर्शक.",
    content: "<p>Reading your daily newspaper just got easier. SamacharHUB's digital edition viewer lets you browse pages, zoom in, and click on highlighted articles to read the full story online.</p><ol><li>Navigate to the Editions section from the home page.</li><li>Select today's edition.</li><li>Click on any highlighted area on the page to read the linked article.</li></ol>",
    contentMr: "<p>तुमचे दैनिक वृत्तपत्र वाचणे आता सोपे झाले आहे.</p>",
    categorySlug: "technology",
    author: "Tech Team",
    tags: ["guide", "edition", "howto"],
    featured: false,
    lang: "both",
    status: "published",
  },
];

let seededArticles = 0;
for (const articleData of sampleArticles) {
  const { categorySlug, ...rest } = articleData;
  const catId = categoryMap[categorySlug];
  if (!catId) continue;

  const slug = slugify(rest.title) + "-" + Date.now();
  const existing = await Article.findOne({ title: rest.title });
  if (!existing) {
    await Article.create({
      ...rest,
      slug,
      category: catId,
      imageUrl: null,
      viewCount: 0,
      publishedAt: new Date(),
    });
    seededArticles++;
    // Small delay to ensure unique timestamps in slugs
    await new Promise(r => setTimeout(r, 10));
  }
}
console.log(`✅ Articles: ${seededArticles} seeded`);

// ============================================================
console.log("\n🎉 SamacharHUB database seeding complete!");
console.log("━".repeat(50));
console.log(`   Admin login: admin@example.com`);
console.log(`   Password:    password123`);
console.log(`   (Backup):    admin@samacharhub.com / Admin@123`);
console.log("━".repeat(50));

await mongoose.disconnect();
process.exit(0);
