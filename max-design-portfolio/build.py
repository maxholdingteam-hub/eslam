#!/usr/bin/env python3
"""Generate the Max Design portfolio deck (HTML, 1920x1080 slides)."""
import sys, pathlib

OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "deck.html")

PHONE = "+966 57 927 7975"
EMAIL = "info@maxdesign.sa"
WEB = "maxdesign.sa"
ADDR_EN = "Wadi Al-Sukhayrah St., Al-Qadisiyah, Riyadh"
ADDR_AR = "شارع وادي الصخيرة، القادسية، الرياض"

slides = []
page = 0


def S(html, cls="", footer=True):
    global page
    page += 1
    foot = ""
    if footer:
        foot = f"""<div class="foot"><div class="brand"><img src="a/logo.png"><span>MAX DESIGN</span></div>
        <div class="pg">{page:02d}</div></div>"""
    slides.append(f'<section class="slide {cls}">{html}{foot}</section>')


def head(en, ar, kicker="", kicker_ar=""):
    k = ""
    if kicker:
        k = f'<div class="kick"><span>{kicker}</span><span class="ar">{kicker_ar}</span></div>'
    return f"""<header class="hd">{k}<div class="ttl"><h2>{en}</h2><h2 class="ar">{ar}</h2></div><div class="rule"></div></header>"""


def img(src, cap="", cls=""):
    c = f'<figcaption>{cap}</figcaption>' if cap else ""
    return f'<figure class="ph {cls}"><img src="a/{src}">{c}</figure>'


def sheet(src, cap_en="", cap_ar="", cls=""):
    cap = ""
    if cap_en or cap_ar:
        cap = f'<figcaption><span>{cap_en}</span><span class="ar">{cap_ar}</span></figcaption>'
    return f'<figure class="sheet {cls}"><div class="paper"><img src="a/{src}"></div>{cap}</figure>'


def divider(no, en, ar, img_src, sub_en, sub_ar, facts, link=""):
    f = "".join(f'<div class="fact"><b>{v}</b><span>{k_en}</span><span class="ar">{k_ar}</span></div>'
                for k_en, k_ar, v in facts)
    S(f"""<div class="bleed" style="background-image:url(a/{img_src})"></div><div class="shade"></div>
    <div class="div-in">
      <div class="no">{no}</div>
      <div class="lbl">PROJECT <span class="ar">مشروع</span></div>
      <h1>{en}</h1><h1 class="ar">{ar}</h1>
      <div class="gl"></div>
      <p>{sub_en}</p><p class="ar">{sub_ar}</p>
      <div class="facts">{f}</div>
    </div>
    {f'<a class="online" data-href="https://maxdesign.sa/#{link}">VIEW FULL PROJECT ONLINE <span class="ar">شاهد المشروع كامل على موقعنا</span> <b>↗</b></a>' if link else ''}""", "divider")


def grid(en, ar, kicker, kicker_ar, items, layout):
    body = "".join(items)
    S(f'{head(en, ar, kicker, kicker_ar)}<div class="grid {layout}">{body}</div>')


# ---------------------------------------------------------------- 1 cover
S(f"""<div class="bleed" style="background-image:url(a/hero.jpg);left:38%"></div>
<div class="cover-fade"></div>
<div class="cover-l">
  <div class="tag">DESIGN <i>/</i> PLAN <i>/</i> BUILD</div>
  <img class="logo-big" src="a/logo.png">
  <div class="word">MAX DESIGN</div>
  <div class="word-sub">ARCHITECTURAL DESIGN &amp; CONSTRUCTION</div>
  <div class="word-ar ar">ماكس ديزاين للتصميم المعماري والتنفيذ</div>
  <div class="gl"></div>
  <div class="cv-t">PORTFOLIO <span class="ar">معرض الأعمال</span></div>
  <div class="cv-c">
    <div><span class="ic">☎</span><span dir="ltr">{PHONE}</span></div>
    <div><span class="ic">✉</span>{EMAIL}</div>
    <div><span class="ic">⌖</span>Riyadh, Saudi Arabia <span class="ar">— الرياض، المملكة العربية السعودية</span></div>
  </div>
</div>
<div class="cover-tr">WE DESIGN A LIFESTYLE<br><span class="ar">نصمم أسلوب حياة</span></div>""", "cover", footer=False)

