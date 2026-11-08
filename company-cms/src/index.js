// Company portfolio — Cloudflare Worker
// Public site + tracked links (/v/<slug>) + visit analytics + quote requests + admin API with users & roles.

import { DEFAULT_CONTENT, normalizeContent, SCHEMA, ICONS, THEMES } from "./content.js";
import { importProfile } from "./importer.js";

const SESSION_DAYS = 14;
const MAX_UPLOAD = 15 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/svg+xml"];
const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif", "image/svg+xml": "svg", "application/pdf": "pdf" };
const ROLES = ["admin", "editor", "viewer"];
const BOT_RE = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|headless|lighthouse|python|curl|wget|okhttp|go-http/i;

class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }

export default {
  async fetch(request, env, ctx) {
    try { return await route(request, env, ctx); }
    catch (err) {
      if (err instanceof HttpError) return json({ error: err.message }, err.status);
      console.error(err);
      return json({ error: "Server error" }, 500);
    }
  },
};

async function route(request, env, ctx) {
  const url = new URL(request.url);
  const p = url.pathname, m = request.method;

  // ---------- public pages ----------
  if (m === "GET" && (p === "/" || p === "/index.html")) return renderSite(request, env, url, null);
  if (m === "GET" && p.startsWith("/v/")) return renderSite(request, env, url, p.slice(3).replace(/\/$/, ""));
  if (p === "/template.html") return new Response("Not found", { status: 404 });
  if (m === "GET" && p.startsWith("/media/")) return serveMedia(env, p.slice(7));

  // ---------- public API ----------
  if (m === "POST" && p === "/api/v") return visitStart(request, env, ctx);
  if (m === "POST" && p === "/api/v/ping") return visitPing(request, env);
  if (m === "POST" && p === "/api/e") return trackEvent(request, env);
  if (m === "POST" && p === "/api/request") return newRequest(request, env, ctx);
  if (m === "POST" && p === "/api/login") return login(request, env);
  if (m === "POST" && p === "/api/logout") return logout(request, env);

  // ---------- dashboard API ----------
  if (p.startsWith("/api/")) {
    const user = await currentUser(request, env);
    if (!user) throw new HttpError(401, "Login required");
    if (m !== "GET" && request.headers.get("x-requested-with") !== "company-admin") throw new HttpError(403, "Bad request origin");
    const can = (...roles) => { if (!roles.includes(user.role)) throw new HttpError(403, "You don't have permission for this"); };
    const id = p.split("/")[3];

    if (p === "/api/me" && m === "GET") return json({ user });
    if (p === "/api/password" && m === "POST") return changeOwnPassword(request, env, user);
    if (p === "/api/schema" && m === "GET") return json({ schema: SCHEMA, icons: ICONS, themes: THEMES });
    if (p === "/api/content" && m === "GET") return json({ content: await getContent(env) });
    if (p === "/api/content" && m === "PUT") { can("admin", "editor"); return saveContent(request, env, user); }
    if (p === "/api/revisions" && m === "GET") { can("admin", "editor"); return listRevisions(env); }
    if (p.startsWith("/api/revisions/") && m === "POST") { can("admin", "editor"); return restoreRevision(env, id, user); }
    if (p === "/api/media" && m === "GET") return listMedia(env);
    if (p === "/api/media" && m === "POST") { can("admin", "editor"); return uploadMedia(request, env); }
    if (p.startsWith("/api/media/") && m === "DELETE") { can("admin", "editor"); return deleteMedia(env, decodeURIComponent(id)); }
    if (p === "/api/import" && m === "POST") { can("admin", "editor"); return importRoute(request, env); }
    if (p === "/api/stats" && m === "GET") return stats(env, url);
    if (p === "/api/visits" && m === "GET") return listVisits(env, url);
    if (p === "/api/links" && m === "GET") return listLinks(env);
    if (p === "/api/links" && m === "POST") { can("admin", "editor"); return createLink(request, env, user); }
    if (p.startsWith("/api/links/") && m === "PATCH") { can("admin", "editor"); return updateLink(request, env, id); }
    if (p.startsWith("/api/links/") && m === "DELETE") { can("admin"); return deleteLink(env, id); }
    if (p === "/api/requests" && m === "GET") return listRequests(env);
    if (p.startsWith("/api/requests/") && m === "PATCH") { can("admin", "editor"); return updateRequest(request, env, id); }
    if (p.startsWith("/api/requests/") && m === "DELETE") { can("admin"); return deleteRequest(env, id); }
    if (p === "/api/users" && m === "GET") { can("admin"); return listUsers(env); }
    if (p === "/api/users" && m === "POST") { can("admin"); return createUser(request, env); }
    if (p.startsWith("/api/users/") && m === "PATCH") { can("admin"); return updateUser(request, env, id, user); }
    if (p.startsWith("/api/users/") && m === "DELETE") { can("admin"); return deleteUser(env, id, user); }
    if (p === "/api/settings/telegram-test" && m === "POST") { can("admin"); return telegramTest(env); }
    throw new HttpError(404, "Not found");
  }

  return env.ASSETS.fetch(request);
}

