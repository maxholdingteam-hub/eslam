# mirror_fix.py IN OUT "x0,y0,x1,y1;..."  boxes (fractions, ORIGINAL frame) of text/logos/plates to un-mirror
import sys,numpy as np
from PIL import Image,ImageOps,ImageFilter
from scipy import ndimage as nd
src,dst,bx=sys.argv[1],sys.argv[2],sys.argv[3]
im=Image.open(src).convert('RGB');W,H=im.size
bg=Image.open('/home/user/eslam/production/code/site_listing/backdrop.png').convert('RGB').resize((W,H))
m=np.asarray(ImageOps.mirror(im)).astype(int);bm=np.asarray(ImageOps.mirror(bg)).astype(int);b=np.asarray(bg).astype(int)
d=np.abs(m-bm).max(2)>22
d=nd.binary_opening(d,iterations=1);d=nd.binary_dilation(d,iterations=3)
d[int(0.60*H):,:]=True
a=Image.fromarray((d*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2));a=np.asarray(a)[...,None]/255.
o=Image.fromarray((m*a+b*(1-a)).astype(np.uint8))
for s in bx.split(';'):
    if not s.strip():continue
    if s.startswith('px:'):
        X0,Y0,X1,Y1=[int(v) for v in s[3:].split(',')];X0-=7;Y0-=6;X1+=7;Y1+=6
    else:
        x0,y0,x1,y1=[float(v) for v in s.split(',')]
        X0,X1=int((1-x1)*W),int((1-x0)*W);Y0,Y1=int(y0*H),int(y1*H)
    p=ImageOps.mirror(o.crop((X0,Y0,X1,Y1)))
    mk=Image.new('L',p.size,0);mk.paste(255,(5,5,p.size[0]-5,p.size[1]-5));mk=mk.filter(ImageFilter.GaussianBlur(3))
    o.paste(p,(X0,Y0),mk)
if len(sys.argv)>4 and sys.argv[4]:
    x0,y0,x1,y1=[float(v) for v in sys.argv[4].split(',')]
    X0,X1=int((1-x1)*W),int((1-x0)*W);Y0,Y1=int(y0*H),int(y1*H)
    pl=Image.open('/home/user/eslam/production/code/site_listing/plate.png').convert('RGBA').resize((X1-X0,Y1-Y0),Image.LANCZOS)
    o.paste(pl,(X0,Y0),pl)
o.save(dst,quality=95)