# ---------------------------------------------------------------- 2 about
S(f"""{head("About Us", "من نحن", "WHO WE ARE", "تعرّف علينا")}
<img class="sketch" src="a/sketch-gold.jpg">
<div class="about-in">
  <div class="col en">
    <p class="lead">At Max Design, we don't just design spaces — <em>we design a lifestyle.</em></p>
    <p>We specialise in interior design and project execution — from apartments, villas and palaces to retail stores and corporate headquarters. Every project carries our signature, from the first concept sketch to the very last detail on site.</p>
    <p>We believe the place you live or work in should reflect your personality and taste, so every project unites <b>luxury, function and individuality</b>.</p>
  </div>
  <div class="col ar">
    <p class="lead">في ماكس ديزاين، ما نصمم مساحات… <em>احنا نصمم أسلوب حياة.</em></p>
    <p>متخصصين في التصميم الداخلي وتنفيذ المشاريع، من الشقق السكنية والفلل والقصور، إلى المحلات التجارية ومقرات الشركات. كل مشروع نتعامل معه كأنه بصمتنا الخاصة، من أول فكرة لين آخر تفصيلة في التنفيذ.</p>
    <p>نؤمن إن المكان اللي تعيش أو تشتغل فيه لازم يعكس شخصيتك وذوقك، ولذا نحرص إن كل مشروع يجمع بين <b>الفخامة، الوظيفية، والتفرد</b>.</p>
  </div>
</div>""", "about")

# ---------------------------------------------------------------- 3 services
svc = [
    ("Palaces", "تصميم وتنفيذ القصور", "Luxurious designs with refined details and premium materials in every corner.", "تصاميم فاخرة بتفاصيل دقيقة وخامات فاخرة تعكس الفخامة والتميز."),
    ("Villas", "تصميم وتنفيذ الفلل", "Complete design for every floor, with full supervision through handover.", "تصميم شامل لكل أدوار الفيلا مع إشراف كامل لين التسليم."),
    ("Apartments", "تصميم الشقق السكنية", "Modern, practical interiors — from space planning to colours and finishes.", "تصميم داخلي عصري وعملي، من توزيع المساحات لين الألوان والخامات."),
    ("Project Management", "إدارة وتنفيذ المشاريع", "Step-by-step execution: materials, contractors and final delivery.", "نتابع التنفيذ خطوة بخطوة، من الخامات والمقاولين لين التسليم."),
    ("Retail Stores", "تصميم المحلات التجارية", "A distinctive identity that attracts customers at first sight.", "هوية بصرية مميزة تجذب العميل من أول نظرة."),
    ("Offices & HQs", "المكاتب ومقرات الشركات", "Professional workplaces that boost productivity and reflect your brand.", "بيئة عمل احترافية تعزز الإنتاجية وتعكس هوية شركتك."),
]
cards = "".join(f"""<div class="svc"><div class="n">{i+1:02d}</div><h3>{e}</h3><h3 class="ar">{a}</h3>
<p>{pe}</p><p class="ar">{pa}</p></div>""" for i, (e, a, pe, pa) in enumerate(svc))
S(f'{head("Our Services", "خدماتنا", "WHAT WE DO", "ماذا نقدم")}<div class="svcs">{cards}</div>')

# ---------------------------------------------------------------- 4 approach
steps = [
    ("Design", "التصميم", "Concept, space planning and 3D visualisation tailored to the client.", "الفكرة وتوزيع المساحات والتصور ثلاثي الأبعاد حسب ذوق العميل."),
    ("Materials", "اختيار الخامات", "Curated finishes, colour palettes and mood boards for every room.", "اختيار التشطيبات ولوحات الألوان والمود بورد لكل مساحة."),
    ("Supervision", "الإشراف على التنفيذ", "Engineering drawings and on-site supervision at every stage.", "مخططات هندسية وإشراف ميداني في كل مرحلة."),
    ("Handover", "التسليم النهائي", "A seamless experience from day one to the final key.", "تجربة سلسة من أول يوم لين تسليم المفتاح."),
]
st = "".join(f"""<div class="step"><div class="sn">{i+1:02d}</div><h3>{e}</h3><h3 class="ar">{a}</h3><p>{pe}</p><p class="ar">{pa}</p></div>"""
             for i, (e, a, pe, pa) in enumerate(steps))