// ================= helpers =================
function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers } });
}
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
async function sha256(text) { return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))); }
function randomToken(bytes = 32) { const a = new Uint8Array(bytes); crypto.getRandomValues(a); return hex(a); }
function randomSlug(n = 7) { const abc = "abcdefghjkmnpqrstuvwxyz23456789"; const a = new Uint8Array(n); crypto.getRandomValues(a); return [...a].map((x) => abc[x % abc.length]).join(""); }
const clientIp = (r) => r.headers.get("cf-connecting-ip") || "local";
const today = () => new Date().toISOString().slice(0, 10);
async function readJson(request, limit = 512 * 1024) {
  const text = await request.text();
  if (text.length > limit) throw new HttpError(413, "Too large");
  try { return JSON.parse(text || "{}"); } catch { throw new HttpError(400, "Invalid JSON"); }
}
function timingSafeEqual(a, b) {
  const ea = new TextEncoder().encode(a), eb = new TextEncoder().encode(b);
  if (ea.length !== eb.length) return false;
  let d = 0; for (let i = 0; i < ea.length; i++) d |= ea[i] ^ eb[i]; return d === 0;
}
async function rateLimit(env, name, key, limit, windowSec) {
  const bucket = `${name}:${await sha256(key)}`, now = Math.floor(Date.now() / 1000);
  const row = await env.DB.prepare("SELECT count, reset_at FROM rate_limits WHERE bucket = ?").bind(bucket).first();
  if (!row || row.reset_at < now) { await env.DB.prepare("INSERT OR REPLACE INTO rate_limits (bucket, count, reset_at) VALUES (?, 1, ?)").bind(bucket, now + windowSec).run(); return; }
  if (row.count >= limit) throw new HttpError(429, "Too many attempts. Try again later.");
  await env.DB.prepare("UPDATE rate_limits SET count = count + 1 WHERE bucket = ?").bind(bucket).run();
}
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const plain = (s) => String(s ?? "").replace(/[*|]/g, " ").replace(/\s+/g, " ").trim();

