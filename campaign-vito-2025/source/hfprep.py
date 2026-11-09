import sys
from PIL import Image
S=sys.argv[1]
def box(k,x0,x1,y0=0,y1=1):
    im=Image.open(f"{S}/clean/{k}.jpg"); W,H=im.size
    return im.crop((int(x0*W),int(y0*H),int(x1*W),int(y1*H)))
def v916(k,cx):
    im=Image.open(f"{S}/clean/{k}.jpg"); W,H=im.size; w=int(H*9/16); x=int(cx*W-w/2); x=max(0,min(W-w,x))
    return im.crop((x,0,x+w,H))
J={"c1_A":box("c1_01",.19,.81),"c1_B":box("c1_03",0,.70),"c1_F":box("c1_14",.27,.73),
   "c1_C":v916("c1_05",.38),"c1_D":v916("c1_09",.5),"c1_E":v916("c1_11",.5),"c1_G":v916("c1_12",.55),
   "c2_A":box("c2_01",.20,.815),"c2_B":box("c2_03",0,.70),"c2_F":box("c2_10",.25,.73),
   "c2_C":v916("c2_05",.55),"c2_D":v916("c2_07",.55),"c2_E":v916("c2_08",.45),"c2_G":v916("c2_09",.45)}
for k,im in J.items():
    im.thumbnail((2048,2048)); im.save(f"{S}/hf/{k}.jpg",quality=93); print(k,im.size)
