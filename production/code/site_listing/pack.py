# pack.py CAR_DIR : site-size compressed copies (1123x794, q72) + data sheet, zipped as CAR_DIR_مضغوط.zip
import sys, glob, os, shutil, subprocess
from PIL import Image
c = sys.argv[1].rstrip('/'); out = c + '_مضغوط'
shutil.rmtree(out, ignore_errors=True); os.makedirs(out)
for f in sorted(glob.glob(f'{c}/*.jpg')):
    Image.open(f).convert('RGB').resize((1123, 794), Image.LANCZOS).save(f'{out}/{os.path.basename(f)}', quality=72, optimize=True, progressive=True, subsampling=2)
for t in glob.glob(f'{c}/*.txt'): shutil.copy(t, out)
if os.path.exists(out + '.zip'): os.remove(out + '.zip')
subprocess.run(f'cd "{out}" && zip -q -r "../{os.path.basename(out)}.zip" .', shell=True, check=True)
print(out + '.zip', sum(os.path.getsize(f) for f in glob.glob(out + '/*')) // 1024, 'KB')
