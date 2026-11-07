# Toyota Yaris 2026 (KSA sedan, 1.3 petrol 97 hp, CVT, 22.1 km/L) cinematic film, text only: writes reg/web/cars/yaris26/film.json
# Story: "أول خطوة": the falconer at dawn, the falcon, Saudi coffee, a young man's first car, desert roads, the camp, a night under the stars
# Footage: Saudi scenes generated on Higgsfield from the official toyota.com.sa images in a natural documentary look
#   (GPT Image 2.5 keyframes -> Veo 3.1 clips), then muted with extra grain here so nothing reads as AI
# Music (client pick #3): FreePD "Desert Conflict" (public domain), 120 BPM, hijaz colour, cut on downbeats:
#   A track 0.662 -> ad 0 (intro build, drop 16.672 = ad 16.01 reveal) .. 26.68 -> ad 26.02
#   B track 84.672 -> ad 26.02 (calm, biggest hit 90.686 = ad 32.034: 22.1 km/L) .. 100.682 -> ad 42.03
#   C track 146.692 -> ad 42.03 (final hit 154.68 = ad 50.02: logo lands, rings to 52.8)
import json, os
D = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
Y = 'dl/hfyr/yr{}.mp4'
R, HIT, ENG, END, DUR = 16.01, 32.034, 44.015, 49.02, 52.8
NAT = 'eq=saturation=0.9:contrast=1.02,noise=alls=5:allf=t'   # natural film look: a touch less colour, real grain

def v(t0, t1, n, ss, **k):
    return dict(kind='vid', src=Y.format(n), ss=ss, t0=t0, t1=t1, cx0=0.5, eq=NAT, **k)

