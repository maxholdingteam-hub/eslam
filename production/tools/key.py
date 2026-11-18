import numpy as np,sys
from PIL import Image, ImageFilter
for k in sys.argv[1:]:
    im=np.asarray(Image.open(f'{k}.png').convert('RGB')).astype(float)
    r,g,b=im[...,0],im[...,1],im[...,2]
    gr=g-np.maximum(r,b); a=np.clip(1-(gr-30)/70,0,1)
    out=im.copy(); spill=g>np.maximum(r,b); out[...,1]=np.where(spill,np.maximum(r,b)+(g-np.maximum(r,b))*0.2,g)
    A=Image.fromarray((a*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
    o=Image.fromarray(out.astype(np.uint8)).convert('RGBA'); o.putalpha(A); o=o.crop(o.getbbox()); o.thumbnail((900,900)); o.save(f'/tmp/mmw/mdx/as/c_{k}.png')
print('ok')
