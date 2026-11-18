import numpy as np, sys
from PIL import Image, ImageFilter, ImageOps
from rembg import remove, new_session
sess=new_session('birefnet-portrait')
src,name=sys.argv[1],sys.argv[2]
im=Image.open(src).convert('RGB'); im.thumbnail((1000,1000))
cut=remove(im,session=sess)
a=(np.asarray(cut.split()[-1]).astype(float)/255>0.5).astype(float)
g=ImageOps.autocontrast(ImageOps.grayscale(im),cutoff=1).point(lambda v: min(255,max(0,int((v-128)*1.25+138))))
arr=np.asarray(g).astype(float); yy,xx=np.mgrid[0:arr.shape[0],0:arr.shape[1]]
arr=np.clip(arr+(np.sin(xx*0.9)*np.sin(yy*0.9))*18,0,255)
A=Image.fromarray((a*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1))
border=A.filter(ImageFilter.MaxFilter(25)).filter(ImageFilter.GaussianBlur(1.5))
out=Image.new('RGBA',im.size,(0,0,0,0)); white=Image.new('RGBA',im.size,(250,248,242,255)); white.putalpha(border); out.alpha_composite(white)
body=Image.fromarray(arr.astype(np.uint8)).convert('RGBA'); body.putalpha(A); out.alpha_composite(body)
out=out.crop(out.getbbox()); out.save(f'/tmp/mmw/mdx/as/{name}.png'); print(name,out.size)
