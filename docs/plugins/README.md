# نقل السكيلز والبلجنز للأكونت الجديد

| السكيل / البلجن | مكانه | إزاي ينتقل |
|---|---|---|
| **Higgsfield** (generate, brandkit, faceless-video, product-photoshoot, marketplace-cards, soul-id, video-explainer, websites, youtube-thumbnail) | جوه الريبو: `.claude/skills/` و `.agents/skills/` | **بينتقل لوحده مع الريبو.** بس محتاج تربط Higgsfield MCP على الأكونت الجديد علشان التوليد يشتغل |
| **majed-video** (davinci, montage, motion, podcast, thumbnail, video-ad-editor) | كان مرفوع على أكونتك (My Uploads) | ارفع `docs/plugins/majed-video.zip` على الأكونت الجديد: claude.ai ← Customize ← Plugins ← Upload. (أصله على GitHub: majedphotos/video-ad-editor) |
| **design** و **marketing** | مكتبة Anthropic الرسمية (knowledge-work-plugins) | ثبّتهم من claude.ai ← Customize ← Plugins ← دوّر على Design و Marketing |
| **Abracadabrax Background Music** | دليل البلجنز (anthropic-plugin-directory) | ثبّته من نفس المكان ← دوّر على Abracadabrax (وسجّل دخول بأكونت Abracadabrax لو هتستخدمه) |
| **docx / pdf / pptx / xlsx / docs / deep-research …** | مدمجة في Claude | موجودة تلقائي في أي أكونت — مش محتاجة نقل |

## الكونكتورز (Connectors)
دي مش سكيلز بس الشغل بيعتمد عليها — اربطها على الأكونت الجديد من claude.ai ← Settings ← Connectors:
- **Higgsfield** (صور وفيديو وصوت) — أهم واحد
- **Canva** (لو بتستخدمه)
- **GitHub** من https://claude.ai/connect-github
