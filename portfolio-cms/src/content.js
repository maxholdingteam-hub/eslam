// Content model shared by the public site, the admin editor and the CV importer.
// Every user-facing text is bilingual: { en, ar }. Inside text, *word* marks an accent.

export const ICONS = ["chart", "trend", "leads", "star", "report", "team", "megaphone", "target", "code", "camera", "pen", "globe"];
export const THEMES = ["navy-gold", "black-orange", "emerald", "plum"];

const i18n = { type: "i18n" };
const i18nArea = { type: "i18n", multiline: true };

// Field schema used to build the admin editor (and to validate saved content).
export const SCHEMA = [
  { key: "profile", label: "Profile", labelAr: "البيانات الأساسية", type: "object", fields: [
    { key: "firstName", label: "First name", ...i18n },
    { key: "lastName", label: "Last name", ...i18n },
    { key: "monogram", label: "Monogram (2 letters)", type: "text" },
    { key: "eyebrow", label: "Small line above the name", ...i18n },
    { key: "role", label: "Headline (use *word* for gold accent)", ...i18nArea },
    { key: "lead", label: "Intro paragraph", ...i18nArea },
    { key: "location", label: "Location", ...i18n },
    { key: "currently", label: "Currently at", ...i18n },
    { key: "available", label: "Show 'open to opportunities'", type: "bool" },
    { key: "photo", label: "Photo (optional — monogram is used if empty)", type: "image" },
    { key: "email", label: "Email", type: "text" },
    { key: "phone", label: "Phone (international format)", type: "text" },
    { key: "whatsapp", label: "WhatsApp number (digits only, with country code)", type: "text" },
    { key: "linkedin", label: "LinkedIn URL", type: "text" },
    { key: "instagram", label: "Instagram URL", type: "text" },
    { key: "tiktok", label: "TikTok URL", type: "text" },
    { key: "website", label: "Website URL", type: "text" },
    { key: "cvFile", label: "CV file to download (optional PDF)", type: "file" },
  ]},
  { key: "stats", label: "Numbers", labelAr: "الأرقام", type: "list", itemLabel: "label", max: 4, fields: [
    { key: "value", label: "Number", type: "text" },
    { key: "suffix", label: "Suffix (e.g. +)", type: "text" },
    { key: "label", label: "Label", ...i18n },
  ]},
  { key: "about", label: "About", labelAr: "نبذة", type: "object", fields: [
    { key: "big", label: "Big statement (use *word* for accent)", ...i18nArea },
    { key: "paragraphs", label: "Paragraphs", type: "list", fields: [{ key: "text", label: "Paragraph", ...i18nArea }] },
    { key: "tags", label: "Industries / tags", type: "list", fields: [{ key: "text", label: "Tag", ...i18n }] },
  ]},
  { key: "expertise", label: "Expertise", labelAr: "مجالات الخبرة", type: "list", itemLabel: "title", fields: [
    { key: "icon", label: "Icon", type: "select", options: ICONS },
    { key: "title", label: "Title", ...i18n },
    { key: "text", label: "Description", ...i18nArea },
  ]},
  { key: "marquee", label: "Moving strip words", labelAr: "الشريط المتحرك", type: "list", fields: [{ key: "text", label: "Word", type: "text" }] },
  { key: "experience", label: "Experience", labelAr: "الخبرات", type: "list", itemLabel: "role", fields: [
    { key: "role", label: "Job title", ...i18n },
    { key: "company", label: "Company", ...i18n },
    { key: "period", label: "Period", ...i18n },
    { key: "location", label: "Location", ...i18n },
    { key: "current", label: "Current job", type: "bool" },
    { key: "bullets", label: "Responsibilities", type: "list", fields: [{ key: "text", label: "Point", ...i18nArea }] },
    { key: "clients", label: "Key clients (optional)", type: "list", fields: [{ key: "text", label: "Client", ...i18n }] },
  ]},
  { key: "achievements", label: "Achievements", labelAr: "الإنجازات", type: "list", fields: [{ key: "text", label: "Achievement", ...i18nArea }] },
  { key: "skills", label: "Skills", labelAr: "المهارات", type: "list", itemLabel: "name", fields: [
    { key: "name", label: "Skill", ...i18n },
    { key: "level", label: "Level (0–100)", type: "number" },
  ]},
  { key: "tools", label: "Tools & platforms", labelAr: "الأدوات", type: "list", fields: [{ key: "text", label: "Tool", type: "text" }] },
  { key: "education", label: "Education", labelAr: "التعليم", type: "list", itemLabel: "degree", fields: [
    { key: "degree", label: "Degree", ...i18n },
    { key: "school", label: "School · year", ...i18n },
  ]},
  { key: "languages", label: "Languages", labelAr: "اللغات", type: "list", itemLabel: "name", fields: [
    { key: "name", label: "Language — level", ...i18n },
    { key: "level", label: "Dots (1–5)", type: "number" },
  ]},
  { key: "certifications", label: "Certifications", labelAr: "الشهادات", type: "object", fields: [
    { key: "intro", label: "Intro line", ...i18nArea },
    { key: "items", label: "Items", type: "list", itemLabel: "title", fields: [
      { key: "title", label: "Title", ...i18n },
      { key: "detail", label: "Detail", ...i18n },
    ]},
  ]},
  { key: "projects", label: "Projects", labelAr: "المشاريع", type: "list", itemLabel: "title", fields: [
    { key: "title", label: "Title (use *word* for accent)", ...i18n },
    { key: "tag", label: "Category", ...i18n },
    { key: "url", label: "Link", type: "text" },
    { key: "description", label: "Description", ...i18nArea },
    { key: "features", label: "Highlights", type: "list", fields: [{ key: "text", label: "Highlight", ...i18n }] },
    { key: "image", label: "Desktop screenshot / main image", type: "image" },
    { key: "imageMobile", label: "Mobile screenshot (optional)", type: "image" },
  ]},
  { key: "contact", label: "Contact section", labelAr: "التواصل", type: "object", fields: [
    { key: "heading", label: "Heading (use *word* for accent, | for a line break)", ...i18n },
    { key: "text", label: "Text", ...i18nArea },
    { key: "address", label: "Address", ...i18n },
    { key: "formEnabled", label: "Show contact form", type: "bool" },
  ]},
  { key: "settings", label: "Look & SEO", labelAr: "الشكل والبحث", type: "object", fields: [
    { key: "theme", label: "Color theme", type: "select", options: THEMES },
    { key: "defaultLang", label: "Default language", type: "select", options: ["en", "ar"] },
    { key: "seoTitle", label: "Google title", ...i18n },
    { key: "seoDescription", label: "Google description", ...i18nArea },
    { key: "ogImage", label: "Share image (WhatsApp / social preview)", type: "image" },
  ]},
];

