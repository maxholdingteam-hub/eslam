import sys
from rembg import remove,new_session
from PIL import Image
s=new_session('birefnet-portrait'); k,f=sys.argv[1],sys.argv[2]
im=Image.open(f).convert('RGB'); im.thumbnail((1000,1000)); o=remove(im,session=s); o=o.crop(o.getbbox()); o.save(f'/tmp/mmw/bc/as/{k}.png'); print(k,o.size)
