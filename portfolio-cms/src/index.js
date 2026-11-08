// Portfolio CMS — Cloudflare Worker
// Public site (server-injected content), admin API, media (R2), messages and analytics (D1).

import { DEFAULT_CONTENT, normalizeContent, SCHEMA, ICONS, THEMES } from "./content.js";
import { importCv } from "./cv.js";

const SESSION_DAYS = 14;
const MAX_UPLOAD = 15 * 1024 * 1024; // 15 MB
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/svg+xml"];

export default {
  async fetch(request, env, ctx) {
    try {
      return await route(request, env, ctx);
    } catch (err) {
      console.error(err);
      if (err instanceof HttpError) return json({ error: err.message }, err.status);
      return json({ error: "Server error" }, 500);
    }
  },
};

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

async function route(request, env, ctx) {
  const url = new URL(request.url);
  const { pathname } = url;
  const method = request.method;

  // ---------- public pages ----------
  if (method === "GET" && (pathname === "/" || pathname === "/index.html")) return renderSite(request, env, ctx, url);
  if (pathname === "/template.html") return new Response("Not found", { status: 404 });
  if (method === "GET" && pathname.startsWith("/media/")) return serveMedia(request, env, pathname.slice(7));

  // ---------- public API ----------
  if (pathname === "/api/contact" && method === "POST") return contact(request, env);
  if (pathname === "/api/track" && method === "POST") return track(request, env);
  if (pathname === "/api/login" && method === "POST") return login(request, env);
  if (pathname === "/api/logout" && method === "POST") return logout(request, env);

  // ---------- admin API (session required) ----------
  if (pathname.startsWith("/api/")) {
    await requireAdmin(request, env);
    if (method !== "GET" && request.headers.get("x-requested-with") !== "portfolio-admin") throw new HttpError(403, "Bad request origin");

    if (pathname === "/api/me" && method === "GET") return json({ ok: true });
    if (pathname === "/api/schema" && method === "GET") return json({ schema: SCHEMA, icons: ICONS, themes: THEMES });
    if (pathname === "/api/content" && method === "GET") return json({ content: await getContent(env) });
    if (pathname === "/api/content" && method === "PUT") return saveContent(request, env);
    if (pathname === "/api/revisions" && method === "GET") return listRevisions(env);
    if (pathname.startsWith("/api/revisions/") && method === "POST") return restoreRevision(env, pathname.split("/")[3]);
    if (pathname === "/api/media" && method === "GET") return listMedia(env);
    if (pathname === "/api/media" && method === "POST") return uploadMedia(request, env);
    if (pathname.startsWith("/api/media/") && method === "DELETE") return deleteMedia(env, decodeURIComponent(pathname.slice(11)));
    if (pathname === "/api/messages" && method === "GET") return listMessages(env);
    if (pathname.startsWith("/api/messages/") && method === "PATCH") return markMessage(request, env, pathname.split("/")[3]);
    if (pathname.startsWith("/api/messages/") && method === "DELETE") return deleteMessage(env, pathname.split("/")[3]);
    if (pathname === "/api/stats" && method === "GET") return stats(env, url);
    if (pathname === "/api/cv-import" && method === "POST") return cvImport(request, env);
    throw new HttpError(404, "Not found");
  }

  // ---------- static assets ----------
  return env.ASSETS.fetch(request);
}

