# window mask for a car-interior photo: SegFormer (ADE20K) finds the outside world, SAM snaps it to the glass shapes
import numpy as np, torch, sys
from PIL import Image
from scipy import ndimage as nd
from transformers import SegformerImageProcessor, SegformerForSemanticSegmentation, SamModel, SamProcessor
SF = 'nvidia/segformer-b5-finetuned-ade-640-640'
sp = SegformerImageProcessor.from_pretrained(SF); sm = SegformerForSemanticSegmentation.from_pretrained(SF).eval()
OUT = {'windowpane','sky','tree','building','palm','mountain','skyscraper','house','plant','grass','road','sidewalk','earth','field','sand','fence','streetlight','pole','water','sea','hill','path','bridge','tower'}
OUTID = [i for i, n in sm.config.id2label.items() if n in OUT]
samp = SamProcessor.from_pretrained('facebook/sam-vit-base'); sam = SamModel.from_pretrained('facebook/sam-vit-base').eval()
def coarse(im):
    with torch.no_grad(): lo = sm(**sp(images=im, return_tensors='pt')).logits
    seg = torch.nn.functional.interpolate(lo, size=im.size[::-1], mode='bilinear').argmax(1)[0].numpy()
    return np.isin(seg, OUTID)
def mask(im):
    c = coarse(im); H, W = c.shape
    lab, n = nd.label(nd.binary_opening(c, iterations=3))
    out = np.zeros_like(c)
    for i in range(1, n + 1):
        comp = lab == i
        if comp.sum() < H * W * 0.004: continue
        d = nd.distance_transform_edt(comp); ys, xs = np.where(d > d.max() * 0.5)
        sel = np.random.default_rng(i).choice(len(ys), min(4, len(ys)), replace=False)
        pts = [[[float(xs[j]), float(ys[j])] for j in sel]]
        inp = samp(im, input_points=[pts], return_tensors='pt')
        with torch.no_grad(): o = sam(**inp, multimask_output=True)
        ms = samp.image_processor.post_process_masks(o.pred_masks, inp['original_sizes'], inp['reshaped_input_sizes'])[0][0].numpy()
        sc = o.iou_scores[0, 0].numpy()
        # pick the SAM mask that best agrees with the coarse component without spilling far outside the coarse mask
        best, bs = None, -1
        for m, s in zip(ms, sc):
            inter = (m & c).sum(); spill = (m & ~c).sum()
            score = inter / (comp.sum() + 1) - 1.5 * spill / (m.sum() + 1) + 0.2 * s
            if score > bs: bs, best = score, m
        out |= best
    return nd.binary_closing(out | c, iterations=2)
if __name__ == '__main__':
    for f in sys.argv[1:]:
        im = Image.open(f).convert('RGB'); im.thumbnail((1280, 1280))
        np.save('w_' + f.split('/')[-1] + '.npy', mask(im))
