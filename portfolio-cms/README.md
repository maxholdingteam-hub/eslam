# Portfolio CMS

بورتفوليو احترافي بلغتين (عربي / إنجليزي) + لوحة تحكم كاملة، شغّال على Cloudflare.

- **الموقع**: `https://your-domain.com` — نفس تصميم بورتفوليو أحمد، كل الكلام والصور بتيجي من قاعدة البيانات.
- **لوحة التحكم**: `https://your-domain.com/admin`

## لوحة التحكم فيها إيه

| القسم | بيعمل إيه |
|---|---|
| الرئيسية | عدد الزيارات والزوار، جايين منين، الدول، موبايل ولا كمبيوتر، ضغطات واتساب والإيميل، وزرار PDF عربي وإنجليزي |
| تعديل المحتوى | كل خانة في الموقع بالعربي والإنجليزي جنب بعض: البيانات، الأرقام، النبذة، الخبرات، المهارات، المشاريع، التواصل، الألوان، وجوجل |
| استيراد من CV | ترفع الـ CV (PDF) والذكاء الاصطناعي (Claude) يملا كل الخانات بالعربي والإنجليزي، وانت تراجع وتحفظ |
| الصور والملفات | رفع صور وPDF (لحد 15 ميجا)، تستخدمها في المشاريع والصورة الشخصية وصورة المشاركة |
| الرسائل | الرسايل اللي بتيجي من فورم التواصل في الموقع، مع رد بالإيميل أو واتساب |
| النسخ السابقة | كل حفظ بيحتفظ بالنسخة اللي قبله (آخر 30)، وتقدر ترجع لأي واحدة |

الـ PDF: `/?print=1&lang=ar` أو `/?print=1&lang=en` بيفتح نسخة الطباعة، وتختار «Save as PDF». النسخة دي من غير ظلال، فبتظهر سليمة على الآيفون.

## الرفع على Cloudflare (أول مرة)

محتاج حساب Cloudflare (مجاني) ودومين. أسهل حاجة تشتري الدومين من Cloudflare نفسه (Domain Registration)، وساعتها بيتربط لوحده.

```bash
cd portfolio-cms
npm install
npx wrangler login
```

```bash
npx wrangler d1 create portfolio
```

انسخ الـ `database_id` اللي هيطلع وحطه في `wrangler.jsonc` مكان `REPLACE_WITH_D1_ID`.

```bash
npx wrangler r2 bucket create portfolio-media
```

(لو طلب تفعيل R2، فعّله من لوحة Cloudflare > R2. الاستخدام الصغير مجاني.)

```bash
npm run db:init:remote
```

```bash
npx wrangler secret put ADMIN_PASSWORD
```

```bash
npx wrangler secret put ANTHROPIC_API_KEY
```

(مفتاح Anthropic من console.anthropic.com. مطلوب لـ «استيراد من CV» بس.)

```bash
npm run deploy
```

### ربط الدومين

Cloudflare > Workers & Pages > `portfolio-cms` > Settings > Domains & Routes > Add > Custom domain، واكتب الدومين (مثلاً `ahmedzahran.com`) وكمان `www.ahmedzahran.com`.

## التكلفة

- Cloudflare (Workers + D1 + R2): مجاني للاستخدام ده.
- الدومين: حوالي 10 لـ 15 دولار في السنة لـ `.com`.
- استيراد CV بالذكاء الاصطناعي: بيتحسب على كل مرة استيراد بس (سنتات قليلة للـ CV العادي).

## تشغيل محلي للتجربة

```bash
printf 'ADMIN_PASSWORD=test\n' > .dev.vars
```

```bash
npm run db:init:local
```

```bash
npm run dev
```

وافتح `http://localhost:8787` و `http://localhost:8787/admin`.

## الأمان

- باسورد واحد للوحة التحكم (secret على السيرفر)، والجلسة في كوكي `HttpOnly` و `SameSite=Strict` لمدة 14 يوم.
- حماية من تخمين الباسورد (8 محاولات كل 15 دقيقة) ومن السبام في فورم التواصل (5 رسايل في الساعة + حقل مخفي للبوتات).
- كل الكلام بيتعرض كنص (مفيش HTML من المحتوى بيتنفذ).
- الإحصائيات من غير كوكيز ومن غير تخزين IP.

## الملفات

| الملف | المحتوى |
|---|---|
| `src/index.js` | السيرفر: الصفحات والـ API والصور والرسايل والإحصائيات |
| `src/content.js` | شكل المحتوى (الخانات) + المحتوى الافتراضي (أحمد زهران) |
| `src/cv.js` | قراءة الـ CV بـ Claude وتحويله لمحتوى |
| `public/template.html` | تصميم الموقع |
| `public/admin/index.html` | لوحة التحكم |
| `migrations/0001_init.sql` | جداول قاعدة البيانات |