S(f"""{head("Our Approach", "منهجيتنا", "DESIGN / PLAN / BUILD", "صمّم / خطّط / نفّذ")}
<div class="phil"><p>We design architecture that responds intelligently to its climate and context — natural daylight, solar control, natural ventilation and energy-conscious materials — creating spaces that are beautiful, comfortable and enduring.</p>
<p class="ar">نصمم عمارة تتجاوب بذكاء مع مناخها وسياقها — إضاءة طبيعية، تحكم في أشعة الشمس، تهوية طبيعية، وخامات موفّرة للطاقة — عشان نطلع مساحات جميلة، مريحة، وتعيش طويل.</p></div>
<div class="steps">{st}</div>""", "approach")

# ---------------------------------------------------------------- 5 index
projects = [
    ("01", "HITC Office Building", "مبنى مكاتب HITC", "003-003.jpg"),
    ("02", "Forest Villas – Green Acres", "مجمع فوريست فيلاز", "012-045.jpg"),
    ("03", "Residential Villa", "فيلا سكنية", "013-049.jpg"),
    ("04", "PROGER DQ Office", "مكتب بروجر DQ", "019-084.jpg"),
    ("05", "SIH Residence", "مسكن SIH", "025-108.jpg"),
    ("06", "Sheikh Hassan Villa", "فيلا الشيخ حسن", "r-39.jpg"),
]
IDS = ["hitc", "forest", "villa", "proger", "sih", "residence"]
ix = "".join(f"""<div class="ix" data-href="https://maxdesign.sa/#{IDS[i]}"><div class="im" style="background-image:url(a/{s})"></div><div class="n">{n}</div><h3>{e}</h3><h3 class="ar">{a}</h3><span class="go">↗</span></div>"""
             for i, (n, e, a, s) in enumerate(projects))
S(f'{head("Selected Projects", "مختارات من أعمالنا", "PORTFOLIO", "معرض الأعمال")}<div class="index six">{ix}</div><div class="ix-note">Tap any project to open it on our website <span class="ar">· اضغط على أي مشروع لفتحه على موقعنا</span></div>')

# ---------------------------------------------------------------- P1 HITC
divider("01", "HITC Office Building", "مبنى مكاتب HITC", "003-003.jpg",
        "Home International Trading Company — a landmark project serving both purpose and aesthetics.",
        "شركة هوم الدولية للتجارة — مشروع مميّز يجمع بين الوظيفة والجمال.",
        [("Type", "النوع", "Office"), ("Ground Floor", "الدور الأرضي", "173 m²"), ("First Floor", "الدور الأول", "273 m²"), ("Status", "الحالة", "Built")], link="hitc")
S(f"""{head("Concept & Design Intent", "الفكرة والتوجه التصميمي", "PROJECT 01", "المشروع 01")}
<div class="board"><img src="a/004-004.jpg"></div>""", "boardslide")
S(f"""{head("Floor Plans", "المساقط الأفقية", "PROJECT 01", "المشروع 01")}
<div class="grid g-plans">{sheet("d005-006.jpg", "Legend", "دليل الفراغات", "legend")}{sheet("d005-008.jpg", "Ground Floor Plan · 173 m²", "مسقط الدور الأرضي")}{sheet("d005-010.jpg", "First Floor Plan · 273 m²", "مسقط الدور الأول")}</div>""")
grid("Structure & Section", "الشبكة الإنشائية والقطاع", "PROJECT 01", "المشروع 01",
     [sheet("d006-016.jpg", "Grid Plan", "الشبكة الإنشائية"), sheet("d006-014.jpg", "Section A-A", "قطاع أ-أ")], "g-2w")
