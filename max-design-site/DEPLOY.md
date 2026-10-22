# Max Design website — deploy

Static site: `index.html`, `img/`, `robots.txt`, `sitemap.xml`, `404.html`, `_headers`. No build step.

## Cloudflare Pages (current host)
1. dash.cloudflare.com → **Workers & Pages → Create → Pages → Connect to Git** → repo `maxholdingteam-hub/eslam`.
2. Production branch: `main`. Framework preset: **None**. Build command: *(empty)*. Build output directory: `max-design-site`.
3. Save and Deploy. Every merge to `main` redeploys automatically.

## Custom domain maxdesign.sa
1. Cloudflare → **Add a domain** → `maxdesign.sa` → Free plan. Cloudflare imports the existing DNS records
   (keep the `google-site-verification` TXT record).
2. At the registrar (DNET), replace the nameservers with the two Cloudflare nameservers shown.
3. When the zone is active: Pages project → **Custom domains** → add `maxdesign.sa` and `www.maxdesign.sa`.
   Cloudflare creates the DNS records and the HTTPS certificate.

## Contact form
The project-brief form opens WhatsApp (+966 57 927 7975) with the brief pre-filled. There is no
server-side form storage on this host.

## SEO
After going live, add the site in Google Search Console and submit `https://maxdesign.sa/sitemap.xml`.
