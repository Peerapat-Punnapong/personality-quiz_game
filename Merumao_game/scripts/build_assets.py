"""MERUMAO asset pipeline: copies original Thai-named assets to ASCII slugs,
upscales low-res art (Lanczos + unsharp — no AI model available offline),
exports WebP, bakes blurred backgrounds, writes a manifest."""
import json, os, sys, subprocess, io
from PIL import Image, ImageFilter, ImageEnhance
U = sys.argv[1] if len(sys.argv) > 1 else '/mnt/user-data/uploads'
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets')
manifest = {}

def save(img, slug, src, source='original', q=86):
    path = os.path.join(OUT, slug + '.webp')
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, 'WEBP', quality=q, method=4)
    manifest[slug] = {'src': src, 'w': img.width, 'h': img.height, 'source': source}

def up(img, factor):
    """Lanczos upscale with alpha-safe unsharp mask (keeps exact aspect ratio)."""
    w, h = img.size
    big = img.resize((round(w * factor), round(h * factor)), Image.LANCZOS)
    if big.mode == 'RGBA':
        rgb, a = big.convert('RGB'), big.getchannel('A')
        rgb = rgb.filter(ImageFilter.UnsharpMask(radius=1.6, percent=90, threshold=2))
        rgb.putalpha(a); return rgb
    return big.filter(ImageFilter.UnsharpMask(radius=1.6, percent=90, threshold=2))

def op(rel): return Image.open(os.path.join(U, rel))
def svg(rel, width):
    """Rasterize the supplied SVG (embedded hi-res art + vector label) at an exact width."""
    png = subprocess.run(['rsvg-convert', '-w', str(width), os.path.join(U, rel)], check=True, capture_output=True).stdout
    return Image.open(io.BytesIO(png)).convert('RGBA')

# brand
save(op('logo design/เมรุเมา Fiery Thai Brush Logo (1) 3.png').convert('RGBA').resize((640, 262), Image.LANCZOS), 'brand/logo', 'logo design/เมรุเมา Fiery Thai Brush Logo (1) 3.png')
lg = op('logo design/เมรุเมา_ Thai Flame Brush Logo 2.png').convert('RGBA'); lg.thumbnail((1400, 1400))
save(lg, 'brand/logo-tagline', 'logo design/เมรุเมา_ Thai Flame Brush Logo 2.png')

# home layers
for name, slug in [('ตัวละคร', 'hero-duo'), ('เมรุเมา1', 'tavern'), ('บ้านเงา1', 'shadow-house'), ('พระจันทร์แดง', 'red-moon'), ('เสาไฟ1', 'lantern-post'),
                   ('ควัน1', 'smoke1'), ('ควัน2', 'smoke2'), ('ควันน3', 'smoke3'), ('ควัน4', 'smoke4'), ('ควัน6', 'smoke6'), ('ควัน7', 'smoke7')]:
    save(op(f'asset home page/{name}.png').convert('RGBA'), f'home/{slug}', f'asset home page/{name}.png')

# icons
for name, slug in [('เตะขันน้ำมนต์', 'step-bowl'), ('เลือกไพ่', 'step-cards'), ('เซียมซี', 'step-siamsi'), ('option1', 'bullet-mirror'),
                   ('ไพ่options2', 'bullet-cards'), ('option3', 'bullet-scroll'), ('option4', 'bullet-share'), ('email_icon', 'email'), ('website_icon', 'website')]:
    save(op(f'icon ประกอบ/{name}.png').convert('RGBA'), f'icons/{slug}', f'icon ประกอบ/{name}.png')

# ghosts (163–190px originals -> ~600px, flagged as upscaled)
GHOSTS = {'pob': 'ผีปอบหลอกกินแซ่บ', 'dib': 'ผีดิบจิบกับแกล้ม', 'tani': 'ผีตานีหนีผัวเที่ยว', 'am': 'ผีอำจำแต่ชื่อแฟนเก่า',
          'kongkoi': 'ผีกองกอยคอยเขาทัก', 'takien': 'ผีตะเคียนเซียนยืมตังค์', 'krasue': 'ผีกระสือคือคนสวย', 'pret': 'ผีเปรตเบรกมองหนุ่มตี๋'}
