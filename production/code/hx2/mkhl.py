# Toyota Highlander 2026 (KSA, 2.5 hybrid 240 hp) cinematic film, all real footage, text only: writes reg/web/cars/highlander26/film.json
# Story: a Saudi family's weekend, from the city at sunrise to AlUla and the dunes (no Hilux scenes reused)
# v2: Saudi car scenes generated on Higgsfield from toyota.com.sa images (Tuwaiq road, Riyadh night, AlUla family, dunes, camp coffee, door)
# Music (client pick #1): Mixkit 587 "Discover" (Eugenio Mininni, Mixkit free licence), 85.8 BPM, cut on downbeats:
#   A track 0.90 -> ad 0 (swell hit 12.945 = ad 12.05 reveal) .. 19.226 -> ad 18.33
#   B track 27.26 -> ad 18.33 (hit 31.544 = ad 22.61 chips, full orchestra 37.907 = ad 28.98: 240 hp) .. 60.941 -> ad 52.01
#   C track 131.158 -> ad 52.01 (outro, logo at 55.3)
import json, os
D = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
X = 'dl/hlx/{}.mp4'; S = 'lib/stock/src/'; H = 'dl/hfhl/hf{}.mp4'   # H: Higgsfield Saudi scenes (Veo 3.1 / Seedance 2.5 from the official KSA images)
R, HIT, DROP, ENG, END, DUR = 12.05, 22.61, 28.98, 52.01, 54.82, 59.5

def v(t0, t1, src, ss, **k):
    return dict(kind='vid', src=src, ss=ss, t0=t0, t1=t1, **k)

