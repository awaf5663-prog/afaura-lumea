/**
 * ═══════════════════════════════════════════════════════════════════════
 *  REPRENDRE LES DONNÉES DE SUPABASE
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  Le catalogue vient du code (voir generate-seed.mjs). Ce qui ne vient
 *  PAS du code, et qui ne se retrouve nulle part ailleurs, ce sont les
 *  commandes déjà passées, les demandes SHEIN, les groupages et les
 *  réglages de la boutique. Ce script les transporte.
 *
 *  ENTRÉE : un dossier de fichiers .json exportés depuis Supabase, un par
 *  table. Voir cloudflare/MISE-EN-ROUTE.md pour la requête à coller.
 *
 *  SORTIE : cloudflare/reprise.sql, à appliquer sur la base D1.
 *
 *  Usage :
 *    node scripts/reprendre-supabase.mjs <dossier> [sortie.sql]
 *
 *  CE QU'IL NE FAIT PAS, ET POURQUOI :
 *
 *  Il n'écrit pas dans la base. Il produit un fichier qu'on peut lire
 *  avant de l'appliquer. Un script qui écrit directement dans une base de
 *  commandes demande qu'on lui fasse confiance sans avoir rien vu.
 *
 *  Il ne touche pas aux articles : le catalogue a sa propre source, et
 *  deux sources pour la même chose finissent par se contredire.
 */
import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const dossier = process.argv[2];
if (!dossier) {
  console.error('Usage : node scripts/reprendre-supabase.mjs <dossier> [sortie.sql]');
  process.exit(1);
}
const racine = path.resolve(import.meta.dirname, '..');
const sortie = process.argv[3] ?? path.join(racine, 'cloudflare/reprise.sql');

/**
 * Les colonnes de chaque table, lues DANS LE SCHÉMA et non recopiées ici.
 *
 * Une liste recopiée serait juste le jour où on l'écrit, et fausse à la
 * première colonne ajoutée — sans que rien ne le signale, parce qu'un
 * INSERT qui oublie une colonne réussit.
 */
async function colonnesDuSchema() {
  const sql = await readFile(path.join(racine, 'cloudflare/schema.sql'), 'utf8');
  const tables = {};
  for (const bloc of sql.matchAll(/create table if not exists (\w+) \(([\s\S]*?)\n\);/g)) {
    const [, nom, corps] = bloc;
    const colonnes = [];
    for (const ligne of corps.split('\n')) {
      const propre = ligne.replace(/--.*$/, '').trim();
      const m = /^([a-z_]+)\s+(text|integer|real)\b/.exec(propre);
      if (m) colonnes.push({ nom: m[1], type: m[2] });
    }
    /*
     * Les valeurs autorisées, lues elles aussi dans le schéma.
     *
     * D1 refuse un fichier ENTIER dès la première ligne qui sort de la
     * liste, avec un message qui ne dit ni quelle table ni quelle ligne.
     * Les vérifier ici permet de dire lesquelles, dans les mots de la
     * boutique, AVANT qu'elle ne lance quoi que ce soit.
     */
    const corpsSansCommentaires = corps.replace(/--.*$/gm, '');
    for (const c of corpsSansCommentaires.matchAll(/check \((\w+) in \(([^)]*)\)\)/g)) {
      const colonne = colonnes.find((x) => x.nom === c[1]);
      if (!colonne) continue;
      const valeurs = [...c[2].matchAll(/'([^']*)'/g)].map((m) => m[1]);
      if (valeurs.length) colonne.autorisees = valeurs;
    }
    tables[nom] = colonnes;
  }
  return tables;
}

/**
 * Une valeur Postgres vers une valeur SQLite.
 *
 * Les quatre conversions du déménagement, en un seul endroit :
 *   booléen   → 0 ou 1          (SQLite n'a pas de booléen)
 *   jsonb     → texte           (ni de type JSON ; le schéma vérifie
 *                                json_valid())
 *   timestamp → texte ISO       (ni de type date)
 *   null      → null            (le seul qui ne change pas)
 */
