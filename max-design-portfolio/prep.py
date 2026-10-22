import sys,os
from PIL import Image, ImageOps, ImageChops
S=sys.argv[1]; P=S+'/pdfimg/'; A=S+'/deck/a/'
def jpg(src,dst,maxw=1920,crop=None):
    im=Image.open(P+src).convert('RGB')
    if crop: im=im.crop(crop)
    im.thumbnail((maxw,maxw)); im.save(A+dst,quality=86)
# photos
for f in os.listdir(P):
    if f.endswith('.jpg') and os.path.getsize(P+f)>5000:
        jpg(f,f[3:10]+'.jpg')
# hero crop of cover (remove baked-in text)
im=Image.open(P+'im-001-000.jpg'); w,h=im.size; im.crop((int(w*0.48),int(h*0.06),w,int(h*0.885))).save(A+'hero.jpg',quality=90)
# line drawings from soft masks: dark lines on transparent, contrast boosted
def lines(src,dst,color=(30,30,30),gain=3.0,trim=True):
    m=Image.open(P+src).convert('L')  # soft mask: lines are already bright
    m=m.point(lambda v:min(255,int(v*gain)))
    if trim:
        bb=m.point(lambda v:255 if v>40 else 0).getbbox()
        if bb: m=m.crop((max(0,bb[0]-10),max(0,bb[1]-10),min(m.width,bb[2]+10),min(m.height,bb[3]+10)))
    out=Image.new('RGBA',m.size,color+(0,)); out.putalpha(m); out.save(A+dst)
for f,g in [('005-006',2),('005-008',2),('005-010',2),('006-014',4),('006-016',3),('007-018',4),('007-020',4),
            ('009-026',2.5),('009-030',2.5),('010-032',2.5),('010-034',2.5),('010-036',2.5),('011-042',2.5),('011-044',2.5),
            ('014-051',4),('014-053',4),('014-055',4),('015-057',5),('015-059',5),('015-061',5),('015-063',5),('020-086',2)]:
    lines(f'im-{f}.png',f'd{f}.png',gain=g)
# gold sketch
lines('im-002-002.png','sketch-gold.png',color=(201,162,90),gain=1.6)
# scanned grayscale drawings -> lines
for f in ['026-109','026-110','028-112','028-113','027-111']:
    m=ImageOps.invert(Image.open(P+f'im-{f}.jpg').convert('L')).point(lambda v:0 if v<40 else min(255,int(v*1.4)))
    bb=m.getbbox(); m=m.crop(bb)
    out=Image.new('RGBA',m.size,(30,30,30,0)); out.putalpha(m); out.save(A+f'd{f}.png')
# logo
lg=Image.open(S+'/site/img0.jpg').convert('RGBA'); lg=lg.crop(lg.getbbox()); lg.save(A+'logo.png'); print(lg.size)
