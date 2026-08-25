/**
 * Génère public/sitemap.xml avec des URL absolues.
 * L'origine vient de VITE_SITE_URL (fichier .env.local) ; sans elle, on garde
 * des chemins relatifs plutôt que d'inscrire un domaine inventé.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROUTES = [
  { path: '/', priority: '1.0' },
  { path: '/boutique', priority: '0.9' },
  { path: '/shein', priority: '0.9' },
  { path: '/shein/demande', priority: '0.8' },
  { path: '/comment-ca-marche', priority: '0.7' },
  { path: '/suivi', priority: '0.6' },
  { path: '/faq', priority: '0.6' },
];

const origin = (process.env.VITE_SITE_URL ?? '').replace(/\/$/, '');
const today = new Date().toISOString().slice(0, 10);

const body = ROUTES.map(
  (route) =>
    `  <url><loc>${origin}${route.path}</loc><lastmod>${today}</lastmod><priority>${route.priority}</priority></url>`,
).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
writeFileSync(join(root, 'public', 'sitemap.xml'), xml);

const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /commander
Disallow: /confirmation/
Disallow: /shein/confirmation/

Sitemap: ${origin}/sitemap.xml
`;
writeFileSync(join(root, 'public', 'robots.txt'), robots);

console.log(`sitemap.xml et robots.txt générés${origin ? ` pour ${origin}` : ' (chemins relatifs)'}`);
