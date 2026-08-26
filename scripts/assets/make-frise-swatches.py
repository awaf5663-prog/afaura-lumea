"""
Génère les 36 pastilles « jersey frisé ».

Le RELIEF (les volants) est extrait d'une vraie photo du produit envoyée
par la boutique : on en garde uniquement la carte de luminance, qui est
ensuite teintée avec chacune des 36 teintes relevées sur le nuancier du
fournisseur. Le motif frisé est donc réel ; la teinte, elle, est un rendu
indicatif — c'est exactement ce que dit la mention affichée sous le
nuancier.
"""
import os
from PIL import Image, ImageDraw, ImageFilter

SRC = '/root/.claude/uploads/34d8251c-a2b7-5736-b563-6e486bd173e8/1eb5d46d-image.png'
BOX = (520, 840, 700, 1020)          # bande de volants, tissu uniquement
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'assets', 'swatches')
SIZE = 132
SS = 4                               # suréchantillonnage pour un bord net

HEXES = """181818 edecf0 ebe2d5 dfcebf c4a089 b48261 9a6543 835036 886551
603b2b 492c22 37221b b4b7bd 616162 a7a7af 8faacf 6a7d9d 13213c
abcfc5 9cc5b9 636044 57553d 1f3c2e 173c34 eabcbc e2a7ae c3838b
b07f8b a05691 6a2449 9f8ac4 c28bd3 efb8b1 e16e73 9d2332 50161c""".split()
assert len(HEXES) == 36

# ── carte de relief ───────────────────────────────────────────────────
relief = (Image.open(SRC).convert('RGB').crop(BOX)
          .resize((SIZE, SIZE), Image.LANCZOS)
          .convert('L')
          .filter(ImageFilter.GaussianBlur(0.4)))
px = list(relief.getdata())
lo, hi = sorted(px)[len(px) // 50], sorted(px)[-len(px) // 50]
span = max(hi - lo, 1)
rel = [min(1.0, max(0.0, (v - lo) / span)) for v in px]
mean = sum(rel) / len(rel)

# ── masque circulaire anticrénelé ─────────────────────────────────────
mask = Image.new('L', (SIZE * SS, SIZE * SS), 0)
ImageDraw.Draw(mask).ellipse((0, 0, SIZE * SS - 1, SIZE * SS - 1), fill=255)
mask = mask.resize((SIZE, SIZE), Image.LANCZOS)

GAIN, LIFT = 0.92, 52.0
COMPRESS = 0.72                      # garde la pastille proche de la teinte du nuancier

for i, h in enumerate(HEXES, start=1):
    base = tuple(int(h[j:j + 2], 16) for j in (0, 2, 4))
    data = []
    for r in rel:
        d = (r - mean) * COMPRESS
        data.append(tuple(
            min(255, max(0, int(round(c * (1 + GAIN * d) + d * LIFT))))
            for c in base
        ))
    img = Image.new('RGB', (SIZE, SIZE))
    img.putdata(data)
    img.putalpha(mask)
    img.save(os.path.join(OUT, 'frise-%02d.webp' % i), 'WEBP', quality=88, method=6)

print('36 pastilles frisé générées dans src/assets/swatches/')
