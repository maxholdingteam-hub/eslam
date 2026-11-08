// Company portfolio content model (shared by the site, the admin editor and the profile importer).
// Every visible text is bilingual { en, ar }. Inside text, *word* = accent colour, | = line break.

export const ICONS = ["building", "design", "chart", "megaphone", "code", "camera", "truck", "shield", "leaf", "tools", "team", "star", "globe", "target", "car", "heart"];
export const THEMES = ["navy-gold", "black-orange", "emerald", "plum", "light"];

const i18n = { type: "i18n" };
const area = { type: "i18n", multiline: true };

export const SCHEMA = [
  { key: "brand", label: "Company", type: "object", fields: [
    { key: "name", label: "Company name", ...i18n },
    { key: "short", label: "Short name / initials for the logo badge", type: "text" },
    { key: "logo", label: "Logo (light version for dark background)", type: "image" },
    { key: "tagline", label: "Small line above the headline", ...i18n },
    { key: "headline", label: "Headline (*word* = accent, | = new line)", ...area },
    { key: "intro", label: "Intro paragraph", ...area },
    { key: "heroImage", label: "Hero background image", type: "image" },
    { key: "profileFile", label: "Company profile PDF to download (optional)", type: "file" },
  ]},
  { key: "stats", label: "Numbers", type: "list", max: 4, itemLabel: "label", fields: [
    { key: "value", label: "Number", type: "text" },
    { key: "suffix", label: "Suffix (+, %, K…)", type: "text" },
    { key: "label", label: "Label", ...i18n },
  ]},
  { key: "about", label: "About", type: "object", fields: [
    { key: "title", label: "Title (*word* = accent)", ...i18n },
    { key: "story", label: "Our story", ...area },
    { key: "vision", label: "Vision", ...area },
    { key: "mission", label: "Mission", ...area },
    { key: "image", label: "Image", type: "image" },
    { key: "values", label: "Values", type: "list", fields: [{ key: "text", label: "Value", ...i18n }] },
  ]},
  { key: "services", label: "Services", type: "list", itemLabel: "title", fields: [
    { key: "icon", label: "Icon", type: "select", options: ICONS },
    { key: "title", label: "Service", ...i18n },
    { key: "text", label: "Description", ...area },
  ]},
  { key: "projects", label: "Projects", type: "list", itemLabel: "title", fields: [
    { key: "title", label: "Project name", ...i18n },
    { key: "category", label: "Category (used for filters)", ...i18n },
    { key: "client", label: "Client", ...i18n },
    { key: "location", label: "Location", ...i18n },
    { key: "year", label: "Year", type: "text" },
    { key: "description", label: "Description", ...area },
    { key: "cover", label: "Cover image", type: "image" },
    { key: "gallery", label: "More images", type: "list", fields: [{ key: "src", label: "Image", type: "image" }] },
    { key: "url", label: "Link (optional)", type: "text" },
    { key: "featured", label: "Show large (featured)", type: "bool" },
  ]},
  { key: "process", label: "How we work", type: "list", itemLabel: "title", fields: [
    { key: "title", label: "Step", ...i18n },
    { key: "text", label: "Description", ...area },
  ]},
  { key: "clients", label: "Clients & partners", type: "list", itemLabel: "name", fields: [
    { key: "name", label: "Name", type: "text" },
    { key: "logo", label: "Logo (optional)", type: "image" },
  ]},
  { key: "testimonials", label: "Testimonials", type: "list", itemLabel: "name", fields: [
    { key: "quote", label: "Quote", ...area },
    { key: "name", label: "Name", ...i18n },
    { key: "role", label: "Role · company", ...i18n },
  ]},
  { key: "team", label: "Team", type: "list", itemLabel: "name", fields: [
    { key: "name", label: "Name", ...i18n },
    { key: "role", label: "Role", ...i18n },
    { key: "photo", label: "Photo (optional)", type: "image" },
  ]},
  { key: "contact", label: "Contact", type: "object", fields: [
    { key: "heading", label: "Heading (*word* = accent, | = new line)", ...i18n },
    { key: "text", label: "Text", ...area },
    { key: "phone", label: "Phone", type: "text" },
    { key: "whatsapp", label: "WhatsApp (digits with country code)", type: "text" },
    { key: "email", label: "Email", type: "text" },
    { key: "address", label: "Address", ...i18n },
    { key: "mapUrl", label: "Google Maps link", type: "text" },
    { key: "hours", label: "Working hours", ...i18n },
    { key: "instagram", label: "Instagram", type: "text" },
    { key: "linkedin", label: "LinkedIn", type: "text" },
    { key: "x", label: "X (Twitter)", type: "text" },
    { key: "tiktok", label: "TikTok", type: "text" },
    { key: "snapchat", label: "Snapchat", type: "text" },
    { key: "youtube", label: "YouTube", type: "text" },
    { key: "formEnabled", label: "Show request form", type: "bool" },
  ]},
  { key: "settings", label: "Look & SEO", type: "object", fields: [
    { key: "theme", label: "Colour theme", type: "select", options: THEMES },
    { key: "defaultLang", label: "Default language", type: "select", options: ["ar", "en"] },
    { key: "seoTitle", label: "Google title", ...i18n },
    { key: "seoDescription", label: "Google description", ...area },
    { key: "ogImage", label: "Share preview image", type: "image" },
  ]},
];

const t = (en, ar) => ({ en, ar });
const L = (a) => a.map((x) => ({ text: x }));