// =============== helpers ===============

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });
}

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomToken(bytes = 32) {
  const a = new Uint8Array(bytes);
  crypto.getRandomValues(a);
  return [...a].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function clientIp(request) {
  return request.headers.get("cf-connecting-ip") || "local";
}

async function readJson(request, limit = 512 * 1024) {
  const len = Number(request.headers.get("content-length") || 0);
  if (len > limit) throw new HttpError(413, "Too large");
  const text = await request.text();
  if (text.length > limit) throw new HttpError(413, "Too large");
  try { return JSON.parse(text); } catch { throw new HttpError(400, "Invalid JSON"); }
}

// Fixed-window rate limit keyed by a hash (never stores raw IPs).
async function rateLimit(env, name, key, limit, windowSec) {
  const bucket = `${name}:${await sha256(key)}`;
  const now = Math.floor(Date.now() / 1000);
  const row = await env.DB.prepare("SELECT count, reset_at FROM rate_limits WHERE bucket = ?").bind(bucket).first();
  if (!row || row.reset_at < now) {
    await env.DB.prepare("INSERT OR REPLACE INTO rate_limits (bucket, count, reset_at) VALUES (?, 1, ?)").bind(bucket, now + windowSec).run();
    return;
  }
  if (row.count >= limit) throw new HttpError(429, "Too many attempts. Try again later.");
  await env.DB.prepare("UPDATE rate_limits SET count = count + 1 WHERE bucket = ?").bind(bucket).run();
}

function timingSafeEqual(a, b) {
  const ea = new TextEncoder().encode(a), eb = new TextEncoder().encode(b);
  if (ea.length !== eb.length) return false;
  let diff = 0;
  for (let i = 0; i < ea.length; i++) diff |= ea[i] ^ eb[i];
  return diff === 0;
}

// =============== content ===============

async function getContent(env) {
  const row = await env.DB.prepare("SELECT data FROM content WHERE id = 1").first();
  if (!row) return normalizeContent(DEFAULT_CONTENT);
  try { return normalizeContent(JSON.parse(row.data)); } catch { return normalizeContent(DEFAULT_CONTENT); }
}

async function saveContent(request, env) {
  const body = await readJson(request);
  const content = normalizeContent(body.content);
  const data = JSON.stringify(content);
  const prev = await env.DB.prepare("SELECT data FROM content WHERE id = 1").first();
  const stmts = [];
  if (prev && prev.data !== data) stmts.push(env.DB.prepare("INSERT INTO revisions (data, note) VALUES (?, ?)").bind(prev.data, String(body.note || "Before save").slice(0, 120)));
  stmts.push(env.DB.prepare("INSERT INTO content (id, data, updated_at) VALUES (1, ?, datetime('now')) ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at").bind(data));
  stmts.push(env.DB.prepare("DELETE FROM revisions WHERE id NOT IN (SELECT id FROM revisions ORDER BY id DESC LIMIT 30)"));
  await env.DB.batch(stmts);
  return json({ ok: true, content });
}

async function listRevisions(env) {
  const { results } = await env.DB.prepare("SELECT id, note, created_at FROM revisions ORDER BY id DESC LIMIT 30").all();
  return json({ revisions: results });
}

async function restoreRevision(env, id) {
  const rev = await env.DB.prepare("SELECT data FROM revisions WHERE id = ?").bind(Number(id)).first();
  if (!rev) throw new HttpError(404, "Revision not found");
  const cur = await env.DB.prepare("SELECT data FROM content WHERE id = 1").first();
  const stmts = [];
  if (cur) stmts.push(env.DB.prepare("INSERT INTO revisions (data, note) VALUES (?, 'Before restore')").bind(cur.data));
  stmts.push(env.DB.prepare("INSERT INTO content (id, data, updated_at) VALUES (1, ?, datetime('now')) ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at").bind(rev.data));
  await env.DB.batch(stmts);
  return json({ ok: true, content: normalizeContent(JSON.parse(rev.data)) });
}

// =============== public site ===============

function escHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function plain(s) { return String(s ?? "").replace(/[*|]/g, ""); }

async function renderSite(request, env, ctx, url) {
  const [content, tpl] = await Promise.all([
    getContent(env),
    env.ASSETS.fetch(new Request(new URL("/template.html", url))).then((r) => r.text()),
  ]);
  const s = content.settings;
  const lang = url.searchParams.get("lang") === "ar" || url.searchParams.get("lang") === "en" ? url.searchParams.get("lang") : s.defaultLang;
  const pick = (o) => (o && (o[lang] || o.en || o.ar)) || "";
  const name = plain(`${pick(content.profile.firstName)} ${pick(content.profile.lastName)}`).trim();
  const title = plain(pick(s.seoTitle)) || name;
  const desc = plain(pick(s.seoDescription)) || plain(pick(content.profile.lead));
  const og = s.ogImage ? new URL(s.ogImage, url).href : "";
  const head = [
    `<title>${escHtml(title)}</title>`,
    `<meta name="description" content="${escHtml(desc)}">`,
    `<meta property="og:title" content="${escHtml(title)}">`,
    `<meta property="og:description" content="${escHtml(desc)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:url" content="${escHtml(url.origin + "/")}">`,
    og ? `<meta property="og:image" content="${escHtml(og)}"><meta name="twitter:card" content="summary_large_image">` : "",
    `<link rel="canonical" href="${escHtml(url.origin + "/")}">`,
    `<link rel="alternate" hreflang="en" href="${escHtml(url.origin + "/?lang=en")}"><link rel="alternate" hreflang="ar" href="${escHtml(url.origin + "/?lang=ar")}">`,
  ].join("\n");
  // JSON inside <script>: escape "<" so content can never close the tag.
  const data = JSON.stringify({ content, lang }).replace(/</g, "\\u003c");
  const html = tpl
    .replace("<!--HEAD-->", head)
    .replace("/*DATA*/null", data)
    .replace('<html lang="en" dir="ltr"', `<html lang="${lang}" dir="${lang === "ar" ? "rtl" : "ltr"}" data-theme-name="${escHtml(s.theme)}"`);
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
      "x-content-type-options": "nosniff",
      "referrer-policy": "strict-origin-when-cross-origin",
    },
  });
}

