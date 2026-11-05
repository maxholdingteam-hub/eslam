# cut360.py KEEPSET IDX OUT.png : rembg + remove grey studio floor
import json,sys,numpy as np
from PIL import Image
from rembg import remove,new_session
from scipy import ndimage as nd
O='/tmp/mmw/off/';k,i,out=sys.argv[1],int(sys.argv[2]),sys.argv[3]
im=Image.open(O+json.load(open(O+k+'_keep.json'))[i][0]).convert('RGBA');al0=np.asarray(im)[...,3]
im=im.convert('RGB');a=np.asarray(im).astype(int)
c=np.asarray(remove(im,session=new_session('isnet-general-use')))[...,3].astype(float)
c=np.minimum(c,al0)
bg=np.median(np.concatenate([a[:20].reshape(-1,3),a[:,:20].reshape(-1,3)]),0)
diff=np.abs(a-bg).max(2);H=a.shape[0];rows=np.arange(H)[:,None]
ys=np.where((c>128).any(1))[0];low=rows>(ys.min()+0.78*(ys.max()-ys.min()))
m=(c>128)&~(low&(diff<28))
lb,n=nd.label(m);sz=np.bincount(lb.ravel());sz[0]=0;m=lb==sz.argmax();m=nd.binary_fill_holes(m)
Image.fromarray(np.dstack([a,(m*c).astype(np.uint8)]).astype(np.uint8)).save(out)
