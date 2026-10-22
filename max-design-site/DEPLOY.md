# Max Design website — deploy to maxdesign.sa

Static site: `index.html` + `img/`. No build step.

## Option A — Netlify (free)
1. Go to app.netlify.com → **Add new site → Deploy manually**, drag this `max-design-site` folder in.
   (Or **Import from Git** → this repo → base directory `max-design-site`, no build command, publish directory `max-design-site`.)
2. **Domain management → Add a domain** → `maxdesign.sa` and `www.maxdesign.sa`.
3. At your domain registrar's DNS, remove the Google Sites records, then add what Netlify shows, typically:
   - `A` record `@` → `75.2.60.5`
   - `CNAME` record `www` → `<your-site>.netlify.app`
4. Netlify issues HTTPS automatically once DNS resolves.

## Option B — Vercel (free)
1. vercel.com → **Add New → Project** → import this repo → Root Directory `max-design-site`, Framework "Other".
2. **Settings → Domains** → add `maxdesign.sa` and follow the DNS records it shows
   (usually `A @ 76.76.21.21` and `CNAME www cname.vercel-dns.com`).

Before switching DNS, also remove the custom domain from Google Sites (Settings → Custom domains).