shots = [
    # dawn: the falconer, his falcon, the coffee, the car, the first key
    v(0.000, 4.017, 1, 0.3, z0=1.0, z1=1.05),
    v(4.017, 6.002, 2, 0.5, z0=1.0, z1=1.04, fx=['whipin']),
    v(6.002, 8.022, 6, 0.5, z0=1.0, z1=1.05),
    v(8.022, 10.019, 8, 0.8, z0=1.0, z1=1.04, fx=['punch']),
    v(10.019, 12.028, 7, 0.5, z0=1.0, z1=1.04),
    v(12.028, 14.036, 4, 0.5, z0=1.0, z1=1.04, fx=['whipin']),
    v(14.036, R, 2, 3.0, z0=1.0, z1=1.08, fx=['whipout']),
    # the drop: the Yaris on the desert highway
    v(R, 20.015, 3, 0.3, z0=1.0, z1=1.06, fx=['punch'], tin='flash'),
    v(20.015, 22.012, 8, 3.0, z0=1.0, z1=1.04, fx=['whipin']),
    v(22.012, 24.021, 4, 2.6, z0=1.0, z1=1.04),
    v(24.021, 26.020, 7, 3.2, z0=1.0, z1=1.04),
    # dusk at the camp, then the big hit
    v(26.020, 27.947, 5, 0.3, z0=1.0, z1=1.04, tin='dip'),
    v(27.947, 30.025, 6, 3.0, z0=1.0, z1=1.05),
    v(30.025, HIT, 5, 3.0, z0=1.0, z1=1.1, fx=['whipout']),
    v(HIT, 34.030, 3, 3.8, z0=1.0, z1=1.05, fx=['punch'], tin='flash'),
    v(34.030, 36.039, 4, 3.5, z0=1.0, z1=1.04),
    v(36.039, 38.024, 1, 3.0, z0=1.0, z1=1.04, fx=['whipin']),
    v(38.024, 40.033, 8, 1.5, z0=1.0, z1=1.04),
    v(40.033, 42.030, 7, 1.0, z0=1.0, z1=1.04, fx=['whipout']),
    # night under the stars, the grades, the end card
    v(42.030, ENG, 9, 0.5, z0=1.0, z1=1.04, tin='dip'),
    v(ENG, END, 4, 0.5, z0=1.0, z1=1.03),
    v(END, DUR, 9, 2.2, z0=1.03, z1=1.0),
]
mg = [
    dict(type='chips', t0=20.15, t1=21.95, y=1330, s0=0.1, st=0.25, items=['بنزين [1.3] لتر', '[97] حصان', 'ناقل [CVT]']),
    dict(type='counter', t0=HIT, t1=35.95, y=640, num=22.1, dec=1, unit='كم / لتر', sub='بنزين [1.3] لتر · عزم [122] نيوتن متر · ناقل [CVT]', c0=0.25, cnt=1.6),
    dict(type='flare', t0=HIT + 0.05, t1=HIT + 1.4, y=820, x0=-300, x1=1380),
    dict(type='chips', t0=38.15, t1=39.95, y=1330, s0=0.1, st=0.3, items=['مصابيح أمامية [LED]', 'إضاءة خلفية [LED] · فئة [YX]']),
    dict(type='engines', t0=ENG, t1=END, dim=0.62, kicker='YARIS 2026', title='اختر <acc>فئتك</acc>',
         rows=[['Y · جنوط [15] إنش', '[97] حصان'], ['Y Plus · جنوط [16] إنش', '[97] حصان'], ['YX · إضاءة خلفية [LED]', '[97] حصان']],
         note='كل الفئات بنزين [1.3] لتر · المواصفات تختلف حسب الفئة'),
    dict(type='end', t0=END, t1=DUR, dim=0.72, wa=False, name='تويوتا <acc>يارس</acc> [2026]', cta='اطلبها الآن من ماكس موتورز'),
]
YS = 'font:400 150px/1 Michroma;letter-spacing:22px;direction:ltr;color:#F3EFE8;text-shadow:0 10px 60px rgba(0,0,0,.7)'
texts = [
    dict(t0=0.6, t1=3.9, y=1420, cls='t2', html='كل حكاية… <acc>لها بداية</acc>'),
    dict(t0=6.2, t1=9.8, y=1420, cls='t2', html='وكل بداية… <acc>تستاهل الأفضل</acc>'),
    dict(t0=R + 0.1, t1=19.8, y=300, cls='k', html='TOYOTA', anim='track', ls=22),
    dict(t0=R + 0.25, t1=19.8, y=355, cls='t1', html='YARIS', anim='scale', style=YS),
    dict(t0=R + 0.6, t1=19.8, y=540, cls='t3', html='[2026] · أول <acc>خطوة</acc>'),
    dict(t0=26.2, t1=29.8, y=1420, cls='t2', html='بين الأصالة… <acc>والطريق</acc>'),
    dict(t0=42.3, t1=43.9, y=430, cls='k', html='YARIS 2026', anim='track', ls=16),
    dict(t0=42.5, t1=43.9, y=480, cls='t2', html='أول خطوة… <acc>تبدأ من هنا</acc>'),
]
C = dict(_src='Toyota Yaris 2026 KSA (sedan, 1.3L petrol 97 hp, 122 Nm, CVT, 22.1 km/L; grades Y / Y Plus / YX): all footage generated on Higgsfield (GPT Image 2.5 + Veo 3.1) from the official toyota.com.sa images, natural documentary look; music FreePD "Desert Conflict" (public domain).',
         dur=DUR, acc='#D4AF6A', bars=0, wm=0.42, wmOff=END, fadeIn=0.5, shots=shots, mg=mg, texts=texts, captions=[], ovl=[])
os.makedirs(f'{D}/reg/web/cars/yaris26', exist_ok=True)
out = f'{D}/reg/web/cars/yaris26/film.json'
json.dump(C, open(out, 'w'), ensure_ascii=False, indent=1)
for a, b in zip(shots, shots[1:]): assert abs(a['t1'] - b['t0']) < 1e-9, (a, b)
for i, s in enumerate(shots): assert s['ss'] + (s['t1'] - s['t0']) / s.get('speed', 1) <= 6.0, ('source overrun', i, s)
print('ok', out, len(shots), 'shots', DUR, 's')
