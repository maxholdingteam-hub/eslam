import sys
from PIL import Image, ImageDraw
src,dst=sys.argv[1],sys.argv[2]
im=Image.open(src).convert('RGB'); W=1000; im=im.resize((W,int(im.height*W/im.width)))
d=ImageDraw.Draw(im)
for x in range(0,W,50):
    d.line([(x,0),(x,im.height)],fill=(255,0,0) if x%100==0 else (255,150,150),width=1)
    if x%100==0: d.text((x+2,2),str(x),fill=(255,255,0))
for y in range(0,im.height,50):
    d.line([(0,y),(W,y)],fill=(0,200,255) if y%100==0 else (150,220,255),width=1)
    if y%100==0: d.text((2,y+2),str(y),fill=(0,255,0))
im.save(dst,quality=85)
