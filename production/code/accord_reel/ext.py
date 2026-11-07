import numpy as np, cv2, sys
from PIL import Image
from simple_lama_inpainting import SimpleLama
d=sys.argv[1]
src=np.array(Image.open('/tmp/claude-0/-home-user-eslam/0f5505b8-8bf4-57e7-9c4a-28493f9f4c64/scratchpad/clean/clean3.png').convert('RGB'))
X0,X1=290,1090; W=X1-X0; H=int(round(W*16/9)); TOP=260
can=np.zeros((H,W,3),np.uint8); m=np.full((H,W),255,np.uint8)
can[TOP:TOP+990]=src[:,X0:X1]; m[TOP+4:TOP+990-4]=0
out=np.array(SimpleLama()(Image.fromarray(can),Image.fromarray(m)))[:H,:W]
# sky: keep near-black gradient from the original top rows instead of hallucinated detail
sky=src[0:20,X0:X1].mean((0,1))
for y in range(TOP+10):
    k=min(1,(TOP+10-y)/40); out[y]=(out[y]*(1-k)+sky*k).astype(np.uint8)
Image.fromarray(out).save(d+'/plate_v.png'); print(W,H,TOP)
