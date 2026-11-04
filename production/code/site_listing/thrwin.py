# thrwin.py IN OUT mode ; custom window mask + site backdrop
import sys,numpy as np,cv2
from PIL import Image,ImageFilter
from scipy import ndimage as nd
src,dst,mode=sys.argv[1:4]
im=Image.open(src).convert('RGB');W,H=im.size;a=np.asarray(im).astype(int)
g=a.mean(2);sat=a.max(2)-a.min(2)
def polym(pts):
    m=np.zeros((H,W),np.uint8);p=np.array([[x*W/1123,y*H/794] for x,y in pts],np.int32);cv2.fillPoly(m,[p],1);return m.astype(bool)
if mode=='seat':
    reg=polym([(0,165),(380,165),(380,345),(0,345)])|polym([(395,170),(660,175),(660,345),(395,345)])|polym([(960,205),(1123,200),(1123,310),(960,310)])|polym([(0,0),(150,0),(118,170),(0,200)])
    m=reg&(g>200)&(sat<40)
    rr=polym([(940,195),(1123,190),(1123,320),(940,320)]);m|=rr&(g>165)&(sat<35)
    m=nd.binary_opening(m,iterations=1);m=nd.binary_closing(m,iterations=2);m=nd.binary_fill_holes(m)
    lab,n=nd.label(m);sz=nd.sum(m,lab,range(1,n+1));m=np.isin(lab,1+np.where(sz>W*H*0.0015)[0])
else:
    reg=polym([(45,0),(1090,0),(1080,170),(45,170)])
    dark=(g<50);lab,n=nd.label(dark);hit=set(np.unique(lab[int(H*172/794):int(H*180/794)]))-{0}
    dark=np.isin(lab,list(hit));dark=nd.binary_dilation(dark,iterations=2)
    m=reg&~dark
    lab,n=nd.label(m);sz=nd.sum(m,lab,range(1,n+1));m=np.isin(lab,1+np.where(sz>W*H*0.003)[0])
    m=nd.binary_closing(m,iterations=2)
bg=Image.open('/home/user/eslam/production/code/site_listing/backdrop.png').convert('RGB')
big=bg.resize((W,2*H));rows=np.where(m.any(1))[0];tgt=np.percentile(rows,80) if len(rows) else H/2
off=int(np.clip(0.615*2*H-tgt,0,H));b=big.crop((0,off,W,off+H))
al=Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))
Image.composite(b,im,al).save(dst,quality=93);print('mask',m.mean())
