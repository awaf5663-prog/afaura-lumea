/**
 * Assemble un aperçu autonome : une seule page HTML contenant le CSS, le JS
 * et les images en data URI. Utile pour partager le site sans hébergement.
 * Le vrai déploiement reste `npm run build` → dossier dist/.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const assets = join(dist, 'assets');

const MIME = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };

let html = readFileSync(join(dist, 'index.html'), 'utf8');
const files = readdirSync(assets);

// 1. Images → data URI
const images = new Map();
for (const file of files) {
  const ext = extname(file);
  if (!MIME[ext]) continue;
  const data = readFileSync(join(assets, file)).toString('base64');
  images.set(file, `data:${MIME[ext]};base64,${data}`);
}

const inlineImages = (source) => {
  let out = source;
  for (const [file, uri] of images) {
    out = out.split(`./assets/${file}`).join(uri).split(`/assets/${file}`).join(uri);
  }
  return out;
};

// 2. CSS et JS inlinés
const cssFile = files.find((f) => f.endsWith('.css'));
const jsFile = files.find((f) => f.endsWith('.js'));
const css = inlineImages(readFileSync(join(assets, cssFile), 'utf8'));
const js = inlineImages(readFileSync(join(assets, jsFile), 'utf8'));

// Remplacement par fonction : une chaîne de remplacement interpréterait les
// séquences $& / $` / $1 présentes dans le JS minifié et corromprait le bundle.
html = html
  .replace(new RegExp(`<link[^>]*href="[^"]*${cssFile}"[^>]*>`), () => `<style>${css}</style>`)
  .replace(
    new RegExp(`<script[^>]*src="[^"]*${jsFile}"[^>]*></script>`),
    () => `<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>`,
  );

// 3. L'aperçu ne doit pas être indexé à la place du vrai site, et navigue au
//    fragment pour rester valable quel que soit le chemin d'hébergement.
html = html.replace(
  '<meta name="robots" content="index,follow" />',
  '<meta name="robots" content="noindex" />\n    <meta name="lumea-router" content="hash" />',
);

// 4. Dans une galerie d'aperçus, le nom de la marque suffit à identifier la page :
//    le titre SEO complet reste celui du site déployé.
html = html.replace(/<title>[^<]*<\/title>/, '<title>Afaura Luméa</title>');

// 5. Le squelette de la page d'artefact fournit déjà <head> et <body>.
const body = html.slice(html.indexOf('<body>') + 6, html.indexOf('</body>'));
const head = html.slice(html.indexOf('<head>') + 6, html.indexOf('</head>'));

const out = join(root, 'preview', 'apercu.html');
writeFileSync(out, head + body);
console.log(`Aperçu écrit : ${out} (${(Buffer.byteLength(head + body) / 1024 / 1024).toFixed(2)} Mo)`);
