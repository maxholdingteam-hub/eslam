import sys, numpy as np, cv2
from PIL import Image
d=sys.argv[1]
im=np.array(Image.open(d+'/src.png'))
m=np.zeros(im.shape[:2],np.uint8)
polys=[ # rough car silhouettes (x,y)
 [(0,600),(40,560),(70,530),(300,530),(318,580),(318,700),(215,735),(0,735)],          # black SUV
 [(272,640),(330,565),(360,548),(500,548),(518,580),(390,640),(380,730),(272,730)],    # Nissan
 [(380,650),(440,590),(530,574),(660,574),(760,600),(845,640),(915,690),(922,780),(760,820),(640,815),(395,770)], # Kia
 [(598,600),(605,560),(625,552),(728,552),(745,600)],                                   # car behind Kia
 [(884,640),(905,575),(925,552),(1045,552),(1080,590),(1110,640),(1108,725),(885,725)], # grey Hyundai
 [(1090,630),(1100,575),(1135,545),(1260,543),(1300,580),(1300,640)],                   # white SUV
 [(1065,720),(1080,670),(1150,620),(1230,580),(1360,568),(1360,830),(1070,800)],        # Grandeur
]
for p in polys: cv2.fillPoly(m,[np.array(p,np.int32)],255)
m=cv2.dilate(m,np.ones((15,15),np.uint8))
Image.fromarray(m).save(d+'/mask.png')
ov=im.copy(); ov[m>0]=(ov[m>0]*0.4+np.array([255,0,0])*0.6).astype(np.uint8)
Image.fromarray(ov).save(d+'/mask_ov.jpg')
from simple_lama_inpainting import SimpleLama
import os; os.environ['LAMA_MODEL']='/root/.lama/big-lama.pt'
out=SimpleLama()(Image.fromarray(im),Image.fromarray(m))
out.crop((0,0)+im.shape[1::-1]).save(d+'/clean.png')
