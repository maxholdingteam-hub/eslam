# Builds app/data/cars.json and app/img/<id>/{n}.webp + thumb.webp from MaxMotors_Site_Listings
import os, re, json, glob, hashlib
from PIL import Image
ROOT=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC=os.path.join(ROOT,'MaxMotors_Site_Listings'); APP=os.path.join(ROOT,'app')
SKIP_KEYS={'السعر (ريال سعودي)'}  # no prices in the app (client rule)
def parse(txt):
    d={};desc=[];ind=False
    for line in open(txt,encoding='utf-8').read().splitlines():
        if ind: desc.append(line); continue
        if line.startswith('الوصف'): ind=True; continue
        if ':' in line:
            k,v=line.split(':',1); d[k.strip()]=v.strip()
    d['الوصف']='\n'.join(desc).strip(); return d
def split_name(s):
    m=re.match(r'(.*?)\s*\((.*?)\)\s*$',s or '')
    return (m.group(1).strip(),m.group(2).strip()) if m else (s or '',s or '')
cars=[]
for brand_dir in sorted(glob.glob(os.path.join(SRC,'*/'))):
    for d in sorted(glob.glob(os.path.join(brand_dir,'*/'))):
        if 'مضغوط' in d: continue
        txt=os.path.join(d,'بيانات_السيارة.txt'); jp=sorted(glob.glob(os.path.join(d,'*.jpg')))
        if not os.path.exists(txt) or len(jp)<2: continue
        info=parse(txt); cid=os.path.basename(d.rstrip('/'))
        for k in SKIP_KEYS: info.pop(k,None)
        ba,be=split_name(info.get('الشركة المصنعة',''));ba={'ام جي':'إم جي'}.get(ba,ba); ma,me=split_name(info.get('الموديل',''))
        out=os.path.join(APP,'img',cid); os.makedirs(out,exist_ok=True); imgs=[]
        for i,f in enumerate(jp):
            p=os.path.join(out,f'{i+1}.webp')
            if not os.path.exists(p):
                im=Image.open(f).convert('RGB'); im.thumbnail((1100,1100)); im.save(p,'WEBP',quality=78)
            imgs.append(f'img/{cid}/{i+1}.webp')
        th=os.path.join(out,'thumb.webp')
        if not os.path.exists(th):
            im=Image.open(jp[0]).convert('RGB'); im.thumbnail((560,560)); im.save(th,'WEBP',quality=74)
        body=(info.get('نوع الهيكل','') or '').strip()
        cars.append({'id':cid,'brand':ba,'brandEn':be.upper(),'model':ma,'modelEn':me,'year':info.get('السنة',''),
          'color':info.get('اللون',''),'trim':info.get('الفئة',''),'body':body,'gear':info.get('ناقل الحركة',''),
          'fuel':info.get('نوع الوقود',''),'seats':info.get('عدد المقاعد',''),'drive':info.get('نوع الدفع',''),
          'status':info.get('الحالة',''),'desc':re.sub(r'\s*بسعر (منافس|مناسب)','',info['الوصف'].replace(' (السعر عندكم)','')),
          'thumb':f'img/{cid}/thumb.webp','images':imgs})
os.makedirs(os.path.join(APP,'data'),exist_ok=True)
json.dump(cars,open(os.path.join(APP,'data','cars.json'),'w',encoding='utf-8'),ensure_ascii=False)
print(len(cars),'cars')
