import sys
from PIL import Image
im=Image.open(sys.argv[1]).convert("RGB"); px=im.load(); W,H=im.size
out=Image.new("RGBA",(W,H)); po=out.load()
for y in range(H):
  for x in range(W):
    r,g,b=px[x,y]; m=max(r,g,b)
    a=0 if m<14 else min(255,int((m-14)*255/(150-14))) if m<150 else 255
    if a==0: po[x,y]=(0,0,0,0); continue
    f=255/a; po[x,y]=(min(255,int(r*f)),min(255,int(g*f)),min(255,int(b*f)),a)
out.save(sys.argv[2])
