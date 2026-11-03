# window replacement guided by hand-placed points (coords on a 1123x794 view of the image):
#   python3 win_manual.py IN OUT "x,y x,y ; x,y" [--neg "x,y x,y"] [--preview PREV]
# each ';'-separated group is one window (one SAM object); points inside it are positive prompts.
import sys, os, argparse, numpy as np, torch
from PIL import Image, ImageFilter
from scipy import ndimage as nd
from transformers import SamModel, SamProcessor
HERE = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser(); ap.add_argument('inp'); ap.add_argument('out'); ap.add_argument('groups')
ap.add_argument('--neg', default=''); ap.add_argument('--poly', default=''); ap.add_argument('--cut', default=''); ap.add_argument('--keep', default=''); ap.add_argument('--preview'); ap.add_argument('--grow', type=int, default=2)
a = ap.parse_args()
im = Image.open(a.inp).convert('RGB'); W, H = im.size; sx, sy = W / 1123, H / 794
P = lambda s: [[float(x) * sx, float(y) * sy] for x, y in (p.split(',') for p in s.split())]
negs = P(a.neg) if a.neg.strip() else []
proc = SamProcessor.from_pretrained('facebook/sam-vit-base'); sam = SamModel.from_pretrained('facebook/sam-vit-base').eval()
work = im.copy(); work.thumbnail((1600, 1600)); k = work.width / W
emb = None; mask = np.zeros((work.height, work.width), bool)
def segment(pos, neg, cap=0.30):
    pts = [[ [p[0] * k, p[1] * k] for p in pos + neg ]]; lab = [[1] * len(pos) + [0] * len(neg)]
    inp = proc(work, input_points=[pts], input_labels=[lab], return_tensors='pt')
    with torch.no_grad(): o = sam(**inp, multimask_output=True)
    ms = proc.image_processor.post_process_masks(o.pred_masks, inp['original_sizes'], inp['reshaped_input_sizes'])[0][0].numpy()
    sc = o.iou_scores[0, 0].numpy()
    # prefer the confident mask that is not huge (windows are a fraction of the frame)
    cand = [(s - 2.0 * max(0, m.mean() - cap), m) for m, s in zip(ms, sc)]
    return max(cand, key=lambda t: t[0])[1]
for g in (a.groups.split(';') if a.groups.strip() else []):
    pos = P(g)
    if pos: mask |= segment(pos, negs)
from PIL import ImageDraw
def polys(spec):
    m = Image.new('L', (work.width, work.height), 0); d = ImageDraw.Draw(m)
    for g in spec.split(';'):
        pts = [(p[0] * k, p[1] * k) for p in P(g)]
        if len(pts) >= 3: d.polygon(pts, fill=255)
    return np.asarray(m) > 0
if a.poly.strip(): mask |= polys(a.poly)
mask = nd.binary_fill_holes(nd.binary_closing(mask, iterations=2))
if a.cut.strip(): mask &= ~polys(a.cut)
# --keep: objects in front of the glass (mirror, headrest...) traced by SAM and kept from the photo
for g in (a.keep.split(';') if a.keep.strip() else []):
    pos = P(g)
    if pos: mask &= ~nd.binary_dilation(segment(pos, [], cap=0.10), iterations=1)
if a.grow: mask = nd.binary_dilation(mask, iterations=a.grow)
big = Image.open(os.path.join(HERE, 'backdrop.png')).convert('RGB').resize((W, H * 2), Image.LANCZOS)  # stretched tall so we can slide it
# slide the backdrop so its glowing horizon line (61.5% down) sits near the bottom of the windows, like the site's interiors
rows = np.where(mask.any(1))[0]
tgt = (np.percentile(rows, 80) / mask.shape[0]) * H if len(rows) else H * 0.3
off = int(np.clip(0.615 * 2 * H - tgt, 0, H))
bg = big.crop((0, off, W, off + H))
al = Image.fromarray((mask * 255).astype(np.uint8)).resize((W, H), Image.BILINEAR).filter(ImageFilter.GaussianBlur(2.5))
# keep a faint trace of the original glass so it reads as glass, not a cut-out
bgm = Image.blend(bg, im, 0.06)
Image.composite(bgm, im, al).save(a.out, quality=93)
if a.preview:
    pv = np.asarray(work).copy(); pv[mask] = (pv[mask] * 0.35 + np.array([255, 0, 255]) * 0.65).astype(np.uint8)
    Image.fromarray(pv).save(a.preview)
print('mask %.3f' % mask.mean())
