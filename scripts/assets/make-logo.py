"""
Prépare le logo de la boutique à partir du fichier envoyé.

L'original est un carré clair sur fond presque noir. On en tire trois
fichiers, parce qu'un logo clair sur un fond crème serait invisible :

  logo-carre     : l'image d'origine, recadrée — image de partage et icône
  logo-sombre    : les tracés teintés en encre, sur fond transparent
  symbole-sombre : le voile seul, pour les petites tailles

La transparence est déduite de la luminance : le fond est presque noir,
les tracés sont clairs, donc chaque pixel devient d'autant plus opaque
qu'il est lumineux. Aucun détourage à la main, aucun contour inventé.
"""
import os
from PIL import Image

SRC = '/root/.claude/uploads/34d8251c-a2b7-5736-b563-6e486bd173e8/5c6e854e-image.png'
BOX = (0, 681, 1170, 1851)
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'src', 'assets', 'brand')
SIZE = 720
INK = (23, 17, 15)          # --color-ink

src = Image.open(SRC).convert('RGB').crop(BOX).resize((SIZE, SIZE), Image.LANCZOS)
src.save(os.path.join(OUT, 'logo-carre.webp'), 'WEBP', quality=90, method=6)

lum = lambda c: 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
pixels = list(src.getdata())
floor = 18.0                 # luminance du fond
ceiling = max(lum(p) for p in pixels)
span = max(ceiling - floor, 1.0)

sombre = []
for p in pixels:
    a = min(1.0, max(0.0, (lum(p) - floor) / span))
    # Léger seuil bas : sans lui, le bruit du fond laisse un voile gris.
    a = 0.0 if a < 0.06 else a
    alpha = int(round(255 * a))
    # Couleur d'origine « démultipliée » pour rester fidèle une fois composée.
    sombre.append((*INK, alpha))

logo = Image.new('RGBA', (SIZE, SIZE))
logo.putdata(sombre)
# Les marges vides du fichier d'origine sont retirées : sans ça, le logo
# affiché à 100 px de haut n'en occupe qu'une soixantaine, et paraît timide.
trimmed = logo.crop(logo.split()[3].point(lambda v: 255 if v > 6 else 0).getbbox())
trimmed.save(os.path.join(OUT, 'logo-sombre.webp'), 'WEBP', quality=90, method=6)
print('logo détouré :', trimmed.size)


# ── le symbole seul, pour les petites tailles ────────────────────────
# La boîte est mesurée sur l'alpha, jamais recadrée à l'œil.
alpha = logo.split()[3]
box = alpha.crop((0, 0, SIZE, int(SIZE * 0.45))).point(lambda v: 255 if v > 8 else 0).getbbox()
pad = 10
box = (box[0] - pad, box[1] - pad, box[2] + pad, box[3] + pad)
side = max(box[2] - box[0], box[3] - box[1])
cx, cy = (box[0] + box[2]) // 2, (box[1] + box[3]) // 2
square = (cx - side // 2, cy - side // 2, cx + side // 2, cy + side // 2)

logo.crop(square).resize((256, 256), Image.LANCZOS).save(
    os.path.join(OUT, 'symbole-sombre.webp'), 'WEBP', quality=90, method=6
)

print('logo et symbole écrits dans src/assets/brand/')

