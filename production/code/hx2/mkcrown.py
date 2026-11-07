# Toyota Crown 2026 (KSA) cinematic film, all real footage, client's ElevenLabs MSA VO (v1..v9): writes reg/web/cars/crown26/film.json
# Music (client pick #2): Mixkit 846 "I Won't Surrender" (Mixkit free licence), 108 BPM, cut on downbeats:
#   A track 21.04 -> ad 0 (silence 30.0 = ad 8.96 lights-on, big hit 33.866 = ad 12.83 reveal) .. 49.70 -> ad 28.66
#   B track 63.16 -> ad 28.66 (drop 67.76 = ad 33.26: 344 hp) .. 85.23 -> ad 50.73
#   C track 107.29 -> ad 50.73 (final hit 111.70 = ad 55.14: logo lands, rings out)
import json, os
D = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
X = 'dl/crx/{}.mp4'; U = 'lib/stock/src/s_user/'; S = 'lib/stock/src/'
R, DROP, ENG, END, DUR = 12.83, 33.26, 50.73, 54.14, 58.6

def v(t0, t1, src, ss, **k):
    return dict(kind='vid', src=src, ss=ss, t0=t0, t1=t1, **k)

shots = [
    # Riyadh, dusk to night
    v(0.00, 3.80, U + 'px12709488_1080x1920.mp4', 2.0, cx0=0.5, z0=1.0, z1=1.06, lut='cine'),
    v(3.80, 7.18, U + 'px14619960_2160x3840.mp4', 1.0, cx0=0.5, z0=1.08, z1=1.0, lut='cine'),
    v(7.18, 8.96, U + 'px17031007_1080x1920.mp4', 15.0, cx0=0.5, z0=1.12, z1=1.2, lut='cine_night'),
    # darkness, then the Crown's light bar wakes up
    v(8.96, 10.00, X.format('ltd_light'), 4.0, cx0=0.55, cy=0.3, z0=1.15, z1=1.15, lut='cine_night', tin='dip'),
    v(10.00, R, X.format('st_light'), 6.0, cx0=0.55, cy=0.2, z0=1.15, z1=1.22, lut='cine_night'),
    # reveal on the big hit
    v(R, 15.12, X.format('bz_a'), 36.0, cx0=0.40, cx1=0.44, z0=1.0, z1=1.06, lut='cine', tin='flash'),
    v(15.12, 17.41, X.format('gy_b'), 2.0, cx0=0.5, lut='cine'),
    v(17.41, 18.55, X.format('bz_b'), 53.0, cx0=0.45, lut='cine'),
    v(18.55, 19.54, X.format('st_grille'), 3.0, cx0=0.5, cy=0.2, z0=1.15, z1=1.22, lut='cine_night'),
    v(19.54, 21.84, X.format('wp_a'), 14.0, cx0=0.5, lut='cine'),
    v(21.84, 24.12, X.format('gy_a'), 2.0, cx0=0.5, lut='cine'),
    v(24.12, 26.42, X.format('wp_b'), 2.0, cx0=0.5, lut='cine'),
    v(26.42, 28.66, X.format('bz_b'), 30.0, cx0=0.5, lut='cine'),
    v(28.66, 30.96, X.format('gy_c'), 4.0, cx0=0.5, lut='cine'),
    v(30.96, DROP, X.format('st_rear'), 2.0, cx0=0.5, cy=0.25, z0=1.15, z1=1.22, lut='cine_night'),
    # the drop: Majesta power, then golden-hour roads
    v(DROP, 35.54, X.format('xe_gold'), 29.0, cx0=0.5, lut='cine', tin='flash'),
    v(35.54, 37.78, X.format('xe_gold'), 9.0, cx0=0.5, lut='cine'),
    v(37.78, 39.95, X.format('ltd_gold'), 39.5, cx0=0.5, lut='cine'),
    v(39.95, 42.25, X.format('xe_gold'), 39.2, cx0=0.5, lut='cine'),
    v(42.25, 44.38, X.format('ltd_gold'), 50.0, cx0=0.5, lut='cine'),
    # Riyadh again, the scent of bukhoor, the last pass into the sunset
    v(44.38, 46.40, U + 'px14619960_2160x3840.mp4', 8.0, cx0=0.5, z0=1.0, z1=1.06, lut='cine'),
    v(46.40, 48.43, S + 's_arabic_detail/px8319108_1080.mp4', 0.3, cx0=0.84, z0=1.0, z1=1.05, lut='cine_night'),
    v(48.43, ENG, X.format('gy_c'), 29.0, cx0=0.5, lut='cine'),
    v(ENG, END, X.format('xe_gold'), 46.0, cx0=0.5, z0=1.0, z1=1.04, lut='cine'),
    v(END, DUR, U + 'px12709488_1080x1920.mp4', 14.0, cx0=0.5, z0=1.04, z1=1.0, lut='cine_night'),
]
mg = [
    dict(type='chips', t0=19.64, t1=24.0, y=1330, s0=0.1, st=0.25, items=['هايبرد [2.5] لتر', '[218] حصان', 'دفع كلي [AWD]']),
    dict(type='chips', t0=24.22, t1=28.5, y=1330, s0=0.1, st=0.3, items=['إضاءة [LED] كاملة', 'فتحة سقف بانورامية']),
    dict(type='counter', t0=DROP, t1=37.6, y=640, num=344, unit='حصان', sub='تيربو هايبرد [2.4] · عزم [550] نيوتن متر · فئة [Majesta]', c0=0.25, cnt=1.9),
    dict(type='chips', t0=37.88, t1=42.1, y=1330, s0=0.1, st=0.3, items=['جنوط [21] إنش · فئة [Majesta]', 'شاشة عرض أمامية [HUD]']),
    dict(type='flare', t0=DROP + 0.05, t1=DROP + 1.4, y=820, x0=-300, x1=1380),
    dict(type='engines', t0=ENG, t1=END, dim=0.62, kicker='CROWN 2026', title='اختر <acc>فئتك</acc>',
         rows=[['Majesta · تيربو هايبرد [2.4]', '[344] حصان'], ['Premium · هايبرد [2.5]', '[218] حصان'], ['Prestige · هايبرد [2.5]', '[218] حصان']],
         note='المواصفات والتجهيزات تختلف حسب الفئة'),
    dict(type='end', t0=END, t1=DUR, dim=0.72, wa=False, name='تويوتا <acc>كراون</acc> [2026]', cta='اطلبها الآن من ماكس موتورز'),
]
CR = 'font:400 168px/1 Michroma;letter-spacing:18px;direction:ltr;color:#F3EFE8;text-shadow:0 10px 60px rgba(0,0,0,.7)'
texts = [
    dict(t0=0.6, t1=3.6, y=1420, cls='t2', html='الرياض… <acc>لا تهدأ</acc>'),
    dict(t0=4.1, t1=7.0, y=1420, cls='t2', html='وفيها… <acc>من يصنع الفرق</acc>'),
    dict(t0=R + 0.1, t1=15.0, y=300, cls='k', html='TOYOTA', anim='track', ls=22),
    dict(t0=R + 0.25, t1=15.0, y=345, cls='t1', html='CROWN', anim='scale', style=CR),
    dict(t0=R + 0.6, t1=15.0, y=540, cls='t3', html='[2026] · الفخامة <acc>بمعنى جديد</acc>'),
    dict(t0=44.48, t1=48.3, y=1420, cls='t2', html='حضورك… <acc>يسبقك</acc>'),
]
C = dict(_src='Toyota Crown 2026 KSA: official Toyota Canada media B-roll (2023 Crown shoot; editorial licence, ALJ/Toyota written consent needed for paid ads), Riyadh clips supplied by the client from Pexels (14619960, 12709488, 17031007), Pexels 8319108 bukhoor, music Mixkit 846.',
         dur=DUR, acc='#D4AF6A', bars=0, wm=0.42, wmOff=END, fadeIn=0.6, shots=shots, mg=mg, texts=texts, captions=[], ovl=[])
os.makedirs(f'{D}/reg/web/cars/crown26', exist_ok=True)
out = f'{D}/reg/web/cars/crown26/film.json'
json.dump(C, open(out, 'w'), ensure_ascii=False, indent=1)
for a, b in zip(shots, shots[1:]): assert abs(a['t1'] - b['t0']) < 1e-9, (a, b)
print('ok', out, len(shots), 'shots', DUR, 's')
