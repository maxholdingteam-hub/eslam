import sys, json, numpy as np
from PIL import Image, ImageDraw, ImageFilter
cfg=json.load(open(sys.argv[1])); src,dst=sys.argv[2],sys.argv[3]; dbg=len(sys.argv)>4
for name,c in cfg.items():
    im=Image.open(f'{src}/{name}').convert('RGB'); a=np.asarray(im,float)
    g=im.convert('L')
    m=Image.new('L',im.size,0); d=ImageDraw.Draw(m)
    for p in c['in']: d.polygon([tuple(x) for x in p],fill=255)
    for p in c.get('out',[]): d.polygon([tuple(x) for x in p],fill=0)
    m=np.asarray(m.filter(ImageFilter.GaussianBlur(1)),float)/255
    if c.get('bg','max')=='max':
        bg=np.asarray(g.filter(ImageFilter.MaxFilter(c.get('k',31))).filter(ImageFilter.GaussianBlur(6)),float)
    else:
        sm=g.resize((g.width//2,g.height//2)).filter(ImageFilter.MedianFilter(c.get('k',21))).resize(g.size).filter(ImageFilter.GaussianBlur(3))
        bg=np.asarray(sm,float)
    L=np.asarray(g,float)
    sat=a.max(2)-a.min(2)
    t0,t1=c.get('t0',22),c.get('t1',30)
    w=np.clip((bg-L-t0)/t1,0,1)*(sat<c.get('smax',40))
    w=np.asarray(Image.fromarray((w*255).astype(np.uint8)).filter(ImageFilter.MedianFilter(3)).filter(ImageFilter.GaussianBlur(0.6)),float)/255
    w*=m*(0 if c.get('noauto') else 1)
    f=c.get('f',0.22)            # how dark the frame gets (fraction of its brightness kept)
    gray=a.mean(2,keepdims=True)
    tgt=gray*f+np.array([2,2,3])*1.0   # neutral near-black, keeps texture/shading
    out=a*(1-w[...,None])+tgt*w[...,None]
    Image.fromarray(np.clip(out,0,255).astype(np.uint8)).save(f'{dst}/{name}',quality=95)
    for bp in c.get('bands',[]):
        bm=Image.new('L',im.size,0); ImageDraw.Draw(bm).polygon([tuple(x) for x in bp],fill=255)
        hard=np.asarray(bm)>0
        bw=np.asarray(bm.filter(ImageFilter.GaussianBlur(1.0)),float)/255
        cur=out; gy=cur.mean(2)
        T=c.get('T',72); f=min(1.0,T/max(np.median(gy[hard]),1))
        tg=gy[...,None]*f+np.array([0,0,1.5])
        out=cur*(1-bw[...,None])+tg*bw[...,None]
        Image.fromarray(np.clip(out,0,255).astype(np.uint8)).save(f'{dst}/{name}',quality=95)
    if dbg: Image.fromarray((w*255).astype(np.uint8)).save(f'/tmp/villa/fw_{name}.png')
    print(name,'frame px',int((w>0.5).sum()))
