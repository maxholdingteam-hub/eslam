# Toyota Raize 2026 (KSA: XLE 1.2 87 hp / Limited 1.0 turbo 97 hp, CVT, FWD) cinematic film, music only (v2):
# writes reg/web/cars/raize26/film.json
# Story: Taif: hands picking roses at dawn, the Al Hada hairpins, the Raize on the mountain road and in the rose farm, sunset on the ridges (no faces)
# Footage: Higgsfield (GPT Image 2.5 keyframes -> Veo 3.1), natural documentary look; every moving-car shot shows its driver
# Music: OpenTracks ot_13971 "Burning Sands" (bright Arabian orchestral, 151 BPM), cut on downbeats:
#   A track 100.83 -> ad 0 (hit 109.227 = ad 8.40: reveal on "Toyota Raize") .. 116.62 -> ad 15.79
#   B track 113.42 -> ad 15.79 (drop 124.62 = ad 26.99: 97 hp) .. 142.26 -> ad 44.63
#   C track 160.82 -> ad 44.63 (final hit 163.631 = ad 47.44: logo lands, rings out)
import json, os
D = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
Z = 'dl/hfrz/rz{}.mp4'
R, DROP, ENG, END, DUR = 8.40, 23.79, 38.21, 43.24, 47.6
NAT = 'eq=saturation=0.92:contrast=1.02,noise=alls=5:allf=t'

def v(t0, t1, n, ss, **k):
    return dict(kind='vid', src=Z.format(n), ss=ss, t0=t0, t1=t1, cx0=0.5, eq=NAT, **k)

# v2 (music only): no faces. Dropped rz1 (farmer) and rz7 (friends): faces looked AI; rz2 (petals floating up) and
# rz8 (empty car lights up, door opens, glitch). New no-face Higgsfield clips in dl/hfrz2: n1 hands picking roses,
# n2 following the car (driver seen from behind), n3 car parked in the rose farm, n5 front close-up on a tripod
# (replaces rz5, where the parked car slid sideways). Each clip used at most twice.
N2 = 'dl/hfrz2/n{}.mp4'
def n(t0, t1, k, ss, **kw):
    return dict(kind='vid', src=N2.format(k), ss=ss, t0=t0, t1=t1, cx0=0.5, eq=NAT, **kw)

shots = [
    n(0.00, 4.10, 1, 0.3, z0=1.0, z1=1.06),
    v(4.10, R, 3, 0.3, z0=1.0, z1=1.08, fx=['whipin', 'whipout']),
    v(R, 12.00, 4, 0.3, z0=1.0, z1=1.06, fx=['punch'], tin='flash'),
    n(12.00, 14.40, 3, 0.4, z0=1.0, z1=1.04),
    v(14.40, 16.80, 6, 0.4, z0=1.0, z1=1.04),
    n(16.80, 19.40, 2, 0.4, z0=1.0, z1=1.04, fx=['whipin']),
    n(19.40, 21.60, 5, 0.6, z0=1.0, z1=1.04),
    v(21.60, DROP, 4, 3.8, z0=1.0, z1=1.06, fx=['whipout']),
    n(DROP, 26.60, 5, 3.1, z0=1.0, z1=1.05, fx=['punch'], tin='flash'),
    v(26.60, 29.40, 6, 3.0, z0=1.08, z1=1.12),
    n(29.40, 32.20, 2, 3.1, z0=1.1, z1=1.14),
    v(32.20, 34.80, 3, 3.3, z0=1.12, z1=1.18, fx=['whipin']),
    n(34.80, ENG, 3, 2.5, z0=1.08, z1=1.14),
    v(ENG, END, 9, 0.3, z0=1.0, z1=1.04, tin='dip'),
    v(END, DUR, 9, 1.6, z0=1.03, z1=1.0),
]
mg = [
    dict(type='chips', t0=21.75, t1=23.65, y=1330, s0=0.1, st=0.25, items=['محرك تيربو [1.0] لتر', 'ناقل [CVT]', 'دفع أمامي']),
    dict(type='counter', t0=DROP, t1=26.5, y=330, num=97, unit='حصان', sub='تيربو [1.0] لتر · عزم [140] نيوتن متر · فئة [Limited]', c0=0.2, cnt=1.3),
    dict(type='flare', t0=DROP + 0.05, t1=DROP + 1.4, y=510, x0=-300, x1=1380),
    dict(type='chips', t0=26.75, t1=29.3, y=1330, s0=0.1, st=0.3, items=['مصابيح [LED] · فئة [Limited]', 'جنوط [17] إنش · فئة [Limited]']),
    dict(type='engines', t0=ENG, t1=END, dim=0.62, kicker='RAIZE 2026', title='اختر <acc>فئتك</acc>',
         rows=[['XLE · بنزين [1.2] لتر · جنوط [16]', '[87] حصان'], ['Limited · تيربو [1.0] لتر · جنوط [17]', '[97] حصان']],
         note='الفئتين ناقل [CVT] · المواصفات تختلف حسب الفئة'),
    dict(type='end', t0=END, t1=DUR, dim=0.72, wa=False, name='تويوتا <acc>رايز</acc> [2026]', cta='اطلبها الآن من ماكس موتورز'),
]
RS = 'font:400 150px/1 Michroma;letter-spacing:22px;direction:ltr;color:#F3EFE8;text-shadow:0 10px 60px rgba(0,0,0,.7)'
texts = [
    dict(t0=0.5, t1=3.9, y=1420, cls='t2', html='الطائف… <acc>مدينة الورد</acc>'),
    dict(t0=R + 0.1, t1=11.8, y=300, cls='k', html='TOYOTA', anim='track', ls=22),
    dict(t0=R + 0.25, t1=11.8, y=355, cls='t1', html='RAIZE', anim='scale', style=RS),
    dict(t0=R + 0.6, t1=11.8, y=540, cls='t3', html='[2026] · صغيرة في حجمها… <acc>كبيرة في حضورها</acc>'),
    dict(t0=16.95, t1=19.25, y=1420, cls='t2', html='من طريق الهدا… <acc>إلى القمم</acc>'),
    dict(t0=35.0, t1=38.0, y=1420, cls='t2', html='لكل مشوار… <acc>بداية جميلة</acc>'),
]
C = dict(_src='Toyota Raize 2026 KSA (XLE 1.2L 87 hp 113 Nm; Limited 1.0L turbo 97 hp 140 Nm; CVT, FWD): all footage generated on Higgsfield (GPT Image 2.5 + Veo 3.1) from the official toyota.com.sa images; music OpenTracks ot_13971 (commercial/ads OK, no credit); music only (v2, no VO).',
         dur=DUR, acc='#D4AF6A', bars=0, wm=0.42, wmOff=END, fadeIn=0.5, shots=shots, mg=mg, texts=texts, captions=[], ovl=[])
os.makedirs(f'{D}/reg/web/cars/raize26', exist_ok=True)
out = f'{D}/reg/web/cars/raize26/film.json'
json.dump(C, open(out, 'w'), ensure_ascii=False, indent=1)
for a, b in zip(shots, shots[1:]): assert abs(a['t1'] - b['t0']) < 1e-9, (a, b)
for i, s in enumerate(shots): assert s['ss'] + (s['t1'] - s['t0']) / s.get('speed', 1) <= 6.0, ('source overrun', i, s)
print('ok', out, len(shots), 'shots', DUR, 's')
