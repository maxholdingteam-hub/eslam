import sys,glob,os,random
from PIL import Image, ImageFilter, ImageEnhance
S=sys.argv[1]
for f in sorted(glob.glob(f"{S}/clean/*.jpg")):
    k=os.path.basename(f)[:-4]; im=Image.open(f)
    a=im.copy(); a.thumbnail((2700,2700)); a.save(f"{S}/mg/img/{k}.jpg",quality=92)
    b=im.copy(); b.thumbnail((600,600)); b=b.filter(ImageFilter.GaussianBlur(14)); b=ImageEnhance.Brightness(b).enhance(.45); b.save(f"{S}/mg/img/{k}_bg.jpg",quality=88)
random.seed(3)
for i in range(6):
    n=Image.effect_noise((540,960),90).convert("L"); n.save(f"{S}/mg/img/grain{i}.png")