function valeur(brut, type) {
  if (brut === null || brut === undefined) return 'null';

  if (type === 'integer') {
    if (typeof brut === 'boolean') return brut ? '1' : '0';
    const n = Number(brut);
    return Number.isFinite(n) ? String(Math.trunc(n)) : 'null';
  }
  if (type === 'real') {
    const n = Number(brut);
    return Number.isFinite(n) ? String(n) : 'null';
  }

  // text : du JSON reste du JSON, une date devient une chaîne ISO.
  if (typeof brut === 'object') return citer(JSON.stringify(brut));
  if (typeof brut === 'boolean') return brut ? "'1'" : "'0'";
  return citer(String(brut));
}

/** Échappement SQL : une apostrophe se double, rien d'autre à faire. */
const citer = (s) => `'${s.replace(/'/g, "''")}'`;

/**
 * L'ORDRE DES TABLES COMPTE.
 *
 * Les lignes d'une commande renvoient à la commande, une demande SHEIN à
 * son groupage. Insérer l'enfant avant le parent fait échouer la clé
 * étrangère — et la moitié des données resterait dehors.
 */
const ORDRE = [
  'groupings',
  'orders',
  'order_items',
  'shein_requests',
  'shein_items',
  'settings',
  'alert_settings',
  'visits',
];

const tables = await colonnesDuSchema();
const fichiers = await readdir(dossier);
const lignes = [
  '-- ═══════════════════════════════════════════════════════════════════',
  '--  Reprise des données Supabase → Cloudflare D1',
  '--',
  `--  Produit le ${new Date().toISOString().slice(0, 10)} par`,
  '--  scripts/reprendre-supabase.mjs. À appliquer APRÈS schema.sql.',
  '--',
  '--  Réexécutable : chaque ligne remplace la sienne si elle existe déjà',
  '--  (insert or replace). Une reprise interrompue se relance donc sans',
  '--  produire de doublon.',
  '-- ═══════════════════════════════════════════════════════════════════',
  '',
];

const compte = {};
const refus = [];

for (const table of ORDRE) {
  const fichier = fichiers.find((f) => f === `${table}.json`);
  if (!fichier) {
    console.log(`  ·  ${table} : aucun fichier, table ignorée`);
    continue;
  }
  const colonnes = tables[table];
  if (!colonnes) {
    console.log(`  !  ${table} : absente du schéma D1, ignorée`);
    continue;
  }

  const brut = JSON.parse(await readFile(path.join(dossier, fichier), 'utf8'));
  /* Supabase rend soit un tableau, soit {rows:[…]} selon l'export. */
  const donnees = Array.isArray(brut) ? brut : (brut.rows ?? brut.data ?? []);
  if (!donnees.length) {
    console.log(`  ·  ${table} : vide`);
    continue;
  }

  /*
   * ON NE PREND QUE LES COLONNES QUE D1 CONNAÎT. Postgres en portait que
   * SQLite n'a pas — les aperçus d'images, le compteur de photos — et les
   * envoyer ferait échouer l'insertion entière. On les laisse, sans
   * bruit : c'est une décision du déménagement, pas un accident.
   */
  /* Toutes les lignes, pas seulement la première : un export peut très
     bien omettre un champ nul sur la première ligne et le porter sur la
     dixième, et l'avertissement serait alors incomplet — donc trompeur. */
  const inconnues = new Set();
  for (const d of donnees) {
    for (const cle of Object.keys(d)) {
      if (!colonnes.some((c) => c.nom === cle)) inconnues.add(cle);
    }
  }
  if (inconnues.size) {
    lignes.push(`-- ${table} : colonnes laissées de côté — ${[...inconnues].join(', ')}`);
  }

  /*
   * LES VALEURS HORS LISTE SE DISENT ICI, PAS DANS D1.
   *
   * D1 rejette le fichier entier à la première ligne fautive, en nommant
   * la contrainte et rien d'autre : ni la table, ni la ligne. On n'écrit
   * donc pas un fichier dont on sait déjà qu'il sera refusé — on dit
   * lesquelles, et on s'arrête.
   */
  for (const d of donnees) {
    for (const c of colonnes) {
      if (!c.autorisees || !(c.nom in d)) continue;
      const v = d[c.nom];
      if (v === null || v === undefined) continue;
      if (!c.autorisees.includes(String(v))) {
        refus.push(
          `${table} · ${d.id ?? '(sans identifiant)'} · ${c.nom} = « ${v} »` +
          ` — attendu : ${c.autorisees.join(', ')}`,
        );
      }
    }
  }

  lignes.push(`-- ── ${table} : ${donnees.length} ligne(s) ──`);
  for (const d of donnees) {
    const noms = colonnes.filter((c) => c.nom in d);
    if (!noms.length) continue;
    lignes.push(
      `insert or replace into ${table} (${noms.map((c) => c.nom).join(', ')}) values (` +
      noms.map((c) => valeur(d[c.nom], c.type)).join(', ') +
      ');',
    );
  }
  lignes.push('');
  compte[table] = donnees.length;
  console.log(`  ✓  ${table} : ${donnees.length} ligne(s)`);
}