const t = (en, ar) => ({ en, ar });
const L = (arr) => arr.map((x) => ({ text: x }));

// Starter content (Ahmed Zahran) so the site works on first deploy.
export const DEFAULT_CONTENT = {
  profile: {
    firstName: t("Ahmed", "أحمد"), lastName: t("Zahran", "زهران"), monogram: "AZ",
    eyebrow: t("Marketing Manager · Riyadh", "مدير تسويق · الرياض"),
    role: t("Growth Marketing Strategist who turns *ad spend* into measurable growth.", "خبير تسويق نمو يحوّل *ميزانية الإعلانات* إلى نمو حقيقي قابل للقياس."),
    lead: t("8+ years building marketing departments and running high-performance campaigns across Healthcare, Automotive, ERP, Retail and FMCG in Saudi Arabia, the UAE and Egypt.", "أكثر من 8 سنوات في بناء أقسام التسويق وإدارة حملات إعلانية عالية الأداء في قطاعات الرعاية الصحية والسيارات وأنظمة ERP والتجزئة والسلع الاستهلاكية في السعودية والإمارات ومصر."),
    location: t("Riyadh, Saudi Arabia", "الرياض، المملكة العربية السعودية"),
    currently: t("Currently at Max Motors", "حالياً في ماكس موتورز"),
    available: true, photo: "",
    email: "ahmedzahran.mp@gmail.com", phone: "+966 50 164 4612", whatsapp: "966501644612",
    linkedin: "", instagram: "", tiktok: "", website: "", cvFile: "",
  },
  stats: [
    { value: "8", suffix: "+", label: t("Years of digital marketing experience", "سنوات من الخبرة في التسويق الرقمي") },
    { value: "5", suffix: "+", label: t("Industries: Healthcare, Automotive, ERP, Retail, FMCG", "قطاعات: صحة، سيارات، ERP، تجزئة، سلع استهلاكية") },
    { value: "3", suffix: "", label: t("Markets: Saudi Arabia, UAE & Egypt", "أسواق: السعودية والإمارات ومصر") },
    { value: "7", suffix: "+", label: t("Brands served as a freelance strategist & designer", "علامات تجارية خدمها كمستشار ومصمم مستقل") },
  ],
  about: {
    big: t("Results-driven marketer who builds *departments from scratch*, leads cross-functional teams, and aligns every campaign with *real business objectives*.", "مسوّق يركّز على النتائج، يبني *أقسام التسويق من الصفر*، ويقود فرقاً متعددة التخصصات، ويربط كل حملة *بأهداف العمل الفعلية*."),
    paragraphs: L([
      t("Proven expertise in developing integrated marketing strategies and managing high-performance advertising across *Google Ads, Meta Ads, Snapchat Ads and TikTok Ads*.", "خبرة مثبتة في بناء استراتيجيات تسويق متكاملة وإدارة حملات إعلانية عالية الأداء على *Google Ads وMeta Ads وSnapchat Ads وTikTok Ads*."),
      t("Drives growth through *data-driven decision-making*: customer acquisition, lead generation, branding, CRM optimization, marketing automation and conversion rate optimization.", "يقود النمو عبر *قرارات مبنية على البيانات*: استقطاب العملاء، توليد العملاء المحتملين، بناء العلامة، تحسين CRM، أتمتة التسويق وتحسين معدلات التحويل."),
      t("Manages budgets, analyses KPIs and leads creative teams to deliver measurable results and sustainable brand growth.", "يدير الميزانيات ويحلل مؤشرات الأداء ويقود الفرق الإبداعية لتحقيق نتائج ملموسة ونمو مستدام للعلامة التجارية."),
    ]),
    tags: L([t("Healthcare", "الرعاية الصحية"), t("Automotive", "السيارات"), t("ERP", "ERP"), t("Retail", "التجزئة"), t("FMCG", "السلع الاستهلاكية"), t("Pharma", "الأدوية"), t("Beauty", "التجميل")]),
  },
  expertise: [
    { icon: "chart", title: t("Marketing Strategy", "استراتيجية التسويق"), text: t("Annual plans across online & offline channels, tied to business goals and budgets.", "خطط سنوية للقنوات الرقمية والتقليدية مرتبطة بأهداف العمل والميزانية.") },
    { icon: "trend", title: t("Performance Marketing", "التسويق بالأداء"), text: t("Google, Meta, Snapchat & TikTok campaigns built and optimized for ROI.", "حملات Google وMeta وSnapchat وTikTok مبنية ومحسّنة لأعلى عائد.") },
    { icon: "leads", title: t("Lead Generation & CRM", "توليد العملاء و CRM"), text: t("Funnels, call-center alignment and CRM integration that turn clicks into bookings.", "مسارات تحويل وتنسيق مع الكول سنتر وربط CRM لتحويل النقرات إلى حجوزات.") },
    { icon: "star", title: t("Brand Management", "إدارة العلامة التجارية"), text: t("Brand identity, positioning, packaging and consistent creative across every channel.", "هوية بصرية وتموضع وتغليف ومحتوى متناسق على كل القنوات.") },
    { icon: "report", title: t("Analytics & Reporting", "التحليلات والتقارير"), text: t("KPI dashboards, GA & GTM tracking and monthly insights for data-driven decisions.", "لوحات مؤشرات أداء وتتبع GA وGTM وتقارير شهرية لقرارات مبنية على البيانات.") },
    { icon: "team", title: t("Team & Creative Leadership", "قيادة الفرق الإبداعية"), text: t("Leading designers, media producers, agencies and in-house teams to deliver.", "قيادة المصممين وفرق الإنتاج والوكالات والفرق الداخلية لتسليم النتائج.") },
  ],
  marquee: L(["Google Ads", "Meta Ads", "Snapchat Ads", "TikTok Ads", "Lead Generation", "CRO", "Brand Strategy", "Analytics"]),
  experience: [
    { role: t("Marketing Manager", "مدير التسويق"), company: t("Max Motors", "ماكس موتورز"), period: t("Oct 2025 — Present", "أكتوبر 2025 — حتى الآن"), location: t("Riyadh, Saudi Arabia", "الرياض، السعودية"), current: true,
      bullets: L([t("Develop and execute the company's annual marketing strategy across online and offline channels.", "وضع وتنفيذ الخطة التسويقية السنوية للشركة عبر القنوات الرقمية والتقليدية."), t("Manage multi-platform advertising campaigns (Google Ads, Meta Ads, Snapchat Ads, TikTok Ads).", "إدارة الحملات الإعلانية على عدة منصات (Google وMeta وSnapchat وTikTok)."), t("Oversee marketing budget, performance and ROI to drive lead generation and sales growth.", "الإشراف على الميزانية التسويقية والأداء والعائد لزيادة العملاء المحتملين والمبيعات."), t("Lead creative production (photo, video, design) and manage external agencies and the internal team.", "قيادة الإنتاج الإبداعي (تصوير، فيديو، تصميم) وإدارة الوكالات الخارجية والفريق الداخلي."), t("Create marketing dashboards and KPI reports for data-driven decision making.", "إعداد لوحات تسويقية وتقارير مؤشرات أداء لدعم القرارات المبنية على البيانات.")]), clients: [] },
    { role: t("Marketing Manager", "مدير التسويق"), company: t("Mila Najd Medical Complex", "مجمع ميلا نجد الطبي"), period: t("Sep 2025 — Mar 2026", "سبتمبر 2025 — مارس 2026"), location: t("Riyadh, Saudi Arabia", "الرياض، السعودية"), current: false,
      bullets: L([t("Developed and implemented marketing strategies to increase brand awareness and patient bookings.", "وضع وتنفيذ استراتيجيات تسويقية لرفع الوعي بالعلامة وزيادة حجوزات المرضى."), t("Managed advertising campaigns across Google, Meta and Snapchat.", "إدارة الحملات الإعلانية على Google وMeta وSnapchat."), t("Worked closely with Call Center and sales teams to improve conversion rates and patient flow.", "العمل مع فريقي الكول سنتر والمبيعات لتحسين معدلات التحويل وتدفق المرضى."), t("Led content creation, designers and media production for all marketing channels.", "قيادة صناعة المحتوى والمصممين والإنتاج المرئي لجميع القنوات."), t("Monitored performance, analyzed data and delivered monthly marketing reports and insights.", "متابعة الأداء وتحليل البيانات وتقديم تقارير ورؤى تسويقية شهرية.")]), clients: [] },
    { role: t("Freelance Digital Marketer & Graphic Designer", "مسوّق رقمي ومصمم جرافيك مستقل"), company: t("Self-employed", "عمل حر"), period: t("2019 — Present", "2019 — حتى الآن"), location: t("Egypt · KSA · UAE", "مصر · السعودية · الإمارات"), current: false,
      bullets: L([t("Digital marketing and branding services for companies in healthcare, pharmaceuticals, beauty and FMCG.", "تقديم خدمات التسويق الرقمي وبناء العلامات لشركات في الرعاية الصحية والأدوية والتجميل والسلع الاستهلاكية."), t("Develop marketing strategies, run performance campaigns and optimize for maximum ROI.", "وضع الاستراتيجيات التسويقية وإدارة حملات الأداء وتحسينها لأعلى عائد."), t("Design branding materials, packaging, landing pages and digital creatives.", "تصميم الهويات والتغليف وصفحات الهبوط والمواد الإعلانية الرقمية.")]),
      clients: L([t("International Center for Obesity & Slimming", "المركز الدولي للسمنة والنحافة"), t("Obesity Company", "Obesity Company"), t("Herbal Bank", "Herbal Bank"), t("Al-Zahid Pharmaceuticals & Medical Equipment (Adol Agency — UAE)", "الزاهد للأدوية والمستلزمات الطبية (Adol Agency — الإمارات)"), t("Dr. Hesham Abdel Sattar", "د. هشام عبد الستار"), t("Nutrition Pharma", "Nutrition Pharma"), t("ONZ Media Advertising", "ONZ Media Advertising")]) },
    { role: t("Production Supervisor", "مشرف إنتاج"), company: t("Al Shams TV", "قناة الشمس"), period: t("2013 — 2018", "2013 — 2018"), location: t("Egypt", "مصر"), current: false,
      bullets: L([t("Supervised production and graphics for two TV programs: Top Trend and The Seventh World with TV presenter Heba El-Zayyad.", "الإشراف على الإنتاج والجرافيكس لبرنامجين تلفزيونيين: «توب تريند» و«العالم السابع» مع الإعلامية هبة الزياد.")]), clients: [] },
    { role: t("Procurement Officer", "مسؤول مشتريات"), company: t("Zahran Market", "زهران ماركت"), period: t("2011 — 2013", "2011 — 2013"), location: t("Egypt", "مصر"), current: false,
      bullets: L([t("Managed procurement and supply chain processes, ensuring operational efficiency.", "إدارة عمليات الشراء وسلاسل الإمداد بكفاءة تشغيلية عالية."), t("Handled supplier relationships, purchasing and inventory management.", "إدارة العلاقات مع الموردين والمشتريات والمخزون.")]), clients: [] },
  ],
  achievements: L([
    t("Built and managed marketing departments from scratch for multiple companies.", "بناء وإدارة أقسام تسويق من الصفر لعدة شركات."),
    t("Increased qualified leads and appointment bookings through data-driven campaigns.", "زيادة العملاء المحتملين المؤهلين وحجوزات المواعيد عبر حملات مبنية على البيانات."),
    t("Managed multi-channel advertising budgets and achieved high ROI.", "إدارة ميزانيات إعلانية متعددة القنوات وتحقيق عائد مرتفع."),
    t("Developed and executed successful brand strategies across multiple industries.", "وضع وتنفيذ استراتيجيات ناجحة للعلامات التجارية في قطاعات متعددة."),
    t("Improved conversion rates through funnel optimization and CRM integration.", "رفع معدلات التحويل عبر تحسين مسارات البيع وربط أنظمة CRM."),
  ]),
  skills: [
    { name: t("Strategic Marketing", "التسويق الاستراتيجي"), level: 95 }, { name: t("Performance Marketing", "التسويق بالأداء"), level: 92 },
    { name: t("Campaign Management", "إدارة الحملات"), level: 92 }, { name: t("Data Analysis & Reporting", "تحليل البيانات والتقارير"), level: 85 },
    { name: t("Branding & Design", "العلامة التجارية والتصميم"), level: 88 }, { name: t("Team Leadership", "قيادة الفرق"), level: 90 },
    { name: t("CRM & Automation", "CRM والأتمتة"), level: 84 }, { name: t("Budget Management", "إدارة الميزانيات"), level: 88 },
  ],
  tools: L(["Google Ads", "Meta Business Suite", "Snapchat Ads Manager", "TikTok Ads Manager", "Google Analytics", "Google Tag Manager", "Canva"]),
  education: [{ degree: t("Bachelor of Arts — Sociology", "بكالوريوس آداب — علم الاجتماع"), school: t("Ain Shams University · Class of 2013", "جامعة عين شمس · دفعة 2013") }],
  languages: [{ name: t("Arabic — Native", "العربية — اللغة الأم"), level: 5 }, { name: t("English — Basic", "الإنجليزية — أساسي"), level: 2 }],
  certifications: {
    intro: t("Digital Marketing & Graphic Design courses with Ahmed Morshed, Mind Shift and Egulf Hacking.", "دورات في التسويق الرقمي والتصميم الجرافيكي مع أحمد مرشد وMind Shift وEgulf Hacking."),
    items: [
      { title: t("Paid Advertising", "الإعلانات المدفوعة"), detail: t("Meta Ads, TikTok Ads, Snapchat Ads", "Meta Ads وTikTok Ads وSnapchat Ads") },
      { title: t("Graphic Design", "التصميم الجرافيكي"), detail: t("Digital & print media, GIFs, interactive ads", "الوسائط الرقمية والمطبوعة والإعلانات التفاعلية") },
      { title: t("Brand Identity", "الهوية البصرية"), detail: t("Logo creation, packaging, visual branding", "تصميم الشعارات والتغليف والهوية") },
      { title: t("Marketing Optimization", "تحسين التسويق"), detail: t("Data analysis & performance tracking", "تحليل البيانات وتتبع الأداء") },
      { title: t("Analytics Tools", "أدوات التحليل"), detail: t("Google Analytics (Intermediate), GTM (Beginner)", "Google Analytics (متوسط) وGTM (مبتدئ)") },
      { title: t("Web Development", "تطوير الويب"), detail: t("Landing pages & online stores (YouCan, Easy Order)", "صفحات الهبوط والمتاجر الإلكترونية (YouCan وEasy Order)") },
    ],
  },
  projects: [
    { title: t("Max *Design*", "ماكس *ديزاين*"), tag: t("Website · Brand experience", "موقع إلكتروني · تجربة علامة"), url: "https://maxdesign.sa/",
      description: t("A bilingual luxury website for an interior design studio in Saudi Arabia, built to turn visitors into qualified project briefs.", "موقع فاخر بلغتين لاستوديو تصميم داخلي في السعودية، مصمم لتحويل الزوار إلى طلبات مشاريع جاهزة."),
      features: L([t("Animated gold particle logo & cinematic scroll journey", "شعار متحرك بجزيئات ذهبية ورحلة سينمائية مع التمرير"), t("Immersive 360° villa tour", "جولة افتراضية 360° داخل فيلا"), t("Find-your-style quiz that sends a full project brief to WhatsApp", "اختبار «اكتشف ستايلك» يرسل ملخص المشروع كاملاً على واتساب"), t("Arabic / English, SEO-ready, fast on mobile", "عربي / إنجليزي، مهيأ لمحركات البحث وسريع على الجوال")]),
      image: "/seed/maxdesign-desktop.webp", imageMobile: "/seed/maxdesign-mobile.webp" },
  ],
  contact: {
    heading: t("Let's grow|your *brand*.", "خلّينا نكبّر|*علامتك*."),
    text: t("Looking for a marketing leader who can build the team, own the budget and deliver the numbers? Let's talk.", "تبحث عن قائد تسويق يبني الفريق ويدير الميزانية ويحقق الأرقام؟ تواصل معي."),
    address: t("Riyadh, Al-Shumaisi District", "الرياض، حي الشميسي"),
    formEnabled: true,
  },
  settings: {
    theme: "navy-gold", defaultLang: "en",
    seoTitle: t("Ahmed Zahran — Marketing Manager", "أحمد زهران — مدير تسويق"),
    seoDescription: t("Marketing Manager & Growth Marketing Strategist based in Riyadh. 8+ years across Healthcare, Automotive, ERP, Retail and FMCG.", "مدير تسويق وخبير تسويق نمو في الرياض. أكثر من 8 سنوات في الرعاية الصحية والسيارات وERP والتجزئة والسلع الاستهلاكية."),
    ogImage: "",
  },
};