// =============== media (R2) ===============

async function serveMedia(request, env, key) {
  if (!/^[a-z0-9-]+\.[a-z0-9]+$/.test(key)) return new Response("Not found", { status: 404 });
  const obj = await env.MEDIA.get(key);
  if (!obj) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("x-content-type-options", "nosniff");
  if (headers.get("content-type") === "image/svg+xml") headers.set("content-security-policy", "default-src 'none'; style-src 'unsafe-inline'");
  return new Response(obj.body, { headers });
}

const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif", "image/svg+xml": "svg", "application/pdf": "pdf" };

async function uploadMedia(request, env) {
  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") throw new HttpError(400, "No file");
  if (file.size > MAX_UPLOAD) throw new HttpError(413, "File is larger than 15 MB");
  const type = file.type;
  if (!IMAGE_TYPES.includes(type) && type !== "application/pdf") throw new HttpError(415, "Only images and PDF files are allowed");
  const key = `${Date.now().toString(36)}-${randomToken(6)}.${EXT[type]}`;
  await env.MEDIA.put(key, file.stream(), { httpMetadata: { contentType: type } });
  const name = String(file.name || key).slice(0, 200);
  await env.DB.prepare("INSERT INTO media (key, name, type, size) VALUES (?, ?, ?, ?)").bind(key, name, type, file.size).run();
  return json({ ok: true, key, url: `/media/${key}`, name, type, size: file.size });
}

async function listMedia(env) {
  const { results } = await env.DB.prepare("SELECT key, name, type, size, created_at FROM media ORDER BY created_at DESC LIMIT 500").all();
  return json({ media: results.map((m) => ({ ...m, url: `/media/${m.key}` })) });
}

async function deleteMedia(env, key) {
  if (!/^[a-z0-9-]+\.[a-z0-9]+$/.test(key)) throw new HttpError(400, "Bad key");
  await env.MEDIA.delete(key);
  await env.DB.prepare("DELETE FROM media WHERE key = ?").bind(key).run();
  return json({ ok: true });
}

// =============== auth ===============

function cookie(name, value, maxAge, secure) {
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}

async function login(request, env) {
  if (!env.ADMIN_PASSWORD) throw new HttpError(500, "ADMIN_PASSWORD is not set on the server");
  await rateLimit(env, "login", clientIp(request), 8, 15 * 60);
  const { password } = await readJson(request, 4096);
  const ok = timingSafeEqual(await sha256(String(password || "")), await sha256(env.ADMIN_PASSWORD));
  if (!ok) throw new HttpError(401, "Wrong password");
  const token = randomToken();
  const expires = Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400;
  await env.DB.batch([
    env.DB.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(Math.floor(Date.now() / 1000)),
    env.DB.prepare("INSERT INTO sessions (token_hash, expires_at) VALUES (?, ?)").bind(await sha256(token), expires),
  ]);
  const secure = new URL(request.url).protocol === "https:";
  return json({ ok: true }, 200, { "set-cookie": cookie("pf_session", token, SESSION_DAYS * 86400, secure) });
}

function sessionToken(request) {
  const m = (request.headers.get("cookie") || "").match(/(?:^|;\s*)pf_session=([a-f0-9]{64})/);
  return m ? m[1] : null;
}

async function requireAdmin(request, env) {
  const token = sessionToken(request);
  if (!token) throw new HttpError(401, "Login required");
  const row = await env.DB.prepare("SELECT expires_at FROM sessions WHERE token_hash = ?").bind(await sha256(token)).first();
  if (!row || row.expires_at < Math.floor(Date.now() / 1000)) throw new HttpError(401, "Session expired");
}

async function logout(request, env) {
  const token = sessionToken(request);
  if (token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(token)).run();
  const secure = new URL(request.url).protocol === "https:";
  return json({ ok: true }, 200, { "set-cookie": cookie("pf_session", "", 0, secure) });
}

// =============== contact messages ===============

async function contact(request, env) {
  const body = await readJson(request, 16 * 1024);
  if (body.website) return json({ ok: true }); // honeypot: bots fill hidden fields
  const name = String(body.name || "").trim().slice(0, 120);
  const email = String(body.email || "").trim().slice(0, 200);
  const phone = String(body.phone || "").trim().slice(0, 40);
  const text = String(body.message || "").trim().slice(0, 5000);
  if (!name || !text || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, "Please fill in your name, a valid email and a message.");
  await rateLimit(env, "contact", clientIp(request), 5, 3600);
  await env.DB.prepare("INSERT INTO messages (name, email, phone, body, lang) VALUES (?, ?, ?, ?, ?)")
    .bind(name, email, phone, text, body.lang === "ar" ? "ar" : "en").run();
  return json({ ok: true });
}