for gid, th in GHOSTS.items():
    save(svg(f'ตัวละคร/{th}.svg', 760), f'ghosts/{gid}', f'ตัวละคร/{th}.svg', 'original-svg', q=88)

# quiz scenario images (true file -> question mapping; Q1/Q2 filenames are swapped)
SCENES = {1: 'ref 2.png', 2: 'ChatGPT Image Oct 25, 2026, 10_36_21 PM-9 2.png', **{n: f'ref{n}.png' for n in range(3, 11)}}
for n, f in SCENES.items():
    im = op(f'ภาพประกอบquiz1-10/{f}').convert('RGB')
    save(up(im, 2), f'quiz/scene{n:02d}', f'ภาพประกอบquiz1-10/{f}', 'upscaled', q=84)

# cards: (question, letter, display label, filename stem)
CARDS = json.load(open(os.path.join(os.path.dirname(__file__), 'cards.json'), encoding='utf-8'))
for c in CARDS:
    save(svg(f"ไพ่/{c['file']}.svg", 400), f"cards/q{c['q']:02d}-{c['l'].lower()}", f"ไพ่/{c['file']}.svg", 'original-svg', q=86)

# backgrounds: sharp + pre-baked blurred/darkened versions (mockups show blurred bg)
BG = {'intro0': 'เกริ่นนำ1', 'intro1': 'เกริ่นนำ2', 'intro2': 'เกริ่นนำ3', 'intro3': 'เกริ่นนำ4', 'intro4': 'เกริ่นนำ5',
      'intro5': 'เกริ่นนำ6', 'intro6': 'เกริ่นนำ8', 'ready': 'confrim page', 'quiz': 'quiz1-10', 'result': 'result page'}
for slug, th in BG.items():
    im = op(f'backgroundเกริ่นนำกับ quiz-1-10/{th}.png').convert('RGB')
    save(im, f'bg/{slug}', f'backgroundเกริ่นนำกับ quiz-1-10/{th}.png', q=80)
    small = im.resize((im.width // 2, im.height // 2), Image.LANCZOS).filter(ImageFilter.GaussianBlur(9))
    small = ImageEnhance.Brightness(small).enhance(0.62)
    save(small, f'bg/{slug}-blur', f'backgroundเกริ่นนำกับ quiz-1-10/{th}.png (blurred)', 'derived', q=72)
for i in (1, 2, 3):
    save(op(f'background เนื้อเรื่อง/บทที่{i}.png').convert('RGB'), f'lore/chapter{i}', f'background เนื้อเรื่อง/บทที่{i}.png', q=80)

json.dump(manifest, open(os.path.join(OUT, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(manifest), 'assets')

# ---- v3: result box parts, transparent group art (SVG), donate QR ----
man2 = json.load(open(os.path.join(OUT, 'manifest.json'), encoding='utf-8'))
manifest.clear(); manifest.update(man2)
RB = 'กล่องแสดงผลัพธ์'
save(svg(f'{RB}/image 49.svg', 1100), 'home/group', f'{RB}/image 49.svg', 'original-svg', q=88)
fr = op(f'{RB}/Group 24.png').convert('RGBA'); fr.thumbnail((520, 700), Image.LANCZOS)
save(fr, 'result/trait-frame', f'{RB}/Group 24.png', q=88)
for name, slug, w in [('03_muscle_icon 1', 'icon-strength', 96), ('04_ghost_icon 1', 'icon-weak', 96), ('04_broken_heart_icon 1', 'icon-love', 96),
                      ('06_clinking_glasses_hands 1', 'prop-glasses', 420), ('16_spicy_cooking_pot 1', 'prop-pot', 420), ('05_spilled_bowl_chilies 1', 'prop-bowl', 420)]:
    im = op(f'{RB}/{name}.png').convert('RGBA'); im.thumbnail((w, w * 2), Image.LANCZOS)
    save(im, f'result/{slug}', f'{RB}/{name}.png', q=88)
QR = sys.argv[2] if len(sys.argv) > 2 else None
if QR and os.path.exists(QR):
    q = Image.open(QR).convert('RGB'); q.thumbnail((720, 1000), Image.LANCZOS)
    save(q, 'donate/qr', 'donate QR (supplied in chat)', q=92)
json.dump(manifest, open(os.path.join(OUT, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('v3 assets ok')