// ================= passwords & sessions =================
async function hashPassword(password, saltHex) {
  const salt = saltHex ? Uint8Array.from(saltHex.match(/../g).map((h) => parseInt(h, 16))) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: 100000 }, key, 256);
  return { hash: hex(bits), salt: hex(salt) };
}
function checkPasswordStrength(pw) { if (String(pw || "").length < 8) throw new HttpError(400, "Password must be at least 8 characters"); }
const cookie = (v, maxAge, secure) => `cc_session=${v}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
function sessionToken(request) { const m = (request.headers.get("cookie") || "").match(/(?:^|;\s*)cc_session=([a-f0-9]{64})/); return m ? m[1] : null; }

async function login(request, env) {
  await rateLimit(env, "login", clientIp(request), 8, 15 * 60);
  const body = await readJson(request, 4096);
  const username = String(body.username || "").trim().toLowerCase(), password = String(body.password || "");
  let user = await env.DB.prepare("SELECT * FROM users WHERE username = ?").bind(username).first();
  // First run: no users yet → "admin" + ADMIN_PASSWORD creates the first admin account.
  if (!user && username === "admin") {
    const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM users").first();
    if (!count.n) {
      if (!env.ADMIN_PASSWORD) throw new HttpError(500, "ADMIN_PASSWORD is not set on the server");
      if (!timingSafeEqual(await sha256(password), await sha256(env.ADMIN_PASSWORD))) throw new HttpError(401, "Wrong username or password");
      const h = await hashPassword(password);
      await env.DB.prepare("INSERT INTO users (username, name, role, pass_hash, pass_salt) VALUES ('admin', 'Admin', 'admin', ?, ?)").bind(h.hash, h.salt).run();
      user = await env.DB.prepare("SELECT * FROM users WHERE username = 'admin'").first();
    }
  }
  if (!user) { await hashPassword(password); throw new HttpError(401, "Wrong username or password"); } // equalise timing
  const h = await hashPassword(password, user.pass_salt);
  if (!timingSafeEqual(h.hash, user.pass_hash)) throw new HttpError(401, "Wrong username or password");
  const token = randomToken(), now = Math.floor(Date.now() / 1000);
  await env.DB.batch([
    env.DB.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(now),
    env.DB.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").bind(await sha256(token), user.id, now + SESSION_DAYS * 86400),
    env.DB.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").bind(user.id),
  ]);
  return json({ ok: true }, 200, { "set-cookie": cookie(token, SESSION_DAYS * 86400, new URL(request.url).protocol === "https:") });
}
async function currentUser(request, env) {
  const token = sessionToken(request); if (!token) return null;
  const row = await env.DB.prepare("SELECT u.id, u.username, u.name, u.role, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?").bind(await sha256(token)).first();
  if (!row || row.expires_at < Math.floor(Date.now() / 1000)) return null;
  return { id: row.id, username: row.username, name: row.name, role: row.role };
}
async function logout(request, env) {
  const token = sessionToken(request);
  if (token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(token)).run();
  return json({ ok: true }, 200, { "set-cookie": cookie("", 0, new URL(request.url).protocol === "https:") });
}
async function changeOwnPassword(request, env, user) {
  const { current, next } = await readJson(request, 4096);
  const row = await env.DB.prepare("SELECT pass_hash, pass_salt FROM users WHERE id = ?").bind(user.id).first();
  if (!timingSafeEqual((await hashPassword(String(current || ""), row.pass_salt)).hash, row.pass_hash)) throw new HttpError(400, "Current password is wrong");
  checkPasswordStrength(next);
  const h = await hashPassword(next);
  await env.DB.batch([
    env.DB.prepare("UPDATE users SET pass_hash = ?, pass_salt = ? WHERE id = ?").bind(h.hash, h.salt, user.id),
    env.DB.prepare("DELETE FROM sessions WHERE user_id = ? AND token_hash != ?").bind(user.id, await sha256(sessionToken(request))),
  ]);
  return json({ ok: true });
}

// ================= users =================
async function listUsers(env) {
  const { results } = await env.DB.prepare("SELECT id, username, name, role, created_at, last_login FROM users ORDER BY id").all();
  return json({ users: results });
}
async function createUser(request, env) {
  const b = await readJson(request, 4096);
  const username = String(b.username || "").trim().toLowerCase();
  if (!/^[a-z0-9._-]{3,32}$/.test(username)) throw new HttpError(400, "Username: 3–32 letters, numbers, . _ -");
  if (!ROLES.includes(b.role)) throw new HttpError(400, "Bad role");
  checkPasswordStrength(b.password);
  const h = await hashPassword(String(b.password));
  try { await env.DB.prepare("INSERT INTO users (username, name, role, pass_hash, pass_salt) VALUES (?, ?, ?, ?, ?)").bind(username, String(b.name || username).slice(0, 80), b.role, h.hash, h.salt).run(); }
  catch { throw new HttpError(409, "This username already exists"); }
  return json({ ok: true });
}
async function updateUser(request, env, id, me) {
  const b = await readJson(request, 4096);
  const target = await env.DB.prepare("SELECT id, role FROM users WHERE id = ?").bind(Number(id)).first();
  if (!target) throw new HttpError(404, "User not found");
  const stmts = [];
  if (b.role) {
    if (!ROLES.includes(b.role)) throw new HttpError(400, "Bad role");
    if (target.id === me.id && b.role !== "admin") throw new HttpError(400, "You can't remove your own admin role");
    stmts.push(env.DB.prepare("UPDATE users SET role = ? WHERE id = ?").bind(b.role, target.id));
  }
  if (b.name) stmts.push(env.DB.prepare("UPDATE users SET name = ? WHERE id = ?").bind(String(b.name).slice(0, 80), target.id));
  if (b.password) {
    checkPasswordStrength(b.password);
    const h = await hashPassword(String(b.password));
    stmts.push(env.DB.prepare("UPDATE users SET pass_hash = ?, pass_salt = ? WHERE id = ?").bind(h.hash, h.salt, target.id));
    stmts.push(env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(target.id));
  }
  if (stmts.length) await env.DB.batch(stmts);
  return json({ ok: true });
}
async function deleteUser(env, id, me) {
  if (Number(id) === me.id) throw new HttpError(400, "You can't delete yourself");
  await env.DB.batch([env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(Number(id)), env.DB.prepare("DELETE FROM users WHERE id = ?").bind(Number(id))]);
  return json({ ok: true });
}

// ================= content =================
async function getContent(env) {
  const row = await env.DB.prepare("SELECT data FROM content WHERE id = 1").first();
  try { return normalizeContent(row ? JSON.parse(row.data) : DEFAULT_CONTENT); } catch { return normalizeContent(DEFAULT_CONTENT); }
}
async function saveContent(request, env, user) {
  const body = await readJson(request);
  const content = normalizeContent(body.content), data = JSON.stringify(content);
  const prev = await env.DB.prepare("SELECT data FROM content WHERE id = 1").first();
  const stmts = [];
  if (prev && prev.data !== data) stmts.push(env.DB.prepare("INSERT INTO revisions (data, note, author) VALUES (?, 'Before save', ?)").bind(prev.data, user.name));
  stmts.push(env.DB.prepare("INSERT INTO content (id, data, updated_at) VALUES (1, ?, datetime('now')) ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at").bind(data));
  stmts.push(env.DB.prepare("DELETE FROM revisions WHERE id NOT IN (SELECT id FROM revisions ORDER BY id DESC LIMIT 30)"));
  await env.DB.batch(stmts);
  return json({ ok: true, content });
}
async function listRevisions(env) {
  const { results } = await env.DB.prepare("SELECT id, note, author, created_at FROM revisions ORDER BY id DESC LIMIT 30").all();
  return json({ revisions: results });
}
async function restoreRevision(env, id, user) {
  const rev = await env.DB.prepare("SELECT data FROM revisions WHERE id = ?").bind(Number(id)).first();
  if (!rev) throw new HttpError(404, "Revision not found");
  const cur = await env.DB.prepare("SELECT data FROM content WHERE id = 1").first();
  const stmts = [];
  if (cur) stmts.push(env.DB.prepare("INSERT INTO revisions (data, note, author) VALUES (?, 'Before restore', ?)").bind(cur.data, user.name));
  stmts.push(env.DB.prepare("INSERT INTO content (id, data, updated_at) VALUES (1, ?, datetime('now')) ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at").bind(rev.data));
  await env.DB.batch(stmts);
  return json({ ok: true, content: normalizeContent(JSON.parse(rev.data)) });
}
async function importRoute(request, env) {
  if (!env.ANTHROPIC_API_KEY) throw new HttpError(500, "ANTHROPIC_API_KEY is not set on the server");
  const form = await request.formData(), file = form.get("file");
  if (!file || typeof file === "string") throw new HttpError(400, "No file");
  if (file.type !== "application/pdf") throw new HttpError(415, "Upload the company profile as a PDF");
  if (file.size > 30 * 1024 * 1024) throw new HttpError(413, "PDF is larger than 30 MB");
  const r = await importProfile(env, await file.arrayBuffer(), String(form.get("notes") || "").slice(0, 2000));
  if (r.error) throw new HttpError(r.status || 502, r.error);
  return json({ ok: true, content: normalizeContent(r.content) });
}

// ================= public site =================
async function renderSite(request, env, url, slug) {
  let link = null;
  if (slug) {
    if (!/^[a-z0-9-]{3,40}$/.test(slug)) return Response.redirect(url.origin + "/", 302);
    link = await env.DB.prepare("SELECT id, slug, lang, archived FROM links WHERE slug = ?").bind(slug).first();
    if (!link || link.archived) link = null; // unknown links still show the site, untracked
  }
  const [content, tpl] = await Promise.all([getContent(env), env.ASSETS.fetch(new Request(new URL("/template.html", url))).then((r) => r.text())]);
  const s = content.settings;
  const q = url.searchParams.get("lang");
  const lang = q === "ar" || q === "en" ? q : (link && (link.lang === "ar" || link.lang === "en") ? link.lang : s.defaultLang);
  const pick = (o) => (o && (o[lang] || o.en || o.ar)) || "";
  const title = plain(pick(s.seoTitle)) || plain(pick(content.brand.name));
  const desc = plain(pick(s.seoDescription)) || plain(pick(content.brand.intro));
  const og = s.ogImage || content.brand.heroImage;
  const head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(desc)}">`,
    `<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website">`,
    og ? `<meta property="og:image" content="${esc(new URL(og, url).href)}"><meta name="twitter:card" content="summary_large_image">` : "",
    `<link rel="canonical" href="${esc(url.origin + "/")}">`,
    link ? `<meta name="robots" content="noindex">` : "",
  ].join("\n");
  const data = JSON.stringify({ content, lang, link: link ? link.slug : null }).replace(/</g, "\\u003c");
  const html = tpl.replace("<!--HEAD-->", head).replace("/*DATA*/null", data)
    .replace('<html lang="ar" dir="rtl"', `<html lang="${lang}" dir="${lang === "ar" ? "rtl" : "ltr"}" data-theme-name="${esc(s.theme)}"`);
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff", "referrer-policy": "strict-origin-when-cross-origin" } });
}