async function listMessages(env) {
  const { results } = await env.DB.prepare("SELECT * FROM messages ORDER BY id DESC LIMIT 500").all();
  return json({ messages: results });
}

async function markMessage(request, env, id) {
  const { read } = await readJson(request, 1024);
  await env.DB.prepare("UPDATE messages SET is_read = ? WHERE id = ?").bind(read ? 1 : 0, Number(id)).run();
  return json({ ok: true });
}

async function deleteMessage(env, id) {
  await env.DB.prepare("DELETE FROM messages WHERE id = ?").bind(Number(id)).run();
  return json({ ok: true });
}

// =============== analytics ===============

const BOT_RE = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|headless|lighthouse/i;

async function track(request, env) {
  const ua = request.headers.get("user-agent") || "";
  if (BOT_RE.test(ua)) return new Response(null, { status: 204 });
  const body = await readJson(request, 2048).catch(() => ({}));
  const day = new Date().toISOString().slice(0, 10);
  if (body.event) {
    const name = String(body.event).replace(/[^a-z0-9_:-]/gi, "").slice(0, 40);
    if (name) await env.DB.prepare("INSERT INTO events (day, name) VALUES (?, ?)").bind(day, name).run();
    return new Response(null, { status: 204 });
  }
  let referrer = "";
  try { const r = new URL(String(body.referrer || "")); if (r.host !== new URL(request.url).host) referrer = r.host.replace(/^www\./, ""); } catch {}
  const device = /mobile|android|iphone|ipad/i.test(ua) ? "mobile" : "desktop";
  const country = (request.cf && request.cf.country) || "";
  // Daily anonymous visitor id: hash(ip + ua + day). Not reversible, resets every day.
  const visitor = (await sha256(`${clientIp(request)}|${ua}|${day}`)).slice(0, 16);
  await env.DB.prepare("INSERT INTO visits (day, path, referrer, country, device, lang, visitor) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(day, String(body.path || "/").slice(0, 200), referrer, country, device, body.lang === "ar" ? "ar" : "en", visitor).run();
  return new Response(null, { status: 204 });
}

async function stats(env, url) {
  const days = Math.min(Math.max(Number(url.searchParams.get("days")) || 30, 1), 365);
  const since = new Date(Date.now() - (days - 1) * 86400000).toISOString().slice(0, 10);
  const q = (sql) => env.DB.prepare(sql).bind(since).all().then((r) => r.results);
  const [daily, totals, referrers, countries, devices, langs, events, unread] = await Promise.all([
    q("SELECT day, COUNT(*) AS views, COUNT(DISTINCT visitor) AS visitors FROM visits WHERE day >= ? GROUP BY day ORDER BY day"),
    q("SELECT COUNT(*) AS views, COUNT(DISTINCT visitor || day) AS visitors FROM visits WHERE day >= ?"),
    q("SELECT referrer AS name, COUNT(*) AS n FROM visits WHERE day >= ? AND referrer != '' GROUP BY referrer ORDER BY n DESC LIMIT 8"),
    q("SELECT country AS name, COUNT(*) AS n FROM visits WHERE day >= ? AND country != '' GROUP BY country ORDER BY n DESC LIMIT 8"),
    q("SELECT device AS name, COUNT(*) AS n FROM visits WHERE day >= ? GROUP BY device ORDER BY n DESC"),
    q("SELECT lang AS name, COUNT(*) AS n FROM visits WHERE day >= ? GROUP BY lang ORDER BY n DESC"),
    q("SELECT name, COUNT(*) AS n FROM events WHERE day >= ? GROUP BY name ORDER BY n DESC"),
    env.DB.prepare("SELECT COUNT(*) AS n FROM messages WHERE is_read = 0").first(),
  ]);
  return json({ days, since, daily, totals: totals[0] || { views: 0, visitors: 0 }, referrers, countries, devices, langs, events, unread: unread ? unread.n : 0 });
}

// =============== CV import ===============

async function cvImport(request, env) {
  if (!env.ANTHROPIC_API_KEY) throw new HttpError(500, "ANTHROPIC_API_KEY is not set on the server");
  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") throw new HttpError(400, "No file");
  if (file.type !== "application/pdf") throw new HttpError(415, "Upload the CV as a PDF");
  if (file.size > 20 * 1024 * 1024) throw new HttpError(413, "PDF is larger than 20 MB");
  const notes = String(form.get("notes") || "").slice(0, 2000);
  const result = await importCv(env, await file.arrayBuffer(), notes);
  if (result.error) throw new HttpError(result.status || 502, result.error);
  return json({ ok: true, content: normalizeContent(result.content) });
}
