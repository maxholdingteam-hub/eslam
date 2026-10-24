# Toyota Corolla Cross (KSA, 1.8 hybrid 121 hp, 25.8 km/L) cinematic film, text only: writes reg/web/cars/ccross26/film.json
# Story: "جدة غير": Jeddah (Al-Balad, the Corniche, the waterfront at night) and the Asir mountains, Red Mica with black roof
# v2: moving-car shots regenerated with a visible driver (cc2, cc4, cc6), repeats replaced by cc10 (drone Corniche) and cc11 (seaside cafe)
# Footage: Saudi scenes generated on Higgsfield from the official toyota.com.sa images (GPT Image 2.5 keyframes -> Veo 3.1 clips)
# Music (client pick #3): OpenTracks ot_9389 "Wings of the Roc" (corico), 113 BPM, cut on downbeats:
#   A track 44.547 -> ad 0 (quiet mid, re-entry hit 58.027 = ad 13.48 reveal) .. 74.257 -> ad 29.71
#   B track 78.495 -> ad 29.71 (drop 80.62 = ad 31.835: 25.8 km/L) .. 91.22 -> ad 42.435
#   C track 99.718 -> ad 42.435 (final hit 106.881 = ad 49.60: logo lands, rings to 52.5)
import json, os
D = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
H = 'dl/hfcc/cc{}.mp4'
R, HI, DROP, ENG, END, DUR = 13.48, 19.064, 31.835, 44.56, 48.6, 52.6

def v(t0, t1, n, ss, **k):
    return dict(kind='vid', src=H.format(n), ss=ss, t0=t0, t1=t1, cx0=0.5, **k)

shots = [
    # Jeddah wakes up: Al-Balad, the cabin, the details, the driver
    v(0.000, 4.238, 1, 0.3, z0=1.0, z1=1.06),
    v(4.238, 6.398, 7, 1.0, z0=1.0, z1=1.04),
    v(6.398, 8.453, 5, 0.5, z0=1.0, z1=1.05),
    v(8.453, 10.519, 8, 0.5, z0=1.0, z1=1.04),
    v(10.519, 12.690, 6, 0.3, z0=1.0, z1=1.05),
    v(12.690, R, 7, 4.2, z0=1.05, z1=1.12),
    # the re-entry hit: the Corniche and the fountain
    v(R, 16.939, 2, 0.3, z0=1.0, z1=1.06, tin='flash'),
    v(16.939, HI, 10, 0.5, z0=1.0, z1=1.04),
    v(HI, 21.189, 8, 3.0, z0=1.0, z1=1.04),
    v(21.189, 23.313, 6, 3.0, z0=1.0, z1=1.04),
    v(23.313, 25.426, 2, 3.6, z0=1.0, z1=1.04),
    v(25.426, 27.551, 7, 3.6, z0=1.0, z1=1.04),
    v(27.551, 29.710, 11, 0.5, z0=1.0, z1=1.04),
    # up to Abha, then the drop at night
    v(29.710, DROP, 3, 0.0, z0=1.0, z1=1.04),
    v(DROP, 33.948, 4, 0.4, z0=1.0, z1=1.06, tin='flash'),
    v(33.948, 36.072, 3, 2.4, z0=1.0, z1=1.04),
    v(36.072, 38.197, 4, 3.0, z0=1.0, z1=1.04),
    v(38.197, 40.310, 10, 3.5, z0=1.0, z1=1.04),
    # hero on the pier
    v(40.310, ENG, 9, 0.5, z0=1.0, z1=1.06),
    v(ENG, END, 2, 1.5, z0=1.0, z1=1.03),
    v(END, DUR, 9, 1.8, z0=1.03, z1=1.0),
]
mg = [
    dict(type='chips', t0=HI + 0.15, t1=21.1, y=1330, s0=0.1, st=0.25, items=['هايبرد [1.8] لتر', 'ناقل [CVT]', 'وضع [EV] كهربائي']),
    dict(type='chips', t0=25.55, t1=27.45, y=1330, s0=0.1, st=0.3, items=['شاشة [10] إنش · فئة [Limited]', 'عدادات رقمية [12.3] إنش']),
    dict(type='counter', t0=DROP, t1=36.0, y=640, num=25.8, dec=1, unit='كم / لتر', sub='هايبرد [1.8] لتر · [121] حصان · ناقل [CVT]', c0=0.25, cnt=1.6),
    dict(type='flare', t0=DROP + 0.05, t1=DROP + 1.4, y=820, x0=-300, x1=1380),
    dict(type='chips', t0=36.2, t1=38.1, y=1330, s0=0.1, st=0.3, items=['إضاءة [LED] · حسب الفئة', 'فتحة سقف · حسب الفئة']),
    dict(type='engines', t0=ENG, t1=END, dim=0.62, kicker='COROLLA CROSS', title='اختر <acc>فئتك</acc>',
         rows=[['LE · XLE', '[121] حصان'], ['Limited', '[121] حصان'], ['Limited Plus', '[121] حصان']],
         note='كل الفئات هايبرد [1.8] لتر · المواصفات تختلف حسب الفئة'),
    dict(type='end', t0=END, t1=DUR, dim=0.72, wa=False, name='تويوتا <acc>كورولا كروس</acc> هايبرد', cta='اطلبها الآن من ماكس موتورز'),
]
CC = 'font:400 70px/1 Michroma;letter-spacing:4px;direction:ltr;color:#F3EFE8;text-shadow:0 10px 60px rgba(0,0,0,.7)'
texts = [
    dict(t0=0.6, t1=4.0, y=1420, cls='t2', html='جدة… <acc>غير</acc>'),
    dict(t0=4.5, t1=8.3, y=1420, cls='t2', html='وأنت كمان… <acc>غير</acc>'),
    dict(t0=R + 0.1, t1=16.8, y=300, cls='k', html='TOYOTA', anim='track', ls=22),
    dict(t0=R + 0.25, t1=16.8, y=360, cls='t1', html='COROLLA CROSS', anim='scale', style=CC),
    dict(t0=R + 0.6, t1=16.8, y=500, cls='t3', html='هايبرد · <acc>عش تطلعاتك</acc>'),
    dict(t0=29.85, t1=31.7, y=1420, cls='t2', html='من البحر… <acc>للسحاب</acc>'),
    dict(t0=40.6, t1=44.4, y=430, cls='k', html='COROLLA CROSS HYBRID', anim='track', ls=14),
    dict(t0=40.9, t1=44.4, y=480, cls='t2', html='عش <acc>تطلعاتك</acc>'),
]
C = dict(_src='Toyota Corolla Cross KSA (1.8 HEV, 121 hp, 25.8 km/L, CVT, FWD; grades LE/XLE/Limited/Limited Plus): all footage generated on Higgsfield (GPT Image 2.5 + Veo 3.1) from the official toyota.com.sa images; music OpenTracks ot_9389 (commercial/ads OK, no credit).',
         dur=DUR, acc='#D4AF6A', bars=0, wm=0.42, wmOff=END, fadeIn=0.5, shots=shots, mg=mg, texts=texts, captions=[], ovl=[])
os.makedirs(f'{D}/reg/web/cars/ccross26', exist_ok=True)
out = f'{D}/reg/web/cars/ccross26/film.json'
json.dump(C, open(out, 'w'), ensure_ascii=False, indent=1)
for a, b in zip(shots, shots[1:]): assert abs(a['t1'] - b['t0']) < 1e-9, (a, b)
print('ok', out, len(shots), 'shots', DUR, 's')
