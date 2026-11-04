# thr2.py IN OUT "poly;poly" gmin bminusr_min  : sky = inside polys & bright & bluish ; -> site backdrop
import sys,numpy as np,cv2
from PIL import Image,ImageFilter
from scipy import ndimage as nd
src,dst,polys,gmin,bmr=sys.argv[1],sys.argv[2],sys.argv[3],float(sys.argv[4]),float(sys.argv[5])
im=Image.open(src).convert('RGB');W,H=im.size;a=np.asarray(im).astype(int)
g=a.mean(2);bm=a[...,2]-a[...,0]
reg=np.zeros((H,W),np.uint8)
for p in polys.split(';'):
    pts=np.array([[float(v.split(',')[0])*W/1123,float(v.split(',')[1])*H/794] for v in p.split()],np.int32);cv2.fillPoly(reg,[pts],1)
cut=np.zeros((H,W),np.uint8)
if len(sys.argv)>6:
    for p in sys.argv[6].split(';'):
        pts=np.array([[float(v.split(',')[0])*W/1123,float(v.split(',')[1])*H/794] for v in p.split()],np.int32);cv2.fillPoly(cut,[pts],1)
reg=reg&(1-cut)
m=reg.astype(bool)&(g>gmin)&(bm>bmr)
m=nd.binary_opening(m,iterations=1);m=nd.binary_closing(m,iterations=3);m=nd.binary_fill_holes(m)&reg.astype(bool)
lab,n=nd.label(m);sz=nd.sum(m,lab,range(1,n+1));m=np.isin(lab,1+np.where(sz>W*H*float(__import__("os").environ.get("MINC","0.002")))[0])
bg=Image.open('/home/user/eslam/production/code/site_listing/backdrop.png').convert('RGB')
big=bg.resize((W,2*H));rows=np.where(m.any(1))[0];tgt=np.percentile(rows,80) if len(rows) else H/2
off=int(np.clip(0.615*2*H-tgt,0,H));b=big.crop((0,off,W,off+H))
al=Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))
Image.composite(b,im,al).save(dst,quality=93);print(dst.split('/')[-1],'mask %.3f'%m.mean())