grid("Elevations", "الواجهات", "PROJECT 01", "المشروع 01",
     [sheet("d007-018.jpg", "North Elevation", "الواجهة الشمالية"), sheet("d007-020.jpg", "East Elevation", "الواجهة الشرقية")], "g-rows")
grid("On-Site Construction", "مراحل التنفيذ في الموقع", "PROJECT 01", "المشروع 01",
     [img("008-021.jpg"), img("008-024.jpg"), img("008-022.jpg"), img("008-023.jpg")], "g-onsite1")

grid("The Completed Building", "المبنى بعد التسليم", "PROJECT 01", "المشروع 01",
     [img("h-02.jpg"), img("h-03.jpg"), img("h-01.jpg"), img("h-07.jpg"), img("h-04.jpg"), img("h-11.jpg")], "g-6")
grid("Completed Interiors", "المكاتب من الداخل", "PROJECT 01", "المشروع 01",
     [img("h-09.jpg"), img("h-10.jpg"), img("h-06.jpg"), img("h-05.jpg")], "g-4")
grid("Construction Progress", "مراحل البناء", "PROJECT 01", "المشروع 01",
     [img("h-00.jpg"), img("h-12.jpg"), img("h-13.jpg"), img("h-14.jpg"), img("h-16.jpg"), img("h-15.jpg")], "g-6")

# ---------------------------------------------------------------- P2 Forest Villas
divider("02", "Forest Villas – Green Acres", "مجمع فوريست فيلاز – جرين إيكرز", "012-045.jpg",
        "A project that defines perfection aesthetically — the whole idea is contrast and connection.",
        "مشروع يجسّد الكمال الجمالي — فكرته كلها قائمة على التباين والترابط.",
        [("Type", "النوع", "Residential"), ("Levels", "الأدوار", "B + G + 5"), ("Amenities", "المرافق", "Club · Gym · Pool")], link="forest")
grid("Basement & Ground Floor", "القبو والدور الأرضي", "PROJECT 02", "المشروع 02",
     [sheet("d009-026.jpg", "Basement Plan", "مسقط القبو"), sheet("d009-030.jpg", "Ground Floor Plan", "مسقط الدور الأرضي")], "g-2t")
grid("Typical Floors", "الأدوار المتكررة", "PROJECT 02", "المشروع 02",
     [sheet("d010-032.jpg", "First Floor", "الدور الأول"), sheet("d010-034.jpg", "Second Floor", "الدور الثاني"), sheet("d010-036.jpg", "Third Floor", "الدور الثالث")], "g-3t")
grid("Upper Floors", "الأدوار العليا", "PROJECT 02", "المشروع 02",
     [sheet("d011-042.jpg", "Fourth Floor", "الدور الرابع"), sheet("d011-044.jpg", "Fifth Floor", "الدور الخامس"), img("012-047.jpg", "", "tall")], "g-3t")
grid("Exterior Renders", "التصورات الخارجية", "PROJECT 02", "المشروع 02",
     [img("012-046.jpg"), img("012-048.jpg"), img("012-047.jpg"), img("012-045.jpg")], "g-4")

# ---------------------------------------------------------------- P3 Residential Villa
divider("03", "Residential Villa", "فيلا سكنية", "013-049.jpg",
        "Contemporary family villa — stone, timber and light working in harmony.",
        "فيلا عائلية معاصرة — حجر وخشب وإضاءة في تناغم كامل.",
        [("Type", "النوع", "Villa"), ("Area", "المساحة", "500 m²"), ("Scope", "النطاق", "Design + Interior + Build")], link="villa")
grid("Measurement Plans", "المساقط الأفقية", "PROJECT 03", "المشروع 03",
     [sheet("d014-051.jpg", "Basement · 2785 sft", "القبو"), sheet("d014-053.jpg", "Ground Floor · 2785 sft", "الدور الأرضي"), sheet("d014-055.jpg", "First Floor · 2195 sft", "الدور الأول")], "g-3t")