if (refus.length) {
  console.error('\nRIEN N\'A ÉTÉ ÉCRIT. Des valeurs ne sont pas reconnues :\n');
  for (const r of refus) console.error(`  · ${r}`);
  console.error(
    '\nD1 refuserait le fichier entier à cause de ces lignes, sans dire lesquelles.' +
    '\nCorrigez-les dans l\'export, puis relancez.',
  );
  process.exit(1);
}

/**
 * LES COMPTEURS REPRENNENT LÀ OÙ POSTGRES S'ÉTAIT ARRÊTÉ.
 *
 * Sans cela la première commande chez Cloudflare s'appellerait CMD-…-00001
 * — un numéro DÉJÀ DONNÉ à une cliente. Deux commandes différentes
 * porteraient le même numéro, et le suivi rendrait l'autre. C'est la
 * seule partie de cette reprise qui ne se voit pas dans les données, et
 * c'est la plus facile à oublier.
 */
const { readFileSync } = await import('node:fs');

function plusGrandNumero(table, champ) {
  try {
    const brut = JSON.parse(readFileSync(path.join(dossier, `${table}.json`), 'utf8'));
    const donnees = Array.isArray(brut) ? brut : (brut.rows ?? []);
    return donnees.reduce((max, d) => {
      const n = Number(String(d[champ] ?? '').split('-').pop());
      return Number.isFinite(n) ? Math.max(max, n) : max;
    }, 0);
  } catch {
    return 0;
  }
}

const dernierCommande = plusGrandNumero('orders', 'order_number');
const dernierShein = plusGrandNumero('shein_requests', 'request_number');

lignes.push(
  '-- ── Les compteurs reprennent où Postgres s\'était arrêté ──',
  '--',
  '--  Sans cette étape, la première commande chez Cloudflare porterait un',
  '--  numéro DÉJÀ donné à une cliente, et le suivi rendrait l\'autre.',
  `update compteurs set valeur = max(valeur, ${dernierCommande}) where nom = 'commande';`,
  `update compteurs set valeur = max(valeur, ${dernierShein}) where nom = 'shein';`,
  '',
);

await writeFile(sortie, lignes.join('\n'), 'utf8');

console.log(`\nÉcrit : ${path.relative(racine, sortie)}`);
console.log(`Dernier numéro de commande repris : ${dernierCommande || '—'}`);
console.log(`Dernier numéro SHEIN repris       : ${dernierShein || '—'}`);
console.log('\nRelisez le fichier avant de l\'appliquer, puis :');
console.log('  wrangler d1 execute afaura-lumea --remote --file cloudflare/reprise.sql');
