# Hilux 2027 v2 (all real footage, 4K): writes reg/web/cars/hilux27/film2.json
# Music (client pick #3): OpenTracks ot_20880 "Carpet of the Sun, Beyond the Desert" (Addpico), 94 BPM, maqam hijaz, cut on downbeats:
#   A track 25.23 -> ad 0 (big hit 35.10 -> ad 9.87 reveal; drop 55.87 -> ad 30.64) ... 63.53 -> ad 38.30
#   B track 89.05 -> ad 38.30 (big hit 96.37 -> ad 45.62 hero) ... 101.82 -> ad 51.07
#   C track 137.57 -> ad 51.07 (music stops 143.44 -> ad 56.94: logo lands; tail to ~61.5)
import json, os
D = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
EU, AU = 'dl/hxo/eu4k.mp4', 'dl/hxo/sr5_{}.mp4'
P = 'lib/stock/src/'
R, DROP, NIGHT, HERO, ENG, END, DUR = 9.87, 30.64, 38.30, 45.62, 51.07, 55.94, 61.5

def v(t0, t1, src, ss, **k):
    return dict(kind='vid', src=src, ss=ss, t0=t0, t1=t1, **k)

shots = [
    # act 1: the desert speaks (Saudi character)
    v(0.00, 2.54, P + 'p_falcon/px4186980_1080.mp4', 3.5, cx0=0.50, cx1=0.53, z0=1.0, z1=1.08, lut='warm'),
    v(2.54, 5.09, P + 'p_dunes/px11063830_2160.mp4', 1.3, cx0=0.80, cx1=0.84, z0=1.0, z1=1.06, lut='warm'),
    v(5.09, 7.65, P + 'p_arab/px19448053_2160.mp4', 5.9, speed=0.5, cx0=0.66, cx1=0.69, z0=1.0, z1=1.05, lut='warm'),
    v(7.65, 8.93, P + 'p_falcon/px10895820_1080.mp4', 16.0, cx0=0.30, z0=1.0, z1=1.05, lut='warm'),
    v(8.93, R, AU.format(372), 5.2, cx0=0.72, cx1=0.72, z0=1.0, z1=1.06, lut='desert_strong', dust=0.3),
    # reveal on the big hit: the truck bursts out of the dust, then the hero front
    v(R, 12.76, AU.format(408), 1.0, speed=0.8, cx0=0.44, cx1=0.47, z0=1.0, z1=1.1, lut='desert_strong', tin='flash', dust=0.4),
    v(12.76, 15.31, 'dl/hxo/sr5_514fB.mp4', 0.1, cx0=0.48, cx1=0.50, z0=1.06, z1=1.0, lut='desert_strong'),
    # power montage, cut on beats (bar 2.553 s, beat 0.638 s)
    v(15.31, 15.95, EU, 10.65, cx0=0.47, lut='desert'),
    v(15.95, 16.59, EU, 2.05, cx0=0.45, lut='desert'),
    v(16.59, 17.86, AU.format(138), 0.5, cx0=0.5, z0=1.0, z1=1.06, lut='desert'),
    v(17.86, 20.42, AU.format(422), 2.0, cx0=0.42, cx1=0.48, z0=1.0, z1=1.05, lut='desert_strong'),
    v(20.42, 22.96, EU, 18.4, cx0=0.55, cx1=0.62, lut='desert_strong'),
    v(22.96, 24.24, EU, 44.2, speed=0.75, cx0=0.60, lut='desert'),
    v(24.24, 25.53, EU, 45.2, speed=0.75, cx0=0.5, lut='desert'),
    v(25.53, 26.80, EU, 29.0, cx0=0.45, lut='desert_strong'),
    v(26.80, 28.07, AU.format(347), 3.0, cx0=0.40, z0=1.0, z1=1.05, lut='desert_strong'),
    v(28.07, 29.36, AU.format(446), 0.3, cx0=0.45, z0=1.0, z1=1.05, lut='desert_strong'),
    v(29.36, DROP, EU, 42.2, cx0=0.66, lut='desert_strong'),
    # the drop: 235 hp with the horses running beside the truck
    v(DROP, 31.91, AU.format(408), 3.3, cx0=0.46, z0=1.0, z1=1.06, lut='desert_strong', dust=0.3),
    v(31.91, 33.18, AU.format(372), 6.0, cx0=0.5, z0=1.0, z1=1.06, lut='desert_strong'),
    v(33.18, 35.75, EU, 54.16, speed=0.78, cx0=0.62, lut='desert'),
    v(35.75, 37.03, EU, 40.2, speed=0.75, cx0=0.52, lut='desert_strong'),
    v(37.03, NIGHT, EU, 51.2, speed=0.79, cx0=0.45, lut='desert', tout='dip'),
    # night: Arabian hospitality
    v(NIGHT, 40.85, P + 'p_camels/px15405842_1080.mp4', 3.8, speed=0.6, cx0=0.48, z0=1.0, z1=1.04, lut='warm', tin='dip'),
    v(40.85, 42.12, P + 'p_coffee/px6358277_1080.mp4', 0.6, cx0=0.47, z0=1.0, z1=1.04, lut='warm'),
    v(42.12, 43.39, P + 'p_coffee/px5988404_2160.mp4', 2.0, cx0=0.40, z0=1.0, z1=1.03, lut='warm'),
    v(43.39, HERO, P + 'p_fire/px4154532_2160.mp4', 1.0, cx0=0.59, lut='warm'),
    # hero on the second big hit
    v(HERO, 48.52, 'dl/hxo/sr5_514fA.mp4', 0.1, cx0=0.46, cx1=0.48, z0=1.04, z1=1.0, lut='desert_strong', tin='flash'),
    v(48.52, ENG, P + 'p_camels/px14862729_1080x1920.mp4', 1.0, cx0=0.5, z0=1.0, z1=1.05, lut='warm'),
    v(ENG, END, P + 'p_sand/px19745259_2160.mp4', 0.5, speed=0.5, cx0=0.5, z0=1.0, z1=1.06, lut='warm'),
    v(END, DUR, P + 'p_stars/px5170522_2160.mp4', 0.25, cx0=0.44, z0=1.0, z1=1.05, lut='night'),
]
mg = [
    dict(type='title', t0=R + 0.1, t1=15.2, logo='pro/ksa_logo_hilux_wordmark_italic.svg', w=640, h=106, y=330, year='2027', ar='الجديدة <acc>كلياً</acc>'),
    dict(type='chips', t0=20.5, t1=24.15, y=1330, s0=0.1, st=0.25, items=['محرك بنزين [4.0] لتر', '[6] سلندر', 'دفع رباعي [4×4]']),
    dict(type='counter', t0=DROP, t1=35.6, y=640, num=235, unit='حصان', sub='عزم [376] نيوتن متر · أوتوماتيك [6] سرعات', c0=0.3, cnt=2.24),
    dict(type='chips', t0=35.85, t1=38.25, y=1330, s0=0.1, st=0.3, items=['دفع رباعي بدوام جزئي [4H · 4L]', 'قفل دفرنس خلفي']),
    dict(type='flare', t0=HERO + 0.05, t1=HERO + 1.45, y=820, x0=-300, x1=1380),
    dict(type='engines', t0=ENG, t1=END, dim=0.62, kicker='ENGINES', title='تقدر <acc>تطلبها</acc>',
         rows=[['بنزين [4.0] لتر · [6] سلندر', '[235] حصان'], ['ديزل [2.8] لتر تيربو', '[201] حصان'], ['بنزين [2.7] لتر', '[164] حصان']],
         note='المواصفات والتجهيزات تختلف حسب الفئة'),
    dict(type='end', t0=END, t1=DUR, dim=0.72, name='تويوتا <acc>هايلكس</acc> [2027]', cta='اطلبها الحين من ماكس موتورز'),
]
texts = [
    dict(t0=HERO + 0.6, t1=50.95, y=1545, cls='k', html='HILUX 2027', anim='track', ls=16),
    dict(t0=HERO + 0.9, t1=50.95, y=1590, cls='t2', html='رفيقك في <acc>كل مشوار</acc>'),
]
captions = [   # follow the VO lines (placeholder timing until the recorded VO arrives)
    dict(t0=0.7, t1=5.0, html='في أرضٍ ما ترحم… ما يصمد إلا الأقوى.'),
    dict(t0=5.3, t1=9.7, html='مثل الصقر… عينه دايم على القمة.'),
    dict(t0=12.3, t1=20.8, html='هايلكس [2027]… الأسطورة رجعت، جديدة كلياً.'),
    dict(t0=36.4, t1=40.6, html='دفع رباعي… ما يعرف المستحيل.'),
    dict(t0=40.7, t1=44.75, html='ولين يجي الليل… تلقاها جنبك.'),
]
C = dict(_src='Hilux 2027 v2: official Toyota press footage (EU newsroom 4K clip + AU Pressroom SR5 4K; editorial licence, ALJ/Toyota written consent needed for paid ads), Pexels stock (Pexels License), music OpenTracks ot_20880 (OpenTracks licence: commercial/ads OK, no credit).',
         dur=DUR, acc='#D4AF6A', bars=0, wm=0.42, wmOff=END, fadeIn=0.5, shots=shots, mg=mg, texts=texts, captions=captions, ovl=[])
out = f'{D}/reg/web/cars/hilux27/film2.json'
json.dump(C, open(out, 'w'), ensure_ascii=False, indent=1)
# sanity: shots tile the timeline
for a, b in zip(shots, shots[1:]): assert abs(a['t1'] - b['t0']) < 1e-9, (a, b)
print('ok', out, len(shots), 'shots', shots[-1]['t1'], 's')