// Neutral starter content — replaced from the dashboard (or by importing the company profile).
export const DEFAULT_CONTENT = {
  brand: {
    name: t("Company Name", "اسم الشركة"), short: "CO", logo: "",
    tagline: t("Riyadh · Since 2015", "الرياض · منذ 2015"),
    headline: t("We build *ideas*|that last.", "نبني *أفكاراً*|تدوم."),
    intro: t("A short introduction to the company: what you do, who you serve and why clients choose you. Edit this from the dashboard.", "تعريف مختصر بالشركة: ماذا تقدّم، ولمن، ولماذا يختارها العملاء. عدّل هذا النص من لوحة التحكم."),
    heroImage: "", profileFile: "",
  },
  stats: [
    { value: "10", suffix: "+", label: t("Years of experience", "سنوات خبرة") },
    { value: "120", suffix: "+", label: t("Projects delivered", "مشروع منجز") },
    { value: "60", suffix: "+", label: t("Happy clients", "عميل") },
    { value: "3", suffix: "", label: t("Countries", "دول") },
  ],
  about: {
    title: t("About *us*", "من *نحن*"),
    story: t("Tell the company story here — how it started, what it specialises in and what makes it different.", "اكتب قصة الشركة هنا: كيف بدأت، وما تخصصها، وما الذي يميّزها."),
    vision: t("Our vision statement.", "رؤيتنا."), mission: t("Our mission statement.", "رسالتنا."),
    image: "", values: L([t("Quality", "الجودة"), t("Commitment", "الالتزام"), t("Innovation", "الابتكار"), t("Transparency", "الشفافية")]),
  },
  services: [
    { icon: "design", title: t("Service one", "الخدمة الأولى"), text: t("Describe the service in one or two lines.", "وصف الخدمة في سطر أو سطرين.") },
    { icon: "building", title: t("Service two", "الخدمة الثانية"), text: t("Describe the service in one or two lines.", "وصف الخدمة في سطر أو سطرين.") },
    { icon: "chart", title: t("Service three", "الخدمة الثالثة"), text: t("Describe the service in one or two lines.", "وصف الخدمة في سطر أو سطرين.") },
  ],
  projects: [],
  process: [
    { title: t("Discover", "الفهم"), text: t("We listen and understand the goal.", "نسمع ونفهم الهدف.") },
    { title: t("Plan", "التخطيط"), text: t("A clear scope, timeline and budget.", "نطاق وجدول وميزانية واضحة.") },
    { title: t("Deliver", "التنفيذ"), text: t("Execution with regular updates.", "تنفيذ مع تحديثات مستمرة.") },
    { title: t("Support", "المتابعة"), text: t("We stay with you after handover.", "نبقى معك بعد التسليم.") },
  ],
  clients: [], testimonials: [], team: [],
  contact: {
    heading: t("Let's start|your *project*.", "خلّينا نبدأ|*مشروعك*."),
    text: t("Tell us what you need and we'll get back to you within one business day.", "قولنا محتاج إيه، وهنرد عليك خلال يوم عمل."),
    phone: "", whatsapp: "", email: "", address: t("", ""), mapUrl: "", hours: t("", ""),
    instagram: "", linkedin: "", x: "", tiktok: "", snapchat: "", youtube: "", formEnabled: true,
  },
  settings: {
    theme: "navy-gold", defaultLang: "ar",
    seoTitle: t("Company Name", "اسم الشركة"),
    seoDescription: t("Company profile and portfolio.", "بروفايل الشركة وأعمالها."),
    ogImage: "",
  },
};

// ---------- normalisation ----------
function normField(f, v) {
  switch (f.type) {
    case "i18n": { const o = v && typeof v === "object" ? v : { en: typeof v === "string" ? v : "", ar: "" }; return { en: String(o.en ?? "").slice(0, 4000), ar: String(o.ar ?? "").slice(0, 4000) }; }
    case "text": case "image": case "file": return String(v ?? "").slice(0, 2000);
    case "select": return f.options.includes(v) ? v : f.options[0];
    case "bool": return Boolean(v);
    case "number": { const n = Number(v); return Number.isFinite(n) ? n : 0; }
    case "object": return normObject(f.fields, v);
    case "list": return (Array.isArray(v) ? v : []).slice(0, f.max || 80).map((x) => normObject(f.fields, x));
  }
  return v;
}
function normObject(fields, v) { const o = v && typeof v === "object" ? v : {}; const out = {}; for (const f of fields) out[f.key] = normField(f, o[f.key]); return out; }
export function normalizeContent(data) { return normObject(SCHEMA, data); }

// ---------- JSON schema for the profile importer ----------
function js(f) {
  const I = { type: "object", properties: { en: { type: "string" }, ar: { type: "string" } }, required: ["en", "ar"], additionalProperties: false };
  switch (f.type) {
    case "i18n": return I; case "text": return { type: "string" }; case "bool": return { type: "boolean" };
    case "number": return { type: "number" }; case "select": return { type: "string", enum: f.options };
    case "object": return obj(f.fields); case "list": return { type: "array", items: obj(f.fields) };
  }
  return null;
}
function obj(fields) {
  const properties = {}, required = [];
  for (const f of fields) {
    if (f.type === "image" || f.type === "file") continue;
    if (f.type === "list" && f.fields.every((x) => x.type === "image")) continue; // galleries are images only
    properties[f.key] = js(f); required.push(f.key);
  }
  return { type: "object", properties, required, additionalProperties: false };
}
export function importJsonSchema() { return obj(SCHEMA.filter((s) => s.key !== "settings")); }
