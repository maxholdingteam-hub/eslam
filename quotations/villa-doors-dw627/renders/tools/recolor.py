import sys, json, numpy as np
from PIL import Image, ImageDraw, ImageFilter

def srgb2lin(c): c=c/255.0; return np.where(c<=0.04045,c/12.92,((c+0.055)/1.055)**2.4)
def lin2srgb(c): c=np.clip(c,0,1); return np.where(c<=0.0031308,c*12.92,1.055*c**(1/2.4)-0.055)*255
M=np.array([[0.4124,0.3576,0.1805],[0.2126,0.7152,0.0722],[0.0193,0.1192,0.9505]]); Mi=np.linalg.inv(M)
W=np.array([0.95047,1.0,1.08883])
def f(t): return np.where(t>0.008856,np.cbrt(t),7.787*t+16/116)
def fi(t): return np.where(t>0.206897,t**3,(t-16/116)/7.787)
def rgb2lab(a):
    xyz=srgb2lin(a)@M.T/W; fx,fy,fz=f(xyz[...,0]),f(xyz[...,1]),f(xyz[...,2])
    return np.stack([116*fy-16,500*(fx-fy),200*(fy-fz)],-1)
def lab2rgb(l):
    fy=(l[...,0]+16)/116; fx=fy+l[...,1]/500; fz=fy-l[...,2]/200
    xyz=np.stack([fi(fx),fi(fy),fi(fz)],-1)*W
    return lin2srgb(xyz@Mi.T)

# target DW627 from the supplier's finish swatch
sw=rgb2lab(np.asarray(Image.open(sys.argv[1]).convert('RGB'),float)).reshape(-1,3)
T=np.median(sw,0); Tstd=sw[:,0].std(); TL,TA,TB=T[0]-5,T[1]+0.8,T[2]+2.5
cfg=json.load(open(sys.argv[2])); src,dst=sys.argv[3],sys.argv[4]
for name,polys in cfg.items():
    im=Image.open(f'{src}/{name}').convert('RGB'); a=np.asarray(im,float); lab=rgb2lab(a)
    def pmask(ps):
        m=Image.new('L',im.size,0); d=ImageDraw.Draw(m)
        for p in ps: d.polygon([tuple(x) for x in p],fill=255)
        return np.asarray(m)>0
    norm=[p for p in polys if isinstance(p,list)]
    loose=[p['p'] for p in polys if isinstance(p,dict) and p.get('m','loose')=='loose']
    strict=[p for p in polys if isinstance(p,dict) and p.get('m')=='strict']
    pm=pmask(norm) if norm else np.zeros(im.size[::-1],bool)
    lm=pmask(loose) if loose else np.zeros(im.size[::-1],bool)
    sm=np.zeros(im.size[::-1],bool)
    L,A,B=lab[...,0],lab[...,1],lab[...,2]; C=np.hypot(A,B); H=np.degrees(np.arctan2(B,A))
    # brown wood: warm hue, some chroma, not bright
    base=pm&(C>6)&(H>45)&(H<80)&(L<70)
    # robust: wood is the dark mode; cut at gap between wood and wall
    Lw=np.percentile(L[base],40) if base.sum()>200 else 50
    cut=min(Lw+16,66)
    wood=base&(L<cut)
    def er(m): return np.asarray(Image.fromarray((m*255).astype(np.uint8)).filter(ImageFilter.MedianFilter(3)).filter(ImageFilter.MinFilter(3)))>0
    extra=lm&(L<max(cut+15,66))
    for sp in strict:
        m=pmask([sp['p']]); c0,h0,h1,dl=sp.get('c',8),sp.get('h0',45),sp.get('h1',82),sp.get('dl',10)
        extra|=m&(C>c0)&(H>h0)&(H<h1)&(L<cut+dl); sm|=m
    pm=pm|lm|sm
    wood=(er(wood)&~(lm|sm))|extra
    if wood.sum()<50: print(name,'no wood'); continue

    soft=np.asarray(Image.fromarray((wood*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7)),float)/255
    soft*=pm  # never leak outside polygon
    Lm=np.median(L[base&(L<cut)]) if (base&(L<cut)).sum()>500 else np.median(L[wood]); Ls=L[wood].std()+1e-6
    # keep lighting & grain: shift to DW627 lightness, mild contrast boost to match swatch grain
    k=min(1.6,max(0.9,Tstd/Ls))
    nL=np.clip(TL+(Lm-36)*0.35+(L-Lm)*0.95,0,TL+12)
    nA=TA+(A-np.median(A[wood]))*0.3; nB=TB+(B-np.median(B[wood]))*0.3
    out=lab2rgb(np.stack([nL,nA,nB],-1))
    res=a*(1-soft[...,None])+out*soft[...,None]
    Image.fromarray(np.clip(res,0,255).astype(np.uint8)).save(f'{dst}/{name}',quality=95)
    print(name,'cut %.0f'%cut,'px',int(wood.sum()),'Lm %.1f -> %.1f'%(Lm,T[0]),'k %.2f'%k)
print('target lab',T.round(1))