// ================= media =================
async function serveMedia(env, key) {
  if (!/^[a-z0-9-]+\.[a-z0-9]+$/.test(key)) return new Response("Not found", { status: 404 });
  const obj = await env.MEDIA.get(key);
  if (!obj) return new Response("Not found", { status: 404 });
  const headers = new Headers(); obj.writeHttpMetadata(headers);
  headers.set("etag", obj.httpEtag); headers.set("cache-control", "public, max-age=31536000, immutable"); headers.set("x-content-type-options", "nosniff");
  if (headers.get("content-type") === "image/svg+xml") headers.set("content-security-policy", "default-src 'none'; style-src 'unsafe-inline'");
  return new Response(obj.body, { headers });
}
async function uploadMedia(request, env) {
  const form = await request.formData(), file = form.get("file");
  if (!file || typeof file === "string") throw new HttpError(400, "No file");
  if (file.size > MAX_UPLOAD) throw new HttpError(413, "File is larger than 15 MB");
  if (!IMAGE_TYPES.includes(file.type) && file.type !== "application/pdf") throw new HttpError(415, "Only images and PDF files are allowed");
  const key = `${Date.now().toString(36)}-${randomToken(6)}.${EXT[file.type]}`;
  await env.MEDIA.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
  const name = String(file.name || key).slice(0, 200);
  await env.DB.prepare("INSERT INTO media (key, name, type, size) VALUES (?, ?, ?, ?)").bind(key, name, file.type, file.size).run();
  return json({ ok: true, key, url: `/media/${key}`, name, type: file.type, size: file.size });
}
async function listMedia(env) {
  const { results } = await env.DB.prepare("SELECT key, name, type, size, created_at FROM media ORDER BY created_at DESC LIMIT 1000").all();
  return json({ media: results.map((x) => ({ ...x, url: `/media/${x.key}` })) });
}
async function deleteMedia(env, key) {
  if (!/^[a-z0-9-]+\.[a-z0-9]+$/.test(key)) throw new HttpError(400, "Bad key");
  await env.MEDIA.delete(key);
  await env.DB.prepare("DELETE FROM media WHERE key = ?").bind(key).run();
  return json({ ok: true });
}