grid("Elevations & Sections", "الواجهات والقطاعات", "PROJECT 03", "المشروع 03",
     [sheet("d015-057.jpg", "Front Elevation", "الواجهة الأمامية"), sheet("d015-059.jpg", "Section A-A", "قطاع أ-أ"),
      sheet("d015-061.jpg", "Side Elevation", "الواجهة الجانبية"), sheet("d015-063.jpg", "Section B-B", "قطاع ب-ب")], "g-4")
grid("Interior Colour Palettes", "لوحات الألوان الداخلية", "PROJECT 03", "المشروع 03",
     [img(f"016-0{n}.jpg", "", "mood") for n in range(64, 72)], "g-mood")
grid("On-Site Construction", "مراحل التنفيذ في الموقع", "PROJECT 03", "المشروع 03",
     [img("017-073.jpg"), img("017-072.jpg"), img("017-074.jpg"), img("017-075.jpg"), img("017-076.jpg")], "g-onsite3")
grid("Completed Interiors", "التشطيبات الداخلية المنفذة", "PROJECT 03", "المشروع 03",
     [img("018-077.jpg"), img("018-078.jpg"), img("018-079.jpg"), img("018-081.jpg"), img("018-080.jpg"), img("018-083.jpg")], "g-int3")

# ---------------------------------------------------------------- P4 Proger
divider("04", "PROGER DQ Office", "مكتب بروجر DQ", "019-084.jpg",
        "A flexible, modern workplace — designed, built and delivered in Riyadh.",
        "بيئة عمل عصرية ومرنة — تصميم وتنفيذ وتسليم في الرياض.",
        [("Type", "النوع", "Office Fit-out"), ("Area", "المساحة", "229.8 m²"), ("Completed", "التسليم", "Jan 2026")], link="proger")
S(f"""{head("Office Layout Plan", "مخطط توزيع المكتب", "PROJECT 04", "المشروع 04")}
<div class="grid g-1">{sheet("d020-plan.jpg", "Gross Internal Area 229.76 m² · Scale 1:50", "إجمالي المساحة الداخلية ٢٢٩٫٧٦ م²")}</div>""")
grid("Interior Renders", "التصورات الداخلية", "PROJECT 04", "المشروع 04",
     [img("021-087.jpg"), img("021-088.jpg"), img("021-089.jpg"), img("021-090.jpg")], "g-4")
grid("Workspaces", "مساحات العمل", "PROJECT 04", "المشروع 04",
     [img("022-091.jpg"), img("022-092.jpg"), img("022-093.jpg"), img("022-094.jpg")], "g-4")
grid("On-Site Works", "الأعمال في الموقع", "PROJECT 04", "المشروع 04",
     [img("023-096.jpg"), img("023-097.jpg"), img("023-102.jpg"), img("023-099.jpg"), img("023-100.jpg"), img("023-101.jpg")], "g-6")
grid("Project Completion", "تسليم المشروع", "PROJECT 04", "المشروع 04",
     [img("024-107.jpg"), img("024-104.jpg"), img("024-105.jpg"), img("024-106.jpg"), img("024-103.jpg")], "g-done4")

# ---------------------------------------------------------------- P5 SIH
divider("05", "SIH Residence", "مسكن SIH", "025-108.jpg",
        "A heritage-inspired residence — arches, domes and hand-crafted brick masonry.",
        "سكن مستوحى من العمارة التراثية — أقواس وقباب وأعمال طوب يدوية.",
        [("Type", "النوع", "Residence"), ("Style", "الطراز", "Heritage"), ("Status", "الحالة", "Built")], link="sih")
grid("Floor Plans", "المساقط الأفقية", "PROJECT 05", "المشروع 05",
     [sheet("d026-109.jpg", "Ground Floor Plan", "مسقط الدور الأرضي"), sheet("d026-110.jpg", "First Floor Plan", "مسقط الدور الأول")], "g-2w")
grid("Elevations", "الواجهات", "PROJECT 05", "المشروع 05",
     [sheet("d027-111.jpg", "East & West Elevations", "الواجهتان الشرقية والغربية")], "g-1")
