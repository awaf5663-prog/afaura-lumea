/**
 * LE CATALOGUE.
 *
 *  `images` ne contient que des ADRESSES — c'est tout l'intérêt du
 *  déménagement. La liste entière voyage donc à chaque lecture, sans
 *  qu'on ait besoin d'aperçus, de compteurs ni de rattrapages : quelques
 *  dizaines d'octets par fiche au lieu d'un mégaoctet.
 */
import type { Env } from './index';
import { bit, entier, exige, lireJson, maintenant, texte } from './outils';

const CHAMPS_JSON = ['images', 'variants', 'option_prices', 'measurements'] as const;

/** Une ligne de la base vers ce que le site attend : JSON lu, booléens rendus. */
function versFiche(ligne: Record<string, unknown>) {
  const fiche: Record<string, unknown> = { ...ligne };
  for (const champ of CHAMPS_JSON) {
    fiche[champ] = lireJson(ligne[champ], champ === 'option_prices' ? {} : []);
  }
  for (const champ of ['is_new', 'is_popular', 'other_colors_available', 'ready_to_ship']) {
    fiche[champ] = ligne[champ] === 1;
  }
  return fiche;
}

export async function listProducts(_corps: Record<string, unknown>, env: Env) {
  const lignes = await env.DB
    .prepare('select * from products order by created_at desc')
    .all<Record<string, unknown>>();
  return lignes.results.map(versFiche);
}

export async function getProductImages(corps: Record<string, unknown>, env: Env) {
  const id = texte(corps.productId, 80);
  const ligne = await env.DB.prepare('select images from products where id = ?1').bind(id).first();
  return lireJson<string[]>(ligne?.images, []);
}

const ETATS = new Set(['active', 'draft', 'sold_out']);

export async function saveProduct(corps: Record<string, unknown>, env: Env) {
  const p = (corps.product ?? corps) as Record<string, unknown>;
  const id = texte(p.id, 80);
  exige(id, 'Article sans identifiant.');
  const statut = texte(p.status, 20) || 'active';
  exige(ETATS.has(statut), 'État d\'article inconnu.');

  /*
   * `insert ... on conflict do update` : la même requête crée ou modifie.
   * Deux chemins séparés finiraient par diverger — l'un recevrait un champ
   * nouveau, l'autre non.
   */
  await env.DB.prepare(
    'insert into products (id, slug, name, description, price, compare_at_price, category,' +
    ' images, variants, option_prices, stock, status, is_new, is_popular,' +
    ' other_colors_available, ready_to_ship, color_chart_id, measurements, created_at)' +
    ' values (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19)' +
    ' on conflict (id) do update set' +
    '  slug = excluded.slug, name = excluded.name, description = excluded.description,' +
    '  price = excluded.price, compare_at_price = excluded.compare_at_price,' +
    '  category = excluded.category, images = excluded.images, variants = excluded.variants,' +
    '  option_prices = excluded.option_prices, stock = excluded.stock, status = excluded.status,' +
    '  is_new = excluded.is_new, is_popular = excluded.is_popular,' +
    '  other_colors_available = excluded.other_colors_available,' +
    '  ready_to_ship = excluded.ready_to_ship, color_chart_id = excluded.color_chart_id,' +
    '  measurements = excluded.measurements',
  ).bind(
    id,
    texte(p.slug, 120) || id,
    texte(p.name, 200),
    texte(p.description, 4000),
    entier(p.price, 0, 0),
    p.compare_at_price === null || p.compare_at_price === undefined ? null : entier(p.compare_at_price, 0, 0),
    texte(p.category, 60),
    JSON.stringify(Array.isArray(p.images) ? p.images : []),
    JSON.stringify(Array.isArray(p.variants) ? p.variants : []),
    JSON.stringify(p.option_prices && typeof p.option_prices === 'object' ? p.option_prices : {}),
    p.stock === null || p.stock === undefined ? null : entier(p.stock, 0, 0),
    statut,
    bit(p.is_new), bit(p.is_popular), bit(p.other_colors_available), bit(p.ready_to_ship),
    texte(p.color_chart_id, 60) || null,
    JSON.stringify(Array.isArray(p.measurements) ? p.measurements : []),
    texte(p.created_at, 40) || maintenant(),
  ).run();

  const ligne = await env.DB.prepare('select * from products where id = ?1').bind(id).first<Record<string, unknown>>();
  exige(ligne, 'Article introuvable après enregistrement.', 500);
  return versFiche(ligne!);
}

export async function deleteProduct(corps: Record<string, unknown>, env: Env) {
  const id = texte(corps.id, 80);
  exige(id, 'Article non désigné.');
  await env.DB.prepare('delete from products where id = ?1').bind(id).run();
  return { supprime: id };
}