// ---------- normalisation: make any incoming JSON match the schema ----------

function normField(f, v) {
  switch (f.type) {
    case "i18n": {
      const o = v && typeof v === "object" ? v : { en: typeof v === "string" ? v : "", ar: "" };
      return { en: String(o.en ?? "").slice(0, 4000), ar: String(o.ar ?? "").slice(0, 4000) };
    }
    case "text": case "image": case "file": return String(v ?? "").slice(0, 2000);
    case "select": return f.options.includes(v) ? v : f.options[0];
    case "bool": return Boolean(v);
    case "number": { const n = Number(v); return Number.isFinite(n) ? n : 0; }
    case "object": return normObject(f.fields, v);
    case "list": {
      const arr = Array.isArray(v) ? v : [];
      return arr.slice(0, f.max || 60).map((item) => normObject(f.fields, item));
    }
  }
  return v;
}
function normObject(fields, v) {
  const o = v && typeof v === "object" ? v : {};
  const out = {};
  for (const f of fields) out[f.key] = normField(f, o[f.key]);
  return out;
}
export function normalizeContent(data) {
  return normObject(SCHEMA, data);
}

// ---------- JSON schema for the CV importer (structured output) ----------

function jsonSchemaFor(f) {
  const I = { type: "object", properties: { en: { type: "string" }, ar: { type: "string" } }, required: ["en", "ar"], additionalProperties: false };
  switch (f.type) {
    case "i18n": return I;
    case "text": return { type: "string" };
    case "bool": return { type: "boolean" };
    case "number": return { type: "number" };
    case "select": return { type: "string", enum: f.options };
    case "object": return objSchema(f.fields);
    case "list": return { type: "array", items: objSchema(f.fields) };
  }
  return null;
}
function objSchema(fields) {
  const properties = {}; const required = [];
  for (const f of fields) {
    if (f.type === "image" || f.type === "file") continue; // images are never invented
    properties[f.key] = jsonSchemaFor(f); required.push(f.key);
  }
  return { type: "object", properties, required, additionalProperties: false };
}
// The importer fills everything except look/SEO settings and projects' images.
export function cvJsonSchema() {
  return objSchema(SCHEMA.filter((s) => s.key !== "settings"));
}
