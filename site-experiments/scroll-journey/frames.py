import subprocess,sys,os,glob
from PIL import Image
d=os.path.dirname(os.path.abspath(__file__)); out=os.path.join(d,'site',os.environ.get('OUT','f')); tmp=os.path.join(d,'tmp')
os.makedirs(out,exist_ok=True); os.makedirs(tmp,exist_ok=True)
for f in glob.glob(out+'/*.webp')+glob.glob(tmp+'/*.png'): os.remove(f)
FPS=int(os.environ.get('FPS','14')); i=0
for k,v in enumerate(sys.argv[1:]):
    subprocess.run(['ffmpeg','-v','error','-y','-i',v,'-vf',f'fps={FPS},scale={os.environ.get("W","1280")}:-2:flags=lanczos,eq=contrast=1.03:saturation=1.05',tmp+'/%04d.png'],check=True)
    fs=sorted(glob.glob(tmp+'/*.png'))
    if k>0: fs=fs[1:]
    for f in fs:
        Image.open(f).convert('RGB').save(f'{out}/{i:04d}.webp',quality=int(os.environ.get('Q','50')),method=5); i+=1
    for f in glob.glob(tmp+'/*.png'): os.remove(f)
print(i)
