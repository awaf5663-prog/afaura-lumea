/**
 * Génère les deux catalogues de départ à partir de src/data/seed.ts :
 *
 *   supabase/seed-catalogue.sql    (Postgres)
 *   cloudflare/seed-catalogue.sql  (SQLite / D1)
 *
 * Le catalogue vit dans le code : au moment de basculer sur une base, celle-ci
 * est vide et la boutique se retrouverait sans un seul article. Ce script
 * produit les INSERT correspondants, pour que le passage ne perde rien.
 *
 * UN SEUL SCRIPT POUR LES DEUX BASES, et c'est le point important. Deux
 * générateurs finiraient par diverger — un article ajouté d'un côté, oublié de
 * l'autre — et personne ne s'en apercevrait avant que la boutique ne trouve un
 * catalogue incomplet. Ici les deux fichiers sortent de la même boucle, sur la
 * même liste. Seule la façon d'écrire diffère : Postgres veut `true` et
 * `::jsonb`, SQLite veut 1 et du texte.
 *
 * Les photos ne sont PAS insérées : ce sont des fichiers du site, dont l'URL
 * change à chaque build. La colonne reste vide, et l'application retombe sur
 * les images livrées avec le site tant que la boutique n'a pas téléversé les
 * siennes depuis l'admin.
 */
import { build } from 'esbuild';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');

/** Les imports d'images sont remplacés par leur nom de fichier : on ne veut
 *  pas embarquer des mégaoctets de webp pour lire trois champs texte. */
const stubImages = {
  name: 'stub-images',
  setup(b) {
    b.onResolve({ filter: /\.(webp|png|jpe?g|svg)$/ }, (args) => ({
      path: args.path,
      namespace: 'stub',
    }));
    b.onLoad({ filter: /.*/, namespace: 'stub' }, (args) => ({
      contents: `export default ${JSON.stringify(path.basename(args.path))};`,
      loader: 'js',
    }));
  },
};

const dir = await mkdtemp(path.join(tmpdir(), 'lumea-seed-'));
const outfile = path.join(dir, 'seed.mjs');

await build({
  entryPoints: [path.join(root, 'src/data/seed.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile,
  plugins: [stubImages],
  alias: { '@': root },
  logLevel: 'error',
});

const { SEED_PRODUCTS, CATEGORIES } = await import(pathToFileURL(outfile).href);

/** Échappement SQL : une apostrophe se double, rien d'autre à faire. */
const q = (value) => `'${String(value).replace(/'/g, "''")}'`;
const num = (value) => (value === null || value === undefined ? 'null' : String(value));

/**
 * Ce qui change d'une base à l'autre, et RIEN D'AUTRE.
 *
 * Tout le reste — quelles colonnes, dans quel ordre, quels articles — est
 * commun. Une colonne ajoutée ici l'est pour les deux bases d'un coup.
 */
const DIALECTES = {
  postgres: {
    fichier: 'supabase/seed-catalogue.sql',
    base: 'Supabase',
    json: (v) => `${q(JSON.stringify(v))}::jsonb`,
    bool: (v) => String(Boolean(v)),
    mode: [
      "--  À exécuter APRÈS schema.sql, dans le SQL editor du projet Supabase.",
    ],
  },
  sqlite: {
    fichier: 'cloudflare/seed-catalogue.sql',
    base: 'Cloudflare D1',
    // SQLite n'a pas de type JSON : c'est du texte, que le schéma vérifie
    // avec json_valid(). Voir cloudflare/schema.sql.
    json: (v) => q(JSON.stringify(v)),
    // SQLite n'a pas de booléen non plus : 0 ou 1, contraints par le schéma.
    bool: (v) => (v ? '1' : '0'),
    mode: [
      "--  Appliqué par le workflow « Cloudflare — mise en place », après",
      '--  schema.sql. Rien à taper à la main.',
    ],
  },
};

for (const d of Object.values(DIALECTES)) {
  const lines = [
    '-- ═══════════════════════════════════════════════════════════════════',
    `--  Catalogue Afaura Luméa — ${d.base}`,
    '--',
    '--  Généré par scripts/generate-seed.mjs — ne pas modifier à la main :',
    '--  relancer le script après avoir changé src/data/seed.ts.',
    '--',
    ...d.mode,
    '--  Réexécutable sans risque : les articles déjà présents sont mis à jour,',
    "--  et les photos déjà téléversées depuis l'admin ne sont jamais écrasées.",
    '-- ═══════════════════════════════════════════════════════════════════',
    '',
    `-- Catégories du catalogue : ${CATEGORIES.map((c) => c.name).join(', ')}`,
    '',
  ];

  for (const p of SEED_PRODUCTS) {
    lines.push(
      'insert into products (',
      '  id, slug, name, description, price, compare_at_price, category,',
      '  images, variants, option_prices, stock, status, is_new, is_popular,',
      '  other_colors_available, ready_to_ship, color_chart_id, measurements',
      ') values (',
      `  ${q(p.id)}, ${q(p.slug)}, ${q(p.name)}, ${q(p.description)},`,
      `  ${p.price}, ${num(p.compareAtPrice)}, ${q(p.category)},`,
      `  ${d.json([])}, ${d.json(p.variants ?? [])}, ${d.json(p.optionPrices ?? {})},`,
      `  ${num(p.stock)}, ${q(p.status)},`,
      `  ${d.bool(p.isNew)}, ${d.bool(p.isPopular)},`,
      `  ${d.bool(p.otherColorsAvailable)}, ${d.bool(p.readyToShip)},`,
      `  ${p.colorChartId ? q(p.colorChartId) : 'null'}, ${d.json(p.measurements ?? [])}`,
      ')',
      'on conflict (id) do update set',
      '  slug = excluded.slug,',
      '  name = excluded.name,',
      '  description = excluded.description,',
      '  price = excluded.price,',
      '  compare_at_price = excluded.compare_at_price,',
      '  category = excluded.category,',
      '  variants = excluded.variants,',
      '  option_prices = excluded.option_prices,',
      '  status = excluded.status,',
      '  other_colors_available = excluded.other_colors_available,',
      '  ready_to_ship = excluded.ready_to_ship,',
      '  color_chart_id = excluded.color_chart_id,',
      '  measurements = excluded.measurements;',
      '',
    );
  }

  await writeFile(path.join(root, d.fichier), lines.join('\n'), 'utf8');
  console.log(`${d.fichier} écrit — ${SEED_PRODUCTS.length} articles`);
}

await rm(dir, { recursive: true, force: true });
