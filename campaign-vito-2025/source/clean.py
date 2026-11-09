import sys,json
from PIL import Image, ImageDraw, ImageFont, ImageFilter
S=sys.argv[1]
F="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
J={
"c1_01":dict(src="hi1/p-01.jpg",crop=(0,62,1000,666),plates=[(428,388,578,422),(62,348,145,374),(853,352,938,378)]),
"c1_03":dict(src="hi1/p-03.jpg",crop=(0,50,1000,666),plates=[(0,393,95,420)]),
"c1_04":dict(src="hi1/p-04.jpg",crop=(0,160,1000,520)),
"c1_05":dict(src="hi1/p-05.jpg",crop=(0,0,1000,666)),
"c1_09":dict(src="hi1/p-09.jpg",crop=(0,0,1000,666)),
"c1_11":dict(src="hi1/p-11.jpg",crop=(0,0,1000,666)),
"c1_12":dict(src="hi1/p-12.jpg",crop=(0,0,1000,666)),
"c1_14":dict(src="hi1/p-14.jpg",crop=(0,132,1000,666),plates=[(443,388,557,413),(48,421,130,446),(853,426,938,450)],blur=[(333,338,364,364)]),
"c2_01":dict(src="hi2/p-01.jpg",crop=(0,60,1000,666),plates=[(430,372,578,408),(62,346,145,370),(858,350,942,374)]),
"c2_03":dict(src="hi2/p-03.jpg",crop=(0,52,1000,666),plates=[(0,372,120,406)]),
"c2_04":dict(src="hi2/p-04.jpg",crop=(0,118,1000,520)),
"c2_05":dict(src="hi2/p-05.jpg",crop=(0,0,690,666)),
"c2_06":dict(src="hi2/p-06.jpg",crop=(110,0,1000,666)),
"c2_07":dict(src="hi2/p-07.jpg",crop=(0,0,1000,505)),
"c2_08":dict(src="hi2/p-08.jpg",crop=(0,0,1000,666)),
"c2_09":dict(src="hi2/p-09.jpg",crop=(0,0,1000,666)),
"c2_10":dict(src="hi2/p-10.jpg",crop=(0,92,1000,666),plates=[(433,352,552,385),(0,396,88,418),(843,398,928,420)],blur=[(323,306,352,334)]),
}
for k,c in J.items():
    im=Image.open(f"{S}/{c['src']}").convert("RGB"); s=im.width/1000
    sc=lambda b:tuple(int(round(v*s)) for v in b)
    for b in c.get("blur",[]):
        x0,y0,x1,y1=sc(b); reg=im.crop((x0,y0,x1,y1)).filter(ImageFilter.GaussianBlur(25)); im.paste(reg,(x0,y0))
    d=ImageDraw.Draw(im)
    PL=Image.open(f"{S}/mg/plate.png").convert("RGBA")
    for b in c.get("plates",[]):
        x0,y0,x1,y1=sc(b); w=x1-x0; h=y1-y0
        d.rounded_rectangle((x0,y0,x1,y1),radius=int(h*.16),fill=(9,9,10))
        ph=int(w/PL.width*PL.height)
        if ph>h: ph=h; pw=int(h/PL.height*PL.width)
        else: pw=w
        pl=PL.resize((pw,ph),Image.LANCZOS)
        im.paste(pl,(x0+(w-pw)//2,y0+(h-ph)//2),pl)
    im.crop(sc(c["crop"])).save(f"{S}/clean/{k}.jpg",quality=93)
    print(k,im.crop(sc(c["crop"])).size)