grid("Roof Plan & Section", "مسقط السطح والقطاع", "PROJECT 05", "المشروع 05",
     [sheet("d028-112.jpg", "Roof Drainage Plan", "مسقط تصريف السطح"), sheet("d028-113.jpg", "Section A-A", "قطاع أ-أ")], "g-2w")
grid("Site Progress", "مراحل التنفيذ", "PROJECT 05", "المشروع 05",
     [img("029-114.jpg"), img("029-115.jpg"), img("029-116.jpg"), img("029-117.jpg"), img("029-118.jpg"), img("029-119.jpg")], "g-6")
grid("Completion", "المشروع بعد التنفيذ", "PROJECT 05", "المشروع 05",
     [img("030-120.jpg"), img("030-121.jpg"), img("030-122.jpg")], "g-done5")

# ---------------------------------------------------------------- P6 Sheikh Hassan Villa
divider("06", "Sheikh Hassan Villa", "فيلا الشيخ حسن", "r-39.jpg",
        "Complete interior design and fit-out of a family villa — every room with its own wall, ceiling and lighting details.",
        "تصميم داخلي وتنفيذ متكامل لفيلا عائلية — كل غرفة بتفاصيل جدارية وأسقف وإضاءة خاصة فيها.",
        [("Type", "النوع", "Residential"), ("Scope", "النطاق", "Interior + Build"), ("Year", "السنة", "2026")], link="residence")
grid("Lounges & Majlis", "المجالس والصالات", "PROJECT 06", "المشروع 06",
     [img("r-39.jpg"), img("r-33.jpg"), img("r-51.jpg"), img("r-34.jpg"), img("r-31.jpg"), img("r-57.jpg")], "g-6")
grid("Bedrooms", "غرف النوم", "PROJECT 06", "المشروع 06",
     [img("r-20.jpg"), img("r-67.jpg"), img("r-32.jpg"), img("r-22.jpg"), img("r-28.jpg"), img("r-55.jpg")], "g-6")
grid("Kids Rooms", "غرف الأطفال", "PROJECT 06", "المشروع 06",
     [img("r-40.jpg"), img("r-74.jpg"), img("r-48.jpg"), img("r-59.jpg"), img("r-69.jpg"), img("r-35.jpg")], "g-6")
grid("Bathrooms & Details", "الحمامات والتفاصيل", "PROJECT 06", "المشروع 06",
     [img("r-30.jpg"), img("r-36.jpg"), img("r-68.jpg"), img("r-29.jpg"), img("r-37.jpg"), img("r-63.jpg")], "g-6")

# ---------------------------------------------------------------- thank you
S(f"""<div class="bleed" style="background-image:url(a/012-048.jpg)"></div><div class="shade full"></div>
<div class="ty">
  <img class="logo-big" src="a/logo.png">
  <h1>THANK YOU</h1><h1 class="ar">شكراً لكم</h1>
  <div class="gl c"></div>
  <p>Let's turn your vision into reality.</p><p class="ar">خلّنا نحوّل رؤيتك لواقع.</p>
  <div class="ty-c">
    <div data-href="https://wa.me/966579277975"><small>PHONE · واتساب</small><b dir="ltr">{PHONE}</b></div>
    <div><small>EMAIL · البريد</small><b>{EMAIL}</b></div>
    <div data-href="https://maxdesign.sa/"><small>WEB · الموقع</small><b>{WEB} ↗</b></div>
    <div data-href="https://www.instagram.com/maxdesign.sa/"><small>INSTAGRAM · TIKTOK</small><b>@maxdesign.sa</b></div>
  </div>
  <a class="online tour" data-href="https://maxdesign.sa/tour/">TAKE THE 360° VILLA TOUR <span class="ar">جولة الفيلا ٣٦٠°</span> <b>↗</b></a>
  <div class="addr">{ADDR_EN} <span class="ar">· {ADDR_AR}</span></div>
</div>""", "thanks", footer=False)

CSS = (pathlib.Path(__file__).parent / "deck.css").read_text()
OUT.write_text(f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Max Design Portfolio</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800&family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>{''.join(slides)}</body></html>""", encoding="utf-8")
print(f"{page} slides -> {OUT}")
