import numpy as np, sys
from PIL import Image, ImageFilter, ImageOps
from rembg import remove, new_session
sess=new_session('isnet-general-use')
src,name=sys.argv[1],sys.argv[2]
im=Image.open(src).convert('RGB'); im.thumbnail((1200,1200))
# drop reflection: keep upper 72% (car above floor reflection)
im=im.crop((0,0,im.width,int(im.height*float(sys.argv[3]))))
cut=remove(im,session=sess)
a=(np.asarray(cut.split()[-1]).astype(float)/255>0.5)
hsv=np.asarray(im.convert('HSV')).astype(float); H,W=a.shape
sat=hsv[...,1]/255; val=hsv[...,2]/255
box=np.zeros_like(a); box[:int(H*0.65),:int(W*0.42)]=True
a=a & ~(box & (sat>0.22) & (val>0.12))
from scipy import ndimage as ndi
op=ndi.binary_opening(a,iterations=4)
lab,n=ndi.label(op)
if n>1:
    sizes=ndi.sum(op,lab,range(1,n+1)); op=(lab==(np.argmax(sizes)+1))
a=a & ndi.binary_dilation(op,iterations=5)
a=ndi.binary_fill_holes(a)
a=ndi.binary_closing(a,iterations=6)|a
from scipy import ndimage
lab,n=ndimage.label(a)
if n>1:
    sizes=ndimage.sum(a,lab,range(1,n+1)); a=(lab==(np.argmax(sizes)+1))
a=a.astype(float)
g=ImageOps.autocontrast(ImageOps.grayscale(im),cutoff=1).point(lambda v: min(255,max(0,int((v-128)*1.2+140))))
arr=np.asarray(g).astype(float); yy,xx=np.mgrid[0:arr.shape[0],0:arr.shape[1]]
arr=np.clip(arr+(np.sin(xx*0.9)*np.sin(yy*0.9))*16,0,255)
A=Image.fromarray((a*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1))
border=A.filter(ImageFilter.MaxFilter(21)).filter(ImageFilter.GaussianBlur(1.5))
out=Image.new('RGBA',im.size,(0,0,0,0)); white=Image.new('RGBA',im.size,(250,248,242,255)); white.putalpha(border); out.alpha_composite(white)
body=Image.fromarray(arr.astype(np.uint8)).convert('RGBA'); body.putalpha(A); out.alpha_composite(body)
out=out.crop(out.getbbox()); out.save(f'/tmp/mmw/e6/as/{name}.png'); print(name,out.size)
