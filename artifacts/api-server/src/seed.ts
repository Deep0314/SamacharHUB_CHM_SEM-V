/**
 * SamacharHUB — Multilingual Database Seed Script
 * Seeds the MongoDB database with initial categories, breaking news,
 * admin users, site settings, sample articles, and sample edition
 * with full English, Marathi, and Hindi support.
 *
 * Usage:
 *   pnpm seed
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
  name: String, nameMr: String, nameHi: String, slug: String, color: String, order: Number,
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
  siteDescriptionHi: String,
  aboutContent: String,
  aboutContentMr: String,
  aboutContentHi: String,
  contactEmail: String,
  contactPhone: String,
  contactAddress: String,
  contactAddressMr: String,
  contactAddressHi: String,
  maintenanceMode: Boolean,
  maintenanceMessage: String,
  maintenanceMessageMr: String,
  maintenanceMessageHi: String,
  defaultLanguage: String,
  poweredByText: String,
  poweredByUrl: String,
  hotspotUIConfig: mongoose.Schema.Types.Mixed,
  quickLinks: [mongoose.Schema.Types.Mixed],
  socialLinks: [mongoose.Schema.Types.Mixed],
}, { strict: false });
const SiteSettings = mongoose.model("SiteSettings", SiteSettingsSchema);

// --- Article Schema ---
const ArticleSchema = new mongoose.Schema({
  title: String, titleMr: String, titleHi: String, slug: String,
  summary: String, summaryMr: String, summaryHi: String,
  content: String, contentMr: String, contentHi: String,
  category: mongoose.Schema.Types.ObjectId,
  author: String, imageUrl: String, tags: [String], status: String,
  featured: Boolean, lang: String, viewCount: Number, publishedAt: Date,
}, { timestamps: true });
const Article = mongoose.model("Article", ArticleSchema);

// --- Breaking News Schema ---
const BreakingNewsSchema = new mongoose.Schema({
  text: String, textMr: String, textHi: String, link: String, active: Boolean, lang: String,
}, { timestamps: true });
const BreakingNews = mongoose.model("BreakingNews", BreakingNewsSchema);

// --- Edition Schema ---
const EditionSchema = new mongoose.Schema({
  cities: [String],
  citiesMr: [String],
  citiesHi: [String],
  date: Date,
  coverUrl: String,
  pages: [String],
  published: Boolean,
  viewCount: Number,
  articleHotspots: [mongoose.Schema.Types.Mixed],
  hotspotPopupHeader: String,
}, { timestamps: true });
const Edition = mongoose.model("Edition", EditionSchema);

// ============================================================
// 1. SEED CATEGORIES (English, Marathi, Hindi)
// ============================================================
const categories = [
  { name: "Politics", nameMr: "राजकारण", nameHi: "राजनीति", slug: "politics", color: "#e53e3e", order: 0 },
  { name: "Sports", nameMr: "क्रीडा", nameHi: "खेल", slug: "sports", color: "#38a169", order: 1 },
  { name: "Business", nameMr: "व्यापार", nameHi: "व्यापार", slug: "business", color: "#3182ce", order: 2 },
  { name: "Entertainment", nameMr: "मनोरंजन", nameHi: "मनोरंजन", slug: "entertainment", color: "#805ad5", order: 3 },
  { name: "Education", nameMr: "शिक्षण", nameHi: "शिक्षा", slug: "education", color: "#d69e2e", order: 4 },
  { name: "Technology", nameMr: "तंत्रज्ञान", nameHi: "प्रौद्योगिकी", slug: "technology", color: "#00b5d8", order: 5 },
  { name: "Local", nameMr: "स्थानिक", nameHi: "स्थानीय", slug: "local", color: "#ed8936", order: 6 },
  { name: "National", nameMr: "राष्ट्रीय", nameHi: "राष्ट्रीय", slug: "national", color: "#e53e3e", order: 7 },
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
    existing.name = cat.name;
    existing.nameMr = cat.nameMr;
    existing.nameHi = cat.nameHi;
    existing.color = cat.color;
    existing.order = cat.order;
    await existing.save();
    categoryMap[cat.slug] = existing._id as mongoose.Types.ObjectId;
  }
}
console.log(`✅ Categories: ${seededCategories} seeded (${categories.length - seededCategories} updated)`);

// ============================================================
// 2. SEED ADMIN USERS
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
// 3. SEED SITE SETTINGS & MULTILINGUAL CONFIG
// ============================================================
const defaultCities = [
  { en: "Amravati", mr: "अमरावती", hi: "अमरावती" },
  { en: "Namaskar Amravati", mr: "नमस्कार अमरावती", hi: "नमस्कार अमरावती" },
  { en: "Yavatmal", mr: "यवतमाळ", hi: "यवतमाल" },
  { en: "Buldhana", mr: "बुलढाणा", hi: "बुलढाणा" },
  { en: "Akola", mr: "अकोला", hi: "अकोला" },
  { en: "Washim", mr: "वाशिम", hi: "वाशिम" },
  { en: "Wardha", mr: "वर्धा", hi: "वर्धा" },
  { en: "Weekly", mr: "साप्ताहिक", hi: "साप्ताहिक" },
  { en: "Nagpur", mr: "नागपूर", hi: "नागपुर" },
  { en: "Pune", mr: "पुणे", hi: "पुणे" },
  { en: "Mumbai", mr: "मुंबई", hi: "मुंबई" },
];

const defaultSettings = {
  siteDescription: "SamacharHUB — Read without language barriers, share without limits.",
  siteDescriptionMr: "SamacharHUB — भाषेच्या मर्यादांशिवाय वाचा, अमर्याद शेअर करा.",
  siteDescriptionHi: "SamacharHUB — बिना किसी भाषा बाधा के पढ़ें, असीमित साझा करें.",
  aboutContent: "SamacharHUB is a leading regional digital newspaper platform committed to delivering accurate, unbiased, and timely news in English, Marathi, and Hindi.",
  aboutContentMr: "समाचार हब हे इंग्रजी, मराठी आणि हिंदी भाषेत अचूक, निःपक्षपाती आणि वेळेवर बातम्या देण्यासाठी वचनबद्ध असलेले एक अग्रगण्य प्रादेशिक डिजिटल वृत्तपत्र व्यासपीठ आहे.",
  aboutContentHi: "समाचार हब अंग्रेजी, मराठी और हिंदी में सटीक, निष्पक्ष और समय पर समाचार प्रदान करने के लिए प्रतिबद्ध एक अग्रणी क्षेत्रीय डिजिटल समाचार पत्र मंच है।",
  contactEmail: "contact@samacharhub.com",
  contactPhone: "+91 98765 43210",
  contactAddress: "Maharashtra, India",
  contactAddressMr: "महाराष्ट्र, भारत",
  contactAddressHi: "महाराष्ट्र, भारत",
  poweredByText: "Deep Kamble & Gufran Khan",
  poweredByUrl: "http://localhost:3000",
  defaultLanguage: "en",
  maintenanceMode: false,
  maintenanceMessage: "We are currently under maintenance. Please check back soon.",
  maintenanceMessageMr: "आम्ही सध्या देखभाल करत आहोत. कृपया लवकरच परत या.",
  maintenanceMessageHi: "हम वर्तमान में रखरखाव में हैं। कृपया शीघ्र ही पुनः देखें।",
  quickLinks: [
    { label: "About Us", labelMr: "आमच्या विषयी", labelHi: "हमारे बारे में", url: "/about", order: 0 },
    { label: "Contact Us", labelMr: "संपर्क", labelHi: "संपर्क करें", url: "/contact", order: 1 },
    { label: "Politics", labelMr: "राजकारण", labelHi: "राजनीति", url: "/category/politics", order: 2 },
    { label: "Sports", labelMr: "क्रीडा", labelHi: "खेल", url: "/category/sports", order: 3 },
    { label: "Technology", labelMr: "तंत्रज्ञान", labelHi: "प्रौद्योगिकी", url: "/category/technology", order: 4 },
  ],
  socialLinks: [
    { platform: "Facebook", url: "https://facebook.com", icon: "facebook" },
    { platform: "WhatsApp", url: "https://wa.me/", icon: "whatsapp" },
    { platform: "Instagram", url: "https://instagram.com", icon: "instagram" },
    { platform: "Telegram", url: "https://telegram.org", icon: "telegram" },
  ],
  hotspotUIConfig: {
    showLogo: true,
    logoUrl: "/logo.jpg",
    logoText: "SamacharHUB",
    tagline: "Read without language barriers, share without limits.",
    taglineMr: "भाषेच्या मर्यादांशिवाय वाचा, अमर्याद शेअर करा.",
    taglineHi: "बिना किसी भाषा बाधा के पढ़ें, असीमित साझा करें.",
    popupHeaderText: "SamacharHUB Clip",
    popupHeaderTextMr: "वृत्तपत्र क्लिप",
    popupHeaderTextHi: "समाचार क्लिप",
    footerSiteUrl: "www.samacharhub.com",
    footerPoweredBy: "Powered by | Deep Kamble & Gufran Khan",
    showFooterDate: true,
    showFooterPage: true,
    homeScrollEnabled: true,
    homeScrollSpeed: 30,
    homePageMode: "today",
    editionCities: defaultCities,
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
  console.log("✅ Site settings seeded to DB with English, Marathi & Hindi");
} else {
  existingSettings.hotspotUIConfig = {
    ...(existingSettings.hotspotUIConfig || {}),
    ...defaultSettings.hotspotUIConfig,
    editionCities: defaultCities,
  };
  existingSettings.siteDescription = defaultSettings.siteDescription;
  existingSettings.siteDescriptionMr = defaultSettings.siteDescriptionMr;
  (existingSettings as any).siteDescriptionHi = defaultSettings.siteDescriptionHi;
  existingSettings.aboutContent = defaultSettings.aboutContent;
  existingSettings.aboutContentMr = defaultSettings.aboutContentMr;
  (existingSettings as any).aboutContentHi = defaultSettings.aboutContentHi;
  existingSettings.contactAddress = defaultSettings.contactAddress;
  existingSettings.contactAddressMr = defaultSettings.contactAddressMr;
  (existingSettings as any).contactAddressHi = defaultSettings.contactAddressHi;
  existingSettings.maintenanceMessage = defaultSettings.maintenanceMessage;
  existingSettings.maintenanceMessageMr = defaultSettings.maintenanceMessageMr;
  (existingSettings as any).maintenanceMessageHi = defaultSettings.maintenanceMessageHi;
  existingSettings.quickLinks = defaultSettings.quickLinks;
  existingSettings.socialLinks = defaultSettings.socialLinks;
  await existingSettings.save();
  console.log("✅ Site settings updated in DB with English, Marathi & Hindi");
}

// ============================================================
// 4. SEED BREAKING NEWS (English, Marathi, Hindi)
// ============================================================
const breakingNewsItems = [
  {
    text: "Welcome to SamacharHUB — Your trusted digital e-newspaper in English, Marathi & Hindi!",
    textMr: "SamacharHUB मध्ये आपले स्वागत आहे — इंग्रजी, मराठी आणि हिंदीमधील तुमचे विश्वासू डिजिटल वृत्तपत्र!",
    textHi: "SamacharHUB में आपका स्वागत है — अंग्रेजी, मराठी और हिंदी में आपका विश्वसनीय डिजिटल ई-समाचार पत्र!",
    link: null,
    active: true,
    lang: "all",
  },
  {
    text: "Interactive digital editions are now live with high-res clipping and multi-language support.",
    textMr: "उच्च-रिझोल्यूशन कतरन आणि बहुभाषिक समर्थनासह परस्परसंवादी डिजिटल आवृत्त्या आता उपलब्ध आहेत.",
    textHi: "उच्च-रिज़ॉल्यूशन कतरन और बहुभाषी समर्थन के साथ इंटरैक्टिव डिजिटल संस्करण अब लाइव हैं।",
    link: null,
    active: true,
    lang: "all",
  },
  {
    text: "Special Report: Maharashtra development initiatives gain momentum across regional districts.",
    textMr: "विशेष वृत्त: प्रादेशिक जिल्ह्यांमध्ये महाराष्ट्रातील विकास प्रकल्पांना गती मिळाली आहे.",
    textHi: "विशेष रिपोर्ट: क्षेत्रीय जिलों में महाराष्ट्र विकास पहलों को मिली नई गति।",
    link: null,
    active: true,
    lang: "all",
  },
];

let seededBreaking = 0;
for (const item of breakingNewsItems) {
  const existing = await BreakingNews.findOne({ text: item.text });
  if (!existing) {
    await BreakingNews.create(item);
    seededBreaking++;
  } else {
    existing.text = item.text;
    existing.textMr = item.textMr;
    existing.textHi = item.textHi;
    existing.lang = "all";
    existing.active = true;
    await existing.save();
  }
}
console.log(`✅ Breaking news: ${seededBreaking} seeded (${breakingNewsItems.length - seededBreaking} updated)`);

// ============================================================
// 5. SEED ARTICLES (English, Marathi, Hindi)
// ============================================================
function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

const sampleArticles = [
  {
    title: "SamacharHUB Launches as Maharashtra's New Digital Newspaper",
    titleMr: "महाराष्ट्राचे नवे डिजिटल वृत्तपत्र SamacharHUB सुरू झाले",
    titleHi: "महाराष्ट्र का नया डिजिटल समाचार पत्र SamacharHUB शुरू हुआ",
    summary: "SamacharHUB is set to transform how readers in Maharashtra access daily news with seamless trilingual support in English, Marathi, and Hindi.",
    summaryMr: "SamacharHUB महाराष्ट्रातील वाचक इंग्रजी, मराठी आणि हिंदीमध्ये दैनंदिन बातम्या कशा वाचतात हे बदलण्यास सज्ज आहे.",
    summaryHi: "SamacharHUB अंग्रेजी, मराठी और हिंदी में सहज त्रिभाषी समर्थन के साथ महाराष्ट्र के पाठकों के समाचार पढ़ने के अनुभव को बदलने के लिए तैयार है।",
    content: "<p>SamacharHUB has officially launched as a next-generation regional digital newspaper platform. Designed to bridge linguistic boundaries, SamacharHUB offers reader-friendly e-newspaper editions, instant breaking news, and localized regional coverage.</p><p>Readers can explore published pages, clip articles directly to social platforms, and view full investigative stories in English, Marathi, or Hindi with a single click.</p>",
    contentMr: "<p>SamacharHUB हे पुढील पिढीचे प्रादेशिक डिजिटल वृत्तपत्र व्यासपीठ म्हणून अधिकृतपणे सुरू झाले आहे. भाषेच्या मर्यादा ओलांडण्यासाठी तयार केलेले SamacharHUB वाचक-अनुकूल ई-वृत्तपत्र आवृत्त्या, ताज्या बातम्या आणि प्रादेशिक वार्तांकन प्रदान करते.</p><p>वाचक प्रकाशित पृष्ठे पाहू शकतात, लेखांची कतरन थेट सोशल मीडियावर शेअर करू शकतात आणि एका क्लिकवर इंग्रजी, मराठी किंवा हिंदीमध्ये संपूर्ण लेख वाचू शकतात.</p>",
    contentHi: "<p>SamacharHUB को अगली पीढ़ी के क्षेत्रीय डिजिटल समाचार पत्र मंच के रूप में आधिकारिक तौर पर लॉन्च किया गया है। भाषाई सीमाओं को पाटने के लिए डिज़ाइन किया गया SamacharHUB पाठकों के अनुकूल ई-समाचार पत्र संस्करण, ताज़ा समाचार और स्थानीय कवरेज प्रदान करता है।</p><p>पाठक प्रकाशित पृष्ठों को ब्राउज़ कर सकते हैं, सीधे सोशल मीडिया पर समाचार क्लिप साझा कर सकते हैं और एक क्लिक में अंग्रेजी, मराठी या हिंदी में पूरा लेख पढ़ सकते हैं।</p>",
    categorySlug: "local",
    author: "Editorial Team",
    tags: ["launch", "digital", "newspaper", "Maharashtra"],
    featured: true,
    lang: "all",
    status: "published",
  },
  {
    title: "How to Read Today's Digital Edition",
    titleMr: "आजची डिजिटल आवृत्ती कशी वाचावी",
    titleHi: "आज का डिजिटल संस्करण कैसे पढ़ें",
    summary: "A quick guide for readers on how to navigate, zoom, and clip articles in the interactive newspaper viewer.",
    summaryMr: "परस्परसंवादी वृत्तपत्र वाचकामध्ये पृष्ठे नेव्हिगेट करणे, झूम करणे आणि लेखांची कतरन काढण्यासाठी वाचकांसाठी एक द्रुत मार्गदर्शक.",
    summaryHi: "इंटरैक्टिव समाचार पत्र व्यूअर में पृष्ठों को नेविगेट करने, ज़ूम करने और लेखों की कतरन निकालने के लिए पाठकों हेतु एक त्वरित मार्गदर्शिका।",
    content: "<p>Reading your favorite daily edition is effortless on SamacharHUB. Follow these easy steps:</p><ol><li>Open the Editions tab from the header navigation.</li><li>Select your preferred city edition and date.</li><li>Click any highlighted box on the newspaper page to open the article clip and read in full.</li><li>Use the clip and share buttons to send clips directly to WhatsApp, Facebook, or X.</li></ol>",
    contentMr: "<p>SamacharHUB वर तुमची आवडती आवृत्ती वाचणे आता अत्यंत सोपे आहे. खालील सोप्या पायऱ्या वापरा:</p><ol><li>शीर्ष नेव्हिगेशनमधून आवृत्ती टॅब उघडा.</li><li>तुमचे आवडते शहर आणि तारीख निवडा.</li><li>वृत्तपत्राच्या पृष्ठावरील कोणत्याही हायलाइट केलेल्या भागावर क्लिक करून लेख उघडा.</li><li>कतरन आणि शेअर बटणे वापरून थेट व्हॉट्सअॅप किंवा फेसबुकवर पाठवा.</li></ol>",
    contentHi: "<p>SamacharHUB पर अपना पसंदीदा दैनिक संस्करण पढ़ना बेहद आसान है। इन सरल चरणों का पालन करें:</p><ol><li>शीर्ष नेविगेशन से संस्करण टैब खोलें।</li><li>अपना पसंदीदा शहर संस्करण और तिथि चुनें।</li><li>समाचार पत्र के पृष्ठ पर किसी भी हाइलाइट किए गए बॉक्स पर क्लिक करके पूरा लेख पढ़ें।</li><li>कतरन और साझा बटन का उपयोग करके क्लिप को सीधे व्हाट्सएप या फेसबुक पर साझा करें।</li></ol>",
    categorySlug: "technology",
    author: "Tech Team",
    tags: ["guide", "edition", "howto"],
    featured: false,
    lang: "all",
    status: "published",
  },
  {
    title: "State Assembly Clears Historic Education Infrastructure Initiative",
    titleMr: "विधानसभेत ऐतिहासिक शैक्षणिक पायाभूत सुविधा उपक्रमास मंजुरी",
    titleHi: "विधानसभा ने ऐतिहासिक शैक्षणिक बुनियादी ढांचा पहल को दी मंजूरी",
    summary: "The legislative assembly has sanctioned new funding for smart classrooms and digital libraries across regional secondary schools.",
    summaryMr: "विधानसभेने प्रादेशिक माध्यमिक शाळांमध्ये स्मार्ट वर्गखोल्या आणि डिजिटल ग्रंथालयांसाठी नवीन निधी मंजूर केला आहे.",
    summaryHi: "विधानसभा ने क्षेत्रीय माध्यमिक विद्यालयों में स्मार्ट कक्षाओं और डिजिटल पुस्तकालयों के लिए नए वित्तपोषण को मंजूरी दी है।",
    content: "<p>In a milestone move for school education, the state assembly unanimously cleared a comprehensive modernisation program. Rural institutions will receive solar energy installations and high-speed broadband connections.</p>",
    contentMr: "<p>शालेय शिक्षणासाठी एका ऐतिहासिक पावलात, विधानसभेने सर्वसमावेशक आधुनिकीकरण कार्यक्रमाला एकमुखाने मंजुरी दिली. ग्रामीण संस्थांना सौरऊर्जा आणि हाय-स्पीड ब्रॉडबँड सुविधा मिळतील.</p>",
    contentHi: "<p>स्कूली शिक्षा के लिए एक ऐतिहासिक कदम उठाते हुए विधानसभा ने सर्वसम्मति से व्यापक आधुनिकीकरण कार्यक्रम को मंजूरी दी। ग्रामीण संस्थानों को सौर ऊर्जा और हाई-स्पीड ब्रॉडबैंड सुविधाएं मिलेंगी।</p>",
    categorySlug: "politics",
    author: "Staff Reporter",
    tags: ["education", "assembly", "policy"],
    featured: true,
    lang: "all",
    status: "published",
  },
  {
    title: "Regional Sports Talents Shine at State Championship",
    titleMr: "राज्य अजिंक्यपद स्पर्धेत प्रादेशिक क्रीडा प्रतिभांची चमक",
    titleHi: "राज्य चैंपियनशिप में चमकी क्षेत्रीय खेल प्रतिभाएं",
    summary: "Over 5,000 athletes from Vidarbha, Marathwada, and Western Maharashtra competed in track and field finals.",
    summaryMr: "विदर्भ, मराठवाडा आणि पश्चिम महाराष्ट्रातील ५,००० हून अधिक खेळाडूंनी ट्रॅक आणि मैदानी अंतिम फेरीत सहभाग घेतला.",
    summaryHi: "विदर्भ, मराठवाड़ा और पश्चिम महाराष्ट्र के 5,000 से अधिक एथलीटों ने ट्रैक और फील्ड स्पर्धाओं में भाग लिया।",
    content: "<p>The annual state youth athletic championship concluded with thrilling track finishes. Young athletes set three new state records in sprint and high jump events.</p>",
    contentMr: "<p>वार्षिक राज्य युवा ॲथलेटिक स्पर्धा रोमांचक अंतिम फेरीसह संपन्न झाली. तरुण खेळाडूंनी स्प्रिंट आणि उंच उडी प्रकारात तीन नवे राज्य विक्रम नोंदवले.</p>",
    contentHi: "<p>वार्षिक राज्य युवा एथलेटिक चैंपियनशिप रोमांचक मुकाबलों के साथ संपन्न हुई। युवा एथलीटों ने स्प्रिंट और ऊंची कूद में तीन नए राज्य रिकॉर्ड बनाए।</p>",
    categorySlug: "sports",
    author: "Sports Bureau",
    tags: ["athletics", "youth", "sports"],
    featured: false,
    lang: "all",
    status: "published",
  },
  {
    title: "Agri-Tech Startups Powering Rural Economic Growth",
    titleMr: "कृषी-तंत्रज्ञान स्टार्टअप्स ग्रामीण अर्थव्यवस्थेला चालना देत आहेत",
    titleHi: "कृषि-तकनीक स्टार्टअप्स दे रहे हैं ग्रामीण अर्थव्यवस्था को नई गति",
    summary: "Modern cold-chain networks and AI-powered weather forecasting tools help regional farmers increase profitability.",
    summaryMr: "आधुनिक कोल्ड-चेन नेटवर्क आणि एआय-आधारित हवामान अंदाज साधने शेतकऱ्यांना नफा वाढवण्यास मदत करत आहेत.",
    summaryHi: "आधुनिक कोल्ड-चेन नेटवर्क और एआई-संचालित मौसम पूर्वानुमान उपकरण किसानों को अधिक लाभ कमाने में मदद कर रहे हैं।",
    content: "<p>Agricultural technology enterprises across Maharashtra are scaling up cold storage infrastructure and real-time mandi price tracking, significantly reducing post-harvest losses for smallholder farmers.</p>",
    contentMr: "<p>महाराष्ट्रातील कृषी तंत्रज्ञान उपक्रम शीतगृह पायाभूत सुविधा आणि रिअल-टाइम बाजार भाव ट्रॅकिंगचा विस्तार करत आहेत, ज्यामुळे शेतकऱ्यांचे नुकसान मोठ्या प्रमाणात कमी होत आहे.</p>",
    contentHi: "<p>महाराष्ट्र भर में कृषि प्रौद्योगिकी उद्यम कोल्ड स्टोरेज बुनियादी ढांचे और वास्तविक समय में मंडी मूल्य ट्रैकिंग का विस्तार कर रहे हैं, जिससे छोटे किसानों का नुकसान काफी कम हो रहा है।</p>",
    categorySlug: "business",
    author: "Business Desk",
    tags: ["business", "agriculture", "economy"],
    featured: false,
    lang: "all",
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
      imageUrl: "/logo.jpg",
      viewCount: 10,
      publishedAt: new Date(),
    });
    seededArticles++;
    await new Promise(r => setTimeout(r, 15));
  } else {
    existing.title = rest.title;
    existing.titleMr = rest.titleMr;
    existing.titleHi = rest.titleHi;
    existing.summary = rest.summary;
    existing.summaryMr = rest.summaryMr;
    existing.summaryHi = rest.summaryHi;
    existing.content = rest.content;
    existing.contentMr = rest.contentMr;
    existing.contentHi = rest.contentHi;
    existing.lang = "all";
    existing.imageUrl = existing.imageUrl || "/logo.jpg";
    await existing.save();
  }
}
console.log(`✅ Articles: ${seededArticles} seeded (${sampleArticles.length - seededArticles} updated with English, Marathi & Hindi)`);

// ============================================================
// 6. SEED SAMPLE EDITION (with Marathi & Hindi cities and hotspots)
// ============================================================
const existingEdition = await Edition.findOne();
const firstArticle = await Article.findOne({ title: sampleArticles[0].title });
const secondArticle = await Article.findOne({ title: sampleArticles[1].title });

const hotspots = [];
if (firstArticle) {
  hotspots.push({
    pageIndex: 0,
    x: 8,
    y: 12,
    width: 48,
    height: 42,
    articleId: firstArticle._id.toString(),
    articleTitle: firstArticle.title,
    articleTitleMr: firstArticle.titleMr,
    articleTitleHi: (firstArticle as any).titleHi,
    articleSlug: firstArticle.slug,
    articleSummary: firstArticle.summary,
    articleSummaryMr: firstArticle.summaryMr,
    articleSummaryHi: (firstArticle as any).summaryHi,
  });
}
if (secondArticle) {
  hotspots.push({
    pageIndex: 0,
    x: 58,
    y: 12,
    width: 36,
    height: 38,
    articleId: secondArticle._id.toString(),
    articleTitle: secondArticle.title,
    articleTitleMr: secondArticle.titleMr,
    articleTitleHi: (secondArticle as any).titleHi,
    articleSlug: secondArticle.slug,
    articleSummary: secondArticle.summary,
    articleSummaryMr: secondArticle.summaryMr,
    articleSummaryHi: (secondArticle as any).summaryHi,
  });
}

if (!existingEdition) {
  await Edition.create({
    cities: ["Amravati", "Nagpur", "Akola"],
    citiesMr: ["अमरावती", "नागपूर", "अकोला"],
    citiesHi: ["अमरावती", "नागपुर", "अकोला"],
    date: new Date(),
    coverUrl: "/opengraph.jpg",
    pages: ["/opengraph.jpg"],
    published: true,
    viewCount: 42,
    hotspotPopupHeader: "SamacharHUB Clip",
    articleHotspots: hotspots,
  });
  console.log("✅ Sample Edition: 1 seeded with English, Marathi & Hindi cities & hotspots");
} else {
  existingEdition.cities = ["Amravati", "Nagpur", "Akola"];
  existingEdition.citiesMr = ["अमरावती", "नागपूर", "अकोला"];
  existingEdition.citiesHi = ["अमरावती", "नागपुर", "अकोला"];
  if (!existingEdition.articleHotspots || existingEdition.articleHotspots.length === 0) {
    existingEdition.articleHotspots = hotspots;
  } else {
    // Ensure existing hotspots have Hindi titles and summaries
    for (const h of existingEdition.articleHotspots) {
      if (!h.articleTitleHi && firstArticle) {
        h.articleTitleHi = (firstArticle as any).titleHi;
        h.articleSummaryHi = (firstArticle as any).summaryHi;
      }
    }
    existingEdition.markModified("articleHotspots");
  }
  await existingEdition.save();
  console.log("✅ Sample Edition: Updated with English, Marathi & Hindi cities & hotspots");
}

// ============================================================
console.log("\n🎉 SamacharHUB multilingual database seeding complete!");
console.log("━".repeat(50));
console.log(`   Admin login: admin@example.com`);
console.log(`   Password:    password123`);
console.log(`   (Backup):    admin@samacharhub.com / Admin@123`);
console.log("━".repeat(50));

await mongoose.disconnect();
process.exit(0);