// ================= visit tracking =================
function parseUa(ua) {
  const device = /ipad|tablet/i.test(ua) ? "tablet" : /mobile|android|iphone/i.test(ua) ? "mobile" : "desktop";
  const os = /iphone|ipad|ios/i.test(ua) ? "iOS" : /android/i.test(ua) ? "Android" : /windows/i.test(ua) ? "Windows" : /mac os/i.test(ua) ? "macOS" : /linux/i.test(ua) ? "Linux" : "Other";
  const browser = /edg\//i.test(ua) ? "Edge" : /samsungbrowser/i.test(ua) ? "Samsung" : /chrome|crios/i.test(ua) ? "Chrome" : /firefox|fxios/i.test(ua) ? "Firefox" : /safari/i.test(ua) ? "Safari" : "Other";
  return { device, os, browser };
}
const VISIT_ID = /^[a-f0-9]{32}$/;
const clean = (s, n) => String(s ?? "").replace(/[\u0000-\u001f]/g, "").slice(0, n);

async function visitStart(request, env, ctx) {
  const ua = request.headers.get("user-agent") || "";
  if (BOT_RE.test(ua) || (await currentUser(request, env))) return json({ id: null }); // skip bots and dashboard users
  await rateLimit(env, "visit", clientIp(request), 120, 3600);
  const b = await readJson(request, 4096).catch(() => ({}));
  let link = null;
  if (b.link && /^[a-z0-9-]{3,40}$/.test(b.link)) link = await env.DB.prepare("SELECT id, name, notify FROM links WHERE slug = ? AND archived = 0").bind(b.link).first();
  let referrer = "";
  try { const r = new URL(String(b.referrer || "")); if (r.host !== new URL(request.url).host) referrer = r.host.replace(/^www\./, ""); } catch {}
  const bid = /^[a-f0-9]{16,32}$/.test(b.bid || "") ? b.bid : null;
  const isReturn = bid ? !!(await env.DB.prepare("SELECT 1 FROM visits WHERE browser_id = ? LIMIT 1").bind(bid).first()) : false;
  const cf = request.cf || {}, u = parseUa(ua), id = randomToken(16);
  await env.DB.prepare(`INSERT INTO visits (id, day, link_id, browser_id, is_return, referrer, utm_source, utm_campaign, country, city, device, os, browser, lang)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, today(), link ? link.id : null, bid, isReturn ? 1 : 0, referrer,
      clean(b.utm_source, 60), clean(b.utm_campaign, 60), cf.country || "", clean(cf.city, 60), u.device, u.os, u.browser, b.lang === "en" ? "en" : "ar").run();
  if (link && link.notify) {
    const where = [cf.city, cf.country].filter(Boolean).join(", ");
    ctx.waitUntil(telegram(env, `🔔 «${link.name}» فتح البورتفوليو${isReturn ? " (مرة تانية)" : ""}\n📍 ${where || "—"} · ${u.device === "mobile" ? "موبايل" : u.device === "tablet" ? "تابلت" : "كمبيوتر"} · ${u.os}`));
  }
  return json({ id });
}

async function visitPing(request, env) {
  const b = await readJson(request, 4096).catch(() => ({}));
  if (!VISIT_ID.test(b.id || "")) return new Response(null, { status: 204 });
  const duration = Math.max(0, Math.min(6 * 3600, Math.round(Number(b.duration) || 0)));
  const scroll = Math.max(0, Math.min(100, Math.round(Number(b.scroll) || 0)));
  const secs = (Array.isArray(b.sections) ? b.sections : []).map((x) => String(x).replace(/[^a-z]/g, "").slice(0, 20)).filter(Boolean).slice(0, 20);
  const row = await env.DB.prepare("SELECT sections, started_at FROM visits WHERE id = ?").bind(b.id).first();
  if (!row) return new Response(null, { status: 204 });
  if (Date.now() - Date.parse(row.started_at + "Z") > 12 * 3600 * 1000) return new Response(null, { status: 204 });
  const merged = [...new Set([...row.sections.split(",").filter(Boolean), ...secs])].join(",");
  await env.DB.prepare("UPDATE visits SET duration = MAX(duration, ?), max_scroll = MAX(max_scroll, ?), sections = ?, last_seen = datetime('now') WHERE id = ?")
    .bind(duration, scroll, merged, b.id).run();
  return new Response(null, { status: 204 });
}

async function trackEvent(request, env) {
  if (BOT_RE.test(request.headers.get("user-agent") || "")) return new Response(null, { status: 204 });
  const b = await readJson(request, 2048).catch(() => ({}));
  const name = String(b.name || "").replace(/[^a-z0-9_-]/gi, "").slice(0, 30);
  if (!name) return new Response(null, { status: 204 });
  await rateLimit(env, "event", clientIp(request), 300, 3600);
  const vid = VISIT_ID.test(b.visit || "") ? b.visit : null;
  await env.DB.prepare("INSERT INTO events (visit_id, day, name, detail) VALUES (?, ?, ?, ?)").bind(vid, today(), name, clean(b.detail, 120)).run();
  return new Response(null, { status: 204 });
}

// ================= quote requests =================
async function newRequest(request, env, ctx) {
  const b = await readJson(request, 16 * 1024);
  if (b.website) return json({ ok: true }); // honeypot
  const name = clean(b.name, 120).trim(), email = clean(b.email, 200).trim(), phone = clean(b.phone, 40).trim(), text = String(b.message || "").trim().slice(0, 5000);
  if (!name || !text || (!phone && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) throw new HttpError(400, "Please add your name, a phone number or email, and a message.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, "Please enter a valid email.");
  await rateLimit(env, "request", clientIp(request), 5, 3600);
  const vid = VISIT_ID.test(b.visit || "") ? b.visit : null;
  let linkId = null, linkName = "";
  if (vid) { const v = await env.DB.prepare("SELECT v.link_id, l.name FROM visits v LEFT JOIN links l ON l.id = v.link_id WHERE v.id = ?").bind(vid).first(); if (v) { linkId = v.link_id; linkName = v.name || ""; } }
  await env.DB.prepare("INSERT INTO requests (visit_id, link_id, name, company, email, phone, service, body, lang) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(vid, linkId, name, clean(b.company, 120), email, phone, clean(b.service, 120), text, b.lang === "en" ? "en" : "ar").run();
  ctx.waitUntil(telegram(env, `📩 طلب جديد من ${name}${b.company ? " — " + clean(b.company, 120) : ""}${linkName ? `\n🔗 من لينك «${linkName}»` : ""}\n${phone ? "📞 " + phone + "\n" : ""}${email ? "✉️ " + email + "\n" : ""}${b.service ? "🧩 " + clean(b.service, 120) + "\n" : ""}\n${text.slice(0, 600)}`));
  return json({ ok: true });
}
async function listRequests(env) {
  const { results } = await env.DB.prepare("SELECT r.*, l.name AS link_name FROM requests r LEFT JOIN links l ON l.id = r.link_id ORDER BY r.id DESC LIMIT 500").all();
  return json({ requests: results });
}
async function updateRequest(request, env, id) {
  const { status } = await readJson(request, 1024);
  if (!["new", "contacted", "won", "lost"].includes(status)) throw new HttpError(400, "Bad status");
  await env.DB.prepare("UPDATE requests SET status = ? WHERE id = ?").bind(status, Number(id)).run();
  return json({ ok: true });
}
async function deleteRequest(env, id) { await env.DB.prepare("DELETE FROM requests WHERE id = ?").bind(Number(id)).run(); return json({ ok: true }); }

// ================= tracked links =================
async function listLinks(env) {
  const { results } = await env.DB.prepare(`SELECT l.*, COUNT(v.id) AS opens, MAX(v.started_at) AS last_open, COALESCE(SUM(v.duration),0) AS total_time,
      (SELECT COUNT(*) FROM events e JOIN visits v2 ON v2.id = e.visit_id WHERE v2.link_id = l.id) AS clicks,
      (SELECT COUNT(*) FROM requests r WHERE r.link_id = l.id) AS requests
    FROM links l LEFT JOIN visits v ON v.link_id = l.id GROUP BY l.id ORDER BY l.archived, COALESCE(MAX(v.started_at), l.created_at) DESC`).all();
  return json({ links: results });
}
async function createLink(request, env, user) {
  const b = await readJson(request, 4096);
  const name = clean(b.name, 120).trim();
  if (!name) throw new HttpError(400, "Write who this link is for");
  let slug = String(b.slug || "").trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
  if (slug && slug.length < 3) throw new HttpError(400, "Custom link must be at least 3 characters");
  if (!slug) slug = randomSlug();
  try {
    await env.DB.prepare("INSERT INTO links (slug, name, note, lang, notify, created_by) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(slug, name, clean(b.note, 500), b.lang === "en" || b.lang === "ar" ? b.lang : null, b.notify === false ? 0 : 1, user.name).run();
  } catch { throw new HttpError(409, "This link already exists, choose another"); }
  return json({ ok: true, slug });
}
async function updateLink(request, env, id) {
  const b = await readJson(request, 4096), stmts = [];
  if (typeof b.name === "string") stmts.push(env.DB.prepare("UPDATE links SET name = ? WHERE id = ?").bind(clean(b.name, 120), Number(id)));
  if (typeof b.note === "string") stmts.push(env.DB.prepare("UPDATE links SET note = ? WHERE id = ?").bind(clean(b.note, 500), Number(id)));
  if (typeof b.notify === "boolean") stmts.push(env.DB.prepare("UPDATE links SET notify = ? WHERE id = ?").bind(b.notify ? 1 : 0, Number(id)));
  if (typeof b.archived === "boolean") stmts.push(env.DB.prepare("UPDATE links SET archived = ? WHERE id = ?").bind(b.archived ? 1 : 0, Number(id)));
  if (stmts.length) await env.DB.batch(stmts);
  return json({ ok: true });
}
async function deleteLink(env, id) {
  await env.DB.batch([env.DB.prepare("UPDATE visits SET link_id = NULL WHERE link_id = ?").bind(Number(id)), env.DB.prepare("DELETE FROM links WHERE id = ?").bind(Number(id))]);
  return json({ ok: true });
}

// ================= analytics for the dashboard =================
async function listVisits(env, url) {
  const days = Math.min(Math.max(Number(url.searchParams.get("days")) || 30, 1), 365);
  const since = new Date(Date.now() - (days - 1) * 86400000).toISOString().slice(0, 10);
  const link = Number(url.searchParams.get("link")) || null;
  const onlyLinks = url.searchParams.get("tracked") === "1";
  const limit = Math.min(Number(url.searchParams.get("limit")) || 200, 500);
  let sql = `SELECT v.*, l.name AS link_name, (SELECT GROUP_CONCAT(name) FROM events e WHERE e.visit_id = v.id) AS clicks,
      (SELECT COUNT(*) FROM requests r WHERE r.visit_id = v.id) AS requested
    FROM visits v LEFT JOIN links l ON l.id = v.link_id WHERE v.day >= ?`;
  const args = [since];
  if (link) { sql += " AND v.link_id = ?"; args.push(link); }
  else if (onlyLinks) sql += " AND v.link_id IS NOT NULL";
  sql += " ORDER BY v.started_at DESC LIMIT ?"; args.push(limit);
  const { results } = await env.DB.prepare(sql).bind(...args).all();
  return json({ visits: results.map(({ browser_id, ...v }) => v) });
}

async function stats(env, url) {
  const days = Math.min(Math.max(Number(url.searchParams.get("days")) || 30, 1), 365);
  const since = new Date(Date.now() - (days - 1) * 86400000).toISOString().slice(0, 10);
  const q = (sql) => env.DB.prepare(sql).bind(since).all().then((r) => r.results);
  const [daily, totals, referrers, countries, cities, devices, sections, events, links, newReq] = await Promise.all([
    q("SELECT day, COUNT(*) AS visits, COUNT(DISTINCT COALESCE(browser_id, id)) AS people FROM visits WHERE day >= ? GROUP BY day ORDER BY day"),
    q("SELECT COUNT(*) AS visits, COUNT(DISTINCT COALESCE(browser_id, id)) AS people, CAST(AVG(duration) AS INTEGER) AS avg_time, SUM(CASE WHEN link_id IS NOT NULL THEN 1 ELSE 0 END) AS link_opens, SUM(CASE WHEN max_scroll >= 90 THEN 1 ELSE 0 END) AS finished FROM visits WHERE day >= ?"),
    q("SELECT referrer AS name, COUNT(*) AS n FROM visits WHERE day >= ? AND referrer != '' GROUP BY referrer ORDER BY n DESC LIMIT 8"),
    q("SELECT country AS name, COUNT(*) AS n FROM visits WHERE day >= ? AND country != '' GROUP BY country ORDER BY n DESC LIMIT 8"),
    q("SELECT city || CASE WHEN country != '' THEN ' · ' || country ELSE '' END AS name, COUNT(*) AS n FROM visits WHERE day >= ? AND city != '' GROUP BY city, country ORDER BY n DESC LIMIT 8"),
    q("SELECT device AS name, COUNT(*) AS n FROM visits WHERE day >= ? GROUP BY device ORDER BY n DESC"),
    q("SELECT sections FROM visits WHERE day >= ? AND sections != ''"),
    q("SELECT name, COUNT(*) AS n FROM events WHERE day >= ? GROUP BY name ORDER BY n DESC"),
    q("SELECT l.name, COUNT(v.id) AS n FROM visits v JOIN links l ON l.id = v.link_id WHERE v.day >= ? GROUP BY l.id ORDER BY n DESC LIMIT 8"),
    env.DB.prepare("SELECT COUNT(*) AS n FROM requests WHERE status = 'new'").first(),
  ]);
  const t = totals[0] || {};
  const reach = {};
  for (const r of sections) for (const s of r.sections.split(",")) if (s) reach[s] = (reach[s] || 0) + 1;
  return json({ days, since, daily, totals: { visits: t.visits || 0, people: t.people || 0, avg_time: t.avg_time || 0, link_opens: t.link_opens || 0, finished: t.finished || 0 },
    referrers, countries, cities, devices, sections: Object.entries(reach).map(([name, n]) => ({ name, n })).sort((a, b) => b.n - a.n), events, links, new_requests: newReq ? newReq.n : 0 });
}

// ================= Telegram alerts (optional) =================
async function telegram(env, text) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return false;
  try {
    const r = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
    });
    return r.ok;
  } catch { return false; }
}
async function telegramTest(env) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) throw new HttpError(400, "Telegram is not configured on the server");
  const ok = await telegram(env, "✅ تنبيهات لوحة التحكم شغالة.");
  if (!ok) throw new HttpError(502, "Telegram rejected the message — check the bot token and chat id");
  return json({ ok: true });
}
