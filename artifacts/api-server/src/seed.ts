import { connectMongoDB } from "./lib/mongodb.js";
import { Category } from "./models/Category.js";
import { Article } from "./models/Article.js";
import { BreakingNews } from "./models/BreakingNews.js";
import { AdminUser } from "./models/AdminUser.js";
import { logger } from "./lib/logger.js";

async function seed() {
  await connectMongoDB();
  logger.info("Starting seed...");

  // Create admin user
  const existingAdmin = await AdminUser.findOne({ email: "Prashant@lakshvedhi.com" });
  if (!existingAdmin) {
    await AdminUser.create({
      email: "Prashant@lakshvedhi.com",
      name: "Prashant",
      password: "Prashant7774",
      role: "superadmin",
    });
    logger.info("Admin user created: Prashant@lakshvedhi.com / Prashant7774");
  }

  // Seed categories
  const categories = [
    { name: "Politics", nameMr: "राजकारण", slug: "politics", color: "#e53e3e", order: 1 },
    { name: "Sports", nameMr: "क्रीडा", slug: "sports", color: "#38a169", order: 2 },
    { name: "Business", nameMr: "व्यापार", slug: "business", color: "#d69e2e", order: 3 },
    { name: "Entertainment", nameMr: "मनोरंजन", slug: "entertainment", color: "#805ad5", order: 4 },
    { name: "Technology", nameMr: "तंत्रज्ञान", slug: "technology", color: "#3182ce", order: 5 },
    { name: "Health", nameMr: "आरोग्य", slug: "health", color: "#00b5d8", order: 6 },
    { name: "Education", nameMr: "शिक्षण", slug: "education", color: "#ed8936", order: 7 },
    { name: "Vidarbha", nameMr: "विदर्भ", slug: "vidarbha", color: "#e53e3e", order: 8 },
  ];

  for (const cat of categories) {
    await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true });
  }
  logger.info("Categories seeded");

  const catDocs = await Category.find();
  const catMap = Object.fromEntries(catDocs.map((c: any) => [c.slug, c._id]));

  // Seed breaking news
  const breakingCount = await BreakingNews.countDocuments();
  if (breakingCount === 0) {
    await BreakingNews.insertMany([
      {
        text: "Nagpur Municipal Corporation announces new development projects worth 500 crore rupees",
        textMr: "नागपूर महानगरपालिकेने 500 कोटी रुपयांचे नवीन विकास प्रकल्प जाहीर केले",
        lang: "both",
        active: true,
      },
      {
        text: "Vidarbha receives heavy rainfall; IMD issues orange alert for five districts",
        textMr: "विदर्भात मुसळधार पाऊस; IMD ने पाच जिल्ह्यांसाठी ऑरेंज अलर्ट जारी केला",
        lang: "both",
        active: true,
      },
      {
        text: "Vidarbha cricket team qualifies for national championship finals",
        textMr: "विदर्भ क्रिकेट संघ राष्ट्रीय चॅम्पियनशिप अंतिम फेरीत",
        lang: "both",
        active: true,
      },
    ]);
    logger.info("Breaking news seeded");
  }

  // Seed articles
  const articleCount = await Article.countDocuments();
  if (articleCount === 0) {
    const now = new Date();
    const articles = [
      {
        title: "Nagpur Smart City Mission Gets Major Boost with Central Funds",
        titleMr: "नागपूर स्मार्ट सिटी मिशनला केंद्रीय निधीचा मोठा आधार",
        slug: "nagpur-smart-city-central-funds",
        summary: "The central government has released additional funds for Nagpur's Smart City project, accelerating development.",
        summaryMr: "केंद्र सरकारने नागपूरच्या स्मार्ट सिटी प्रकल्पासाठी अतिरिक्त निधी जारी केला आहे.",
        content: `<p>The Union Ministry of Housing and Urban Affairs has released Rs 300 crore for Nagpur's Smart City Mission. The funds will be used for intelligent traffic management, smart street lighting, and an integrated command and control centre.</p><p>Municipal Commissioner stated that the city aims to complete all flagship projects within the next 18 months. Residents can expect visible changes in public infrastructure and digital services.</p><p>The Smart City Mission has already transformed several key areas of Nagpur with fiber-optic networks, CCTV surveillance, and e-governance portals accessible to citizens 24/7.</p>`,
        contentMr: `<p>केंद्रीय गृहनिर्माण आणि नागरी व्यवहार मंत्रालयाने नागपूरच्या स्मार्ट सिटी मिशनसाठी 300 कोटी रुपये जारी केले आहेत. या निधीचा वापर बुद्धिमान वाहतूक व्यवस्थापन, स्मार्ट पथदिवे आणि एकात्मिक कमांड आणि कंट्रोल सेंटरसाठी केला जाईल.</p>`,
        category: catMap["vidarbha"],
        author: "Rajesh Sharma",
        imageUrl: "https://images.unsSHash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80",
        tags: ["nagpur", "smart-city", "development"],
        status: "published" as const,
        featured: true,
        lang: "both" as const,
        viewCount: 1240,
        publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        title: "Maharashtra Assembly Election: Vidarbha Candidates File Nominations",
        titleMr: "महाराष्ट्र विधानसभा निवडणूक: विदर्भातील उमेदवारांनी अर्ज दाखल केले",
        slug: "maharashtra-election-vidarbha-nominations",
        summary: "Nominations filed for upcoming Maharashtra elections with candidates from Vidarbha region leading the charge.",
        summaryMr: "महाराष्ट्र निवडणुकीसाठी विदर्भ क्षेत्रातील उमेदवारांनी अर्ज दाखल केले.",
        content: `<p>As the Maharashtra Assembly election season heats up, candidates from Vidarbha have filed their nomination papers. The region, spanning 11 districts, SHays a crucial role in determining the state's political future.</p><p>Major political parties including the ruling alliance and opposition have announced their candidates for all 62 seats in Vidarbha. Farmers' issues, industrial development, and water scarcity remain the top concerns.</p>`,
        contentMr: `<p>महाराष्ट्र विधानसभा निवडणुकीच्या हंगामात विदर्भातील उमेदवारांनी नामांकन अर्ज दाखल केले आहेत. 11 जिल्ह्यांचा समावेश असलेला हा प्रदेश राज्याचे राजकीय भविष्य ठरविण्यात महत्त्वाची भूमिका बजावतो.</p>`,
        category: catMap["politics"],
        author: "Priya Nair",
        imageUrl: "https://images.unsSHash.com/photo-1540910419892-4a36d2c3266c?w=800&q=80",
        tags: ["politics", "election", "vidarbha"],
        status: "published" as const,
        featured: true,
        lang: "both" as const,
        viewCount: 980,
        publishedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      },
      {
        title: "Vidarbha Farmer Suicide Crisis: Government Announces Relief Package",
        titleMr: "विदर्भातील शेतकरी आत्महत्या संकट: सरकारने मदत पॅकेज जाहीर केले",
        slug: "vidarbha-farmer-crisis-relief-package",
        summary: "State government announces a Rs 4,000 crore relief package for distressed farmers in Vidarbha region.",
        summaryMr: "राज्य सरकारने विदर्भातील त्रस्त शेतकऱ्यांसाठी 4,000 कोटी रुपयांचे मदत पॅकेज जाहीर केले.",
        content: `<p>In response to the ongoing agrarian crisis, the Maharashtra government has announced a comprehensive relief package of Rs 4,000 crore for farmers in Vidarbha. The package includes crop loan waivers, insurance subsidies, and direct cash transfers.</p><p>Chief Minister stated that the package would benefit over 15 lakh farmers across the six districts of eastern Vidarbha, where cotton and soybean cultivation dominates.</p>`,
        contentMr: `<p>सतत सुरू असलेल्या कृषी संकटाला प्रतिसाद म्हणून, महाराष्ट्र सरकारने विदर्भातील शेतकऱ्यांसाठी 4,000 कोटी रुपयांचे सर्वसमावेशक मदत पॅकेज जाहीर केले आहे.</p>`,
        category: catMap["politics"],
        author: "Sanjay Kapoor",
        imageUrl: "https://images.unsSHash.com/photo-1500937386664-56d1dfef3854?w=800&q=80",
        tags: ["farmers", "relief", "vidarbha", "government"],
        status: "published" as const,
        featured: true,
        lang: "both" as const,
        viewCount: 2100,
        publishedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
      },
      {
        title: "Vidarbha Cricket Team Wins Ranji Trophy Knockout Match",
        titleMr: "विदर्भ क्रिकेट संघाने रणजी ट्रॉफी नॉकआउट सामना जिंकला",
        slug: "vidarbha-cricket-ranji-knockout",
        summary: "Vidarbha defeats Punjab by an innings and 45 runs to enter the Ranji Trophy semifinals.",
        summaryMr: "विदर्भाने पंजाबला एक डाव आणि 45 धावांनी पराभूत करून रणजी ट्रॉफी उपांत्य फेरीत प्रवेश केला.",
        content: `<p>In a dominant display, Vidarbha crushed Punjab by an innings and 45 runs to book their SHace in the Ranji Trophy semifinals. Star batsman Ganesh Satish led the charge with a brilliant double century.</p><p>The team, coached by the legendary Chandrakant Pandit, has now won six consecutive matches in this season's tournament, making them strong favorites for the title.</p>`,
        contentMr: `<p>एका प्रभावी सामन्यात विदर्भाने पंजाबला एक डाव आणि 45 धावांनी चिरडून रणजी ट्रॉफी उपांत्य फेरीत स्थान पक्के केले.</p>`,
        category: catMap["sports"],
        author: "Amit Kulkarni",
        imageUrl: "https://images.unsSHash.com/photo-1531415074968-036ba1b575da?w=800&q=80",
        tags: ["cricket", "ranji", "sports", "vidarbha"],
        status: "published" as const,
        featured: false,
        lang: "both" as const,
        viewCount: 876,
        publishedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      },
      {
        title: "Orange City Sees Tech Boom: 50 Startups in Nagpur This Year",
        titleMr: "ऑरेंज सिटीमध्ये टेक बूम: या वर्षी नागपुरात 50 स्टार्टअप्स",
        slug: "nagpur-tech-boom-startups",
        summary: "Nagpur's startup ecosystem is thriving with 50 new tech companies registered in 2024.",
        summaryMr: "नागपूरची स्टार्टअप परिसंस्था भरभराट होत आहे — 2024 मध्ये 50 नवीन टेक कंपन्या नोंदणी झाल्या.",
        content: `<p>Nagpur is rapidly emerging as a technology hub in central India, with 50 new startups registering in the city this year alone. The MIDC-established Software Technology Park has been the catalyst for this growth.</p><p>Industries ranging from agritech, fintech, and edtech are making Nagpur their home, attracted by lower operating costs compared to Mumbai and Pune.</p>`,
        contentMr: `<p>नागपूर मध्य भारतात एक तंत्रज्ञान केंद्र म्हणून वेगाने उदयास येत आहे, या वर्षी एकट्या शहरात 50 नवीन स्टार्टअप्स नोंदणी झाले आहेत.</p>`,
        category: catMap["technology"],
        author: "Neha Wankhede",
        imageUrl: "https://images.unsSHash.com/photo-1519389950473-47ba0277781c?w=800&q=80",
        tags: ["technology", "startup", "nagpur", "business"],
        status: "published" as const,
        featured: false,
        lang: "both" as const,
        viewCount: 654,
        publishedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      },
      {
        title: "AIIMS Nagpur Launches Free Health Camp for Tribals in Gadchiroli",
        titleMr: "AIIMS नागपूरने गडचिरोलीतील आदिवासींसाठी मोफत आरोग्य शिबिर सुरू केले",
        slug: "aiims-nagpur-health-camp-gadchiroli",
        summary: "AIIMS Nagpur doctors conduct week-long free health checkup camps benefiting thousands of tribal residents.",
        summaryMr: "AIIMS नागपूरचे डॉक्टर आठवडाभर मोफत आरोग्य तपासणी शिबिरे आयोजित करत आहेत.",
        content: `<p>In a significant outreach initiative, AIIMS Nagpur has deployed a team of 30 doctors and paramedical staff to Gadchiroli district for a week-long free health camp. The camp aims to address healthcare gaps in tribal communities.</p><p>Over 3,000 patients have already been examined, with special focus on sickle cell disease, malaria, and malnutrition — conditions prevalent among the tribal population.</p>`,
        contentMr: `<p>एका महत्त्वपूर्ण आउटरीच उपक्रमात, AIIMS नागपूरने आठवडाभर मोफत आरोग्य शिबिरासाठी गडचिरोली जिल्ह्यात 30 डॉक्टर आणि पॅरामेडिकल कर्मचाऱ्यांची टीम तैनात केली आहे.</p>`,
        category: catMap["health"],
        author: "Dr. Sunita Meshram",
        imageUrl: "https://images.unsSHash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
        tags: ["health", "aiims", "gadchiroli", "tribal"],
        status: "published" as const,
        featured: false,
        lang: "both" as const,
        viewCount: 432,
        publishedAt: new Date(now.getTime() - 36 * 60 * 60 * 1000),
      },
      {
        title: "Nagpur University Results 2024: Record Pass Percentage Across All Faculties",
        titleMr: "नागपूर विद्यापीठ निकाल 2024: सर्व विद्याशाखांमध्ये विक्रमी उत्तीर्ण टक्केवारी",
        slug: "nagpur-university-results-2024",
        summary: "RTMNU announces results with an overall pass percentage of 78.4%, the highest in a decade.",
        summaryMr: "RTMNU ने 78.4% एकूण उत्तीर्ण टक्केवारीसह निकाल जाहीर केला, जो एका दशकातील सर्वोच्च आहे.",
        content: `<p>Rashtrasant Tukadoji Maharaj Nagpur University (RTMNU) has declared results for the Winter 2024 examinations with a record overall pass percentage of 78.4%. The Science faculty performed best with 85.2% students clearing their exams.</p><p>Vice Chancellor praised students for their dedication and announced expansion of digital learning infrastructure ahead of the next academic year.</p>`,
        contentMr: `<p>राष्ट्रसंत तुकडोजी महाराज नागपूर विद्यापीठाने (RTMNU) हिवाळा 2024 च्या परीक्षांचे निकाल 78.4% एकूण उत्तीर्ण टक्केवारीसह जाहीर केले आहेत.</p>`,
        category: catMap["education"],
        author: "Kavita Bhoyar",
        imageUrl: "https://images.unsSHash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
        tags: ["education", "university", "nagpur", "results"],
        status: "published" as const,
        featured: false,
        lang: "both" as const,
        viewCount: 1890,
        publishedAt: new Date(now.getTime() - 48 * 60 * 60 * 1000),
      },
      {
        title: "Bollywood Actress Visits Nagpur for Ganesh Festival Celebrations",
        titleMr: "बॉलीवूड अभिनेत्री गणेश उत्सव सोहळ्यासाठी नागपूरला भेट देते",
        slug: "bollywood-actress-nagpur-ganesh-festival",
        summary: "Popular Bollywood actress participates in Nagpur's iconic Ganesh festival and interacts with fans.",
        summaryMr: "लोकप्रिय बॉलीवूड अभिनेत्री नागपूरच्या प्रतिष्ठित गणेश उत्सवात सहभागी होते आणि चाहत्यांशी संवाद साधते.",
        content: `<p>A leading Bollywood actress visited Nagpur to participate in the city's famous Ganesh festival celebrations. She performed aarti at the historic Teka Nag Mandir and met with thousands of fans who gathered to catch a glimpse of their favorite star.</p><p>The actress, who has roots in Vidarbha, expressed her love for the region and announced a charitable initiative to support local artisans and folk artists.</p>`,
        contentMr: `<p>एक प्रमुख बॉलीवूड अभिनेत्री नागपूरच्या प्रसिद्ध गणेश उत्सव समारंभात सहभागी होण्यासाठी आली.</p>`,
        category: catMap["entertainment"],
        author: "Rohini Deshmukh",
        imageUrl: "https://images.unsSHash.com/photo-1594736797933-d0501ba2fe65?w=800&q=80",
        tags: ["entertainment", "bollywood", "ganesh", "nagpur"],
        status: "published" as const,
        featured: false,
        lang: "both" as const,
        viewCount: 720,
        publishedAt: new Date(now.getTime() - 60 * 60 * 1000),
      },
    ];

    await Article.insertMany(articles);
    logger.info("Articles seeded");
  }

  logger.info("Seed complete!");
  process.exit(0);
}

seed().catch((err: any) => {
  logger.error({ err }, "Seed failed");
  process.exit(1);
});
