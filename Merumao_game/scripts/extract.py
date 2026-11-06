"""Extract centerpiece illustrations that only exist inside the flattened mockups
(GrabCut foreground segmentation + feathered alpha), then upscale 1.5x."""
import cv2, numpy as np, glob, json, os
from PIL import Image, ImageFilter
MOCK = sorted(glob.glob('/mnt/user-data/uploads/รูปตัวอย่าง/*.png'))
OUT = '/home/claude/merumao/public/assets'
# (mockup index, slug, crop box x0,y0,x1,y1 at mockup resolution)
JOBS = [(1, 'intro/c1-shop', (470, 100, 975, 525)), (2, 'intro/c2-door', (570, 140, 870, 525)),
        (3, 'intro/c3-teller', (515, 140, 910, 535)), (4, 'intro/c4-bowl', (495, 125, 945, 530)),
        (5, 'intro/c5-hand', (470, 180, 925, 505)), (6, 'intro/c6-sign', (580, 140, 885, 530)),
        (16, 'result/sign-lantern', (1150, 0, 1395, 185))]
man = json.load(open(f'{OUT}/manifest.json'))
for idx, slug, (x0, y0, x1, y1) in JOBS:
    img = cv2.imread(MOCK[idx], cv2.IMREAD_COLOR)[y0:y1, x0:x1].copy()
    h, w = img.shape[:2]
    mask = np.zeros((h, w), np.uint8); bgd = np.zeros((1, 65), np.float64); fgd = np.zeros((1, 65), np.float64)
    m = 10
    cv2.grabCut(img, mask, (m, m, w - 2 * m, h - 2 * m), bgd, fgd, 8, cv2.GC_INIT_WITH_RECT)
    a = np.where((mask == 1) | (mask == 3), 255, 0).astype(np.uint8)
    # keep largest components, close holes, feather
    a = cv2.morphologyEx(a, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(a)
    keep = np.zeros_like(a)
    for i in range(1, n):
        if stats[i, cv2.CC_STAT_AREA] > 0.01 * w * h: keep[lab == i] = 255
    keep = cv2.GaussianBlur(keep, (0, 0), 2.2)
    rgba = np.dstack([cv2.cvtColor(img, cv2.COLOR_BGR2RGB), keep])
    pim = Image.fromarray(rgba, 'RGBA')
    pim = pim.resize((round(w * 1.5), round(h * 1.5)), Image.LANCZOS)
    pim.save(f'{OUT}/{slug}.webp', 'WEBP', quality=88, method=4)
    man[slug] = {'src': os.path.basename(MOCK[idx]) + ' (extracted from mockup)', 'w': pim.width, 'h': pim.height, 'source': 'extracted'}
# (group illustration now comes from the supplied SVG: กล่องแสดงผลัพธ์/image 49.svg — see build_assets.py)
json.dump(man, open(f'{OUT}/manifest.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('done')
