/**
 * Génère supabase/seed-catalogue.sql à partir de src/data/seed.ts.
 *
 * Le catalogue vit dans le code : au moment de basculer sur Supabase, la base
 * est vide et la boutique se retrouverait sans un seul article. Ce script
 * produit les INSERT correspondants, pour que le passage ne perde rien.
 *
 * Les photos ne sont PAS insérées : ce sont des fichiers du site, dont l'URL
 * change à chaque build. La colonne reste vide, et l'application retombe sur
 * les images livrées avec le site tant que la boutique n'a pas téléversé les
 * siennes depuis l'admin.
 */
import { build } from 'esbuild';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
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
const json = (value) => `${q(JSON.stringify(value))}::jsonb`;
const num = (value) => (value === null || value === undefined ? 'null' : String(value));

const lines = [
  '-- ═══════════════════════════════════════════════════════════════════',
  '--  Catalogue Afaura Luméa',
  '--',
  '--  Généré par scripts/generate-supabase-seed.mjs — ne pas modifier à la',
  '--  main : relancer le script après avoir changé src/data/seed.ts.',
  '--',
  '--  À exécuter APRÈS schema.sql, dans le SQL editor du projet Supabase.',
  '--  Réexécutable sans risque : les articles déjà présents sont mis à jour,',
  '--  et les photos déjà téléversées depuis l\'admin ne sont jamais écrasées.',
  '-- ═══════════════════════════════════════════════════════════════════',
  '',
  `-- Catégories du catalogue : ${CATEGORIES.map((c) => c.name).join(', ')}`,
  '',
];

for (const p of SEED_PRODUCTS) {
  lines.push(
    'insert into products (',
    '  id, slug, name, description, price, compare_at_price, category,',
    '  images, variants, stock, status, is_new, is_popular,',
    '  other_colors_available, color_chart_id',
    ') values (',
    `  ${q(p.id)}, ${q(p.slug)}, ${q(p.name)}, ${q(p.description)},`,
    `  ${p.price}, ${num(p.compareAtPrice)}, ${q(p.category)},`,
    `  '[]'::jsonb, ${json(p.variants ?? [])}, ${num(p.stock)}, ${q(p.status)},`,
    `  ${Boolean(p.isNew)}, ${Boolean(p.isPopular)},`,
    `  ${Boolean(p.otherColorsAvailable)}, ${p.colorChartId ? q(p.colorChartId) : 'null'}`,
    ')',
    'on conflict (id) do update set',
    '  slug = excluded.slug,',
    '  name = excluded.name,',
    '  description = excluded.description,',
    '  price = excluded.price,',
    '  category = excluded.category,',
    '  variants = excluded.variants,',
    '  status = excluded.status,',
    '  other_colors_available = excluded.other_colors_available,',
    '  color_chart_id = excluded.color_chart_id;',
    '',
  );
}

await writeFile(path.join(root, 'supabase/seed-catalogue.sql'), lines.join('\n'), 'utf8');
await rm(dir, { recursive: true, force: true });
console.log(`seed-catalogue.sql écrit — ${SEED_PRODUCTS.length} articles`);