shots = [
    # act 1: the city wakes up, the family, the car's details
    v(0.00, 3.00, S + 'cc_morning/mx1618_2160.mp4', 9.0, cx0=0.5, z0=1.0, z1=1.08, lut='warm'),
    v(3.00, 5.40, S + 'cc_family/px13378577_1440.mp4', 6.25, cx0=0.47, z0=1.0, z1=1.05, lut='warm'),
    v(5.40, 7.23, S + 'cc_family/px6300822_2160.mp4', 1.5, cx0=0.51, z0=1.0, z1=1.05, lut='warm'),
    v(7.23, 8.60, X.format('eu_soc1'), 1.4, cx0=0.80, z0=1.0, z1=1.08, lut='cine'),
    v(8.60, 9.93, H.format(6), 3.0, cx0=0.5, z0=1.0, z1=1.04),
    v(9.93, R, X.format('au_1084'), 2.2, cx0=0.60, cx1=0.56, z0=1.0, z1=1.05, lut='cine'),
    # reveal on the swell: golden mountain road
    v(R, 14.90, H.format(1), 0.4, cx0=0.5, z0=1.0, z1=1.06, tin='flash'),
    v(14.90, 16.60, H.format(2), 1.0, cx0=0.5, z0=1.0, z1=1.05),
    v(16.60, 18.33, X.format('au_503'), 10.0, cx0=0.48, z0=1.0, z1=1.06, lut='cine'),
    # the road to AlUla
    v(18.33, 20.40, S + 'p_road/px8865211_1440.mp4', 0.25, cx0=0.5, z0=1.0, z1=1.06, lut='desert'),
    v(20.40, HIT, X.format('au_1084'), 51.9, cx0=0.50, lut='cine'),
    v(HIT, 25.40, X.format('au_503'), 1.0, cx0=0.38, z0=1.0, z1=1.05, lut='cine', tin='flash'),
    v(25.40, DROP, H.format(3), 0.4, cx0=0.5, z0=1.0, z1=1.06),
    # full orchestra: 240 hp, the car plays in the dust
    v(DROP, 31.80, X.format('au_593'), 3.0, speed=0.8, cx0=0.48, cx1=0.55, z0=1.0, z1=1.05, lut='desert', tin='flash'),
    v(31.80, 33.20, X.format('au_593'), 16.3, cx0=0.42, lut='desert'),
    v(33.20, 35.00, X.format('au_593'), 21.0, cx0=0.42, z0=1.0, z1=1.06, lut='desert'),
    v(35.00, 36.40, S + 'p_dunes/px19745264_2160.mp4', 1.0, cx0=0.64, z0=1.0, z1=1.05, lut='warm'),
    v(36.40, 38.60, X.format('au_1084'), 69.3, cx0=0.55, lut='cine'),
    v(38.60, 40.60, X.format('au_503'), 26.0, cx0=0.40, z0=1.0, z1=1.05, lut='cine'),
    v(40.60, 44.60, H.format(4), 0.0, cx0=0.5, z0=1.0, z1=1.05),
    # the camp in the dunes, the car at rest, the last vista
    v(44.60, 47.00, H.format(5), 1.0, cx0=0.5, z0=1.0, z1=1.04),
    v(47.00, 49.30, X.format('au_1084'), 31.0, cx0=0.66, z0=1.0, z1=1.04, lut='cine'),
    v(49.30, ENG, X.format('au_1084'), 1.5, cx0=0.48, z0=1.0, z1=1.06, lut='cine'),
    v(ENG, END, X.format('au_1084'), 34.5, cx0=0.5, z0=1.0, z1=1.04, lut='cine'),
    v(END, DUR, S + 'p_sand/px16905150_2160.mp4', 15.8, cx0=0.5, z0=1.04, z1=1.0, lut='warm'),
]
mg = [
    dict(type='chips', t0=HIT + 0.15, t1=25.3, y=1330, s0=0.1, st=0.25, items=['هايبرد [2.5] لتر', '[3] صفوف مقاعد', 'دفع كلي [E-Four]']),
    dict(type='counter', t0=DROP, t1=33.1, y=640, num=240, unit='حصان', sub='هايبرد [2.5] لتر · ناقل [e-CVT] · وضع [Trail] للطرق الوعرة', c0=0.25, cnt=1.9),
    dict(type='chips', t0=38.7, t1=40.5, y=1330, s0=0.1, st=0.3, items=['إضاءة [LED] أمامية', 'جنوط [20] إنش · فئة [LTD]']),
    dict(type='flare', t0=DROP + 0.05, t1=DROP + 1.4, y=820, x0=-300, x1=1380),
    dict(type='engines', t0=ENG, t1=END, dim=0.62, kicker='HIGHLANDER 2026', title='اختر <acc>فئتك</acc>',
         rows=[['LE · هايبرد دفع أمامي', '[240] حصان'], ['GLE · GLE Plus · هايبرد [4×4]', '[240] حصان'], ['LTD · هايبرد [4×4] · جنوط [20]', '[240] حصان']],
         note='المواصفات والتجهيزات تختلف حسب الفئة'),
    dict(type='end', t0=END, t1=DUR, dim=0.72, wa=False, name='تويوتا <acc>هايلاندر</acc> [2026]', cta='اطلبها الآن من ماكس موتورز'),
]
HL = 'font:400 98px/1 Michroma;letter-spacing:10px;direction:ltr;color:#F3EFE8;text-shadow:0 10px 60px rgba(0,0,0,.7)'
texts = [
    dict(t0=0.6, t1=4.9, y=1420, cls='t2', html='كل رحلة… <acc>تبدأ بالعائلة</acc>'),
    dict(t0=5.5, t1=9.8, y=1420, cls='t2', html='ولكل من تحب… <acc>مكان</acc>'),
    dict(t0=R + 0.1, t1=14.8, y=300, cls='k', html='TOYOTA', anim='track', ls=22),
    dict(t0=R + 0.25, t1=14.8, y=360, cls='t1', html='HIGHLANDER', anim='scale', style=HL),
    dict(t0=R + 0.6, t1=14.8, y=520, cls='t3', html='[2026] · مساحة <acc>لكل من تحب</acc>'),
    dict(t0=18.45, t1=20.35, y=1420, cls='t2', html='من الرياض… <acc>إلى العُلا</acc>'),
    dict(t0=44.75, t1=48.9, y=1420, cls='t2', html='أجمل الطرق… <acc>مع من تحب</acc>'),
    dict(t0=49.6, t1=51.9, y=1545, cls='k', html='HIGHLANDER 2026', anim='track', ls=16),
    dict(t0=49.9, t1=51.9, y=1590, cls='t2', html='رحلتكم… <acc>تستحق الأفضل</acc>'),
]
C = dict(_src='Toyota Highlander 2026 KSA (XU70 2.5 HEV 240 hp): Higgsfield-generated Saudi scenes (6 clips, from the official toyota.com.sa images), official Toyota Europe newsroom clips + Toyota Australia Pressroom Kluger B-roll (editorial licence, ALJ/Toyota written consent needed for paid ads), Pexels/Mixkit stock (mx1618, px13378577, px6300822, px8865211, px18819906, px4361617, px19745264, px16905150, px17629657), music Mixkit 587.',
         dur=DUR, acc='#D4AF6A', bars=0, wm=0.42, wmOff=END, fadeIn=0.6, shots=shots, mg=mg, texts=texts, captions=[], ovl=[])
os.makedirs(f'{D}/reg/web/cars/highlander26', exist_ok=True)
out = f'{D}/reg/web/cars/highlander26/film.json'
json.dump(C, open(out, 'w'), ensure_ascii=False, indent=1)
for a, b in zip(shots, shots[1:]): assert abs(a['t1'] - b['t0']) < 1e-9, (a, b)
print('ok', out, len(shots), 'shots', DUR, 's')
