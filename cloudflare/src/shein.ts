/**
 * LES DEMANDES SHEIN — et leur devis.
 *
 *  Même règle que pour les commandes : la cliente déclare ce qu'elle veut
 *  et le prix qu'elle a vu ; le devis, lui, se calcule ICI, d'après la
 *  tarification réglée dans l'administration.
 *
 *  UN DEVIS PEUT ÊTRE PARTIEL, et c'est volontaire. Tant qu'un taux de
 *  change, une tranche ou une option de livraison manque, le devis le dit
 *  (`isPartial`) au lieu d'afficher un total faussement précis. La
 *  boutique complète ensuite à la main.
 */
import type { Env } from './index';
import type { Attendre } from './methodes';
import { prevenir } from './divers';
import { bit, entier, exige, identifiant, lireJson, maintenant, prochainNumero, texte, vrai } from './outils';

interface Article {
  product_url?: unknown; reference?: unknown; size?: unknown; color?: unknown;
  quantity?: unknown; displayed_price?: unknown; price_amount?: unknown;
  price_currency?: unknown; image?: unknown;
}

interface Offre {
  active?: unknown; scope?: unknown; code?: unknown; label?: unknown;
  studentOnly?: unknown; startsAt?: unknown; endsAt?: unknown;
  groupingIds?: unknown; deliveryOptionIds?: unknown; minSubtotal?: unknown;
  effect?: { type?: unknown };
}

export async function createSheinRequest(
  corps: Record<string, unknown>,
  env: Env,
  _boutique: boolean,
  attendre?: Attendre,
) {
  const articles = Array.isArray(corps.items) ? (corps.items as Article[]) : [];
  exige(articles.length > 0, 'Aucun article dans la demande.');
  exige(articles.length <= 60, 'Demande trop longue.');

  const optionLivraison = texte(corps.delivery_option_id, 60);
  const code = texte(corps.promo_code, 40).toUpperCase();
  const etudiante = Boolean(corps.is_student);

  const reglages = await env.DB
    .prepare('select pricing, promotions from settings where id = 1')
    .first<{ pricing: string; promotions: string }>();
  exige(reglages, 'Réglages introuvables.', 500);
  const tarification = lireJson<Record<string, unknown>>(reglages!.pricing, {});
  const offres = lireJson<Offre[]>(reglages!.promotions, []);

  // ── Les articles ─────────────────────────────────────────────────────
  const taux = lireJson<Record<string, unknown>>(
    JSON.stringify(tarification.conversionRates ?? {}), {});
  let nombre = 0;
  let sousTotal = 0;
  let sousTotalConnu = true;

  for (const a of articles) {
    const q = entier(a.quantity, 1, 1, 99);
    nombre += q;
    if (a.price_amount === null || a.price_amount === undefined) {
      sousTotalConnu = false;
      continue;
    }
    const devise = texte(a.price_currency, 10) || 'XOF';
    const t = taux[devise];
    if (typeof t !== 'number' || !Number.isFinite(t)) {
      sousTotalConnu = false;
      continue;
    }
    sousTotal += Number(a.price_amount) * t * q;
  }

  // ── Frais de traitement ──────────────────────────────────────────────
  let frais: number | null = null;
  for (const tr of (Array.isArray(tarification.tiers) ? tarification.tiers : []) as Array<Record<string, unknown>>) {
    const min = entier(tr?.minItems, 1);
    const max = tr?.maxItems;
    if (nombre < min) continue;
    if (typeof max === 'number' && nombre > max) continue;
    if (typeof tr?.fee === 'number') { frais = Math.trunc(tr.fee); break; }
  }

  // ── Livraison ────────────────────────────────────────────────────────
  let livraison: number | null = null;
  for (const o of (Array.isArray(tarification.deliveryOptions) ? tarification.deliveryOptions : []) as Array<Record<string, unknown>>) {
    if (texte(o?.id, 60) === optionLivraison && typeof o?.fee === 'number') {
      livraison = Math.trunc(o.fee);
      break;
    }
  }

  /*
   * Rattachement au premier groupage ouvert qui a encore de la place.
   * Choisi AVANT le devis : une offre peut être réservée à un groupage.
   */
  const groupage = await env.DB.prepare(
    "select id from groupings where status = 'open'" +
    ' and reserved_count + manual_order_count < max_orders' +
    ' order by case when closing_date is null then 1 else 0 end, closing_date limit 1',
  ).first<{ id: string }>();

  // ── Les offres ───────────────────────────────────────────────────────
  const aujourdhui = new Date().toISOString().slice(0, 10);
  let livraisonAvant: number | null = null;
  let libelleOffre: string | null = null;

  if (livraison !== null && livraison > 0) {
    for (const offre of offres) {
      if (!offre?.active) continue;
      const portee = typeof offre.scope === 'string' ? offre.scope : 'all';
      if (portee !== 'all' && portee !== 'shein') continue;
      if (offre.studentOnly && !etudiante) continue;
      if (typeof offre.startsAt === 'string' && aujourdhui < offre.startsAt) continue;
      if (typeof offre.endsAt === 'string' && aujourdhui > offre.endsAt) continue;
      const groupages = Array.isArray(offre.groupingIds) ? offre.groupingIds : [];
      if (groupages.length > 0 && (!groupage || !groupages.includes(groupage.id))) continue;
      const options = Array.isArray(offre.deliveryOptionIds) ? offre.deliveryOptionIds : [];
      if (options.length > 0 && !options.includes(optionLivraison)) continue;
      /* Tant que le sous-total n'est pas chiffré, une offre à seuil ne
         s'applique pas : mieux vaut l'annoncer plus tard que promettre une
         remise qu'il faudra retirer. */
      if (typeof offre.minSubtotal === 'number' && (!sousTotalConnu || sousTotal < offre.minSubtotal)) continue;
      if (texte(offre.code, 40).toUpperCase() !== code) continue;
      if (offre.effect?.type !== 'free_delivery') continue;

      livraisonAvant = livraison;
      livraison = 0;
      libelleOffre = texte(offre.label, 120) || null;
      break;
    }
  }

  const devis = {
    itemCount: nombre,
    itemsSubtotal: sousTotalConnu ? Math.round(sousTotal) : null,
    serviceFee: frais,
    deliveryOptionId: optionLivraison,
    deliveryFee: livraison,
    deliveryFeeBeforePromotion: livraisonAvant,
    promotionLabel: libelleOffre,
    total: (sousTotalConnu ? Math.round(sousTotal) : 0) + (frais ?? 0) + (livraison ?? 0),
    isPartial: !(sousTotalConnu && frais !== null && livraison !== null),
    strategy: typeof tarification.strategy === 'string' ? tarification.strategy : null,
    computedAt: maintenant(),
  };

  const id = identifiant();
  /*
   * « SHEIN », et non « SHE ».
   *
   * Postgres écrivait 'SHEIN-' || l'année || le numéro (voir la fonction
   * create_shein_request de supabase/schema.sql). Le port avait raccourci
   * en « SHE » — sans raison, juste en recopiant de mémoire. Les demandes
   * déjà passées portent donc SHEIN-2026-00005, et la suivante serait
   * sortie en SHE-2026-00006 : deux formats de numéro dans le même
   * carnet, et une cliente qui cherche sa demande avec le numéro qu'on
   * lui a donné.
   *
   * Trouvé en regardant les vraies données de la boutique, pas le code.
   */
  const numero = await prochainNumero(env.DB, 'shein', 'SHEIN');
  const quand = maintenant();

  await env.DB.batch([
    env.DB.prepare(
      'insert into shein_requests (id, request_number, customer_name, phone, note,' +
      ' grouping_id, delivery_option_id, is_student, promo_code, quote, created_at, updated_at)' +
      ' values (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?11)',
    ).bind(
      id, numero, texte(corps.customer_name, 120), texte(corps.phone, 40),
      texte(corps.note, 600) || null, groupage?.id ?? null, optionLivraison,
      bit(etudiante), code, JSON.stringify(devis), quand,
    ),
    ...articles.map((a) =>
      env.DB.prepare(
        'insert into shein_items (id, request_id, product_url, reference, size, color,' +
        ' quantity, displayed_price, price_amount, price_currency, image)' +
        ' values (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11)',
      ).bind(
        identifiant(), id, texte(a.product_url, 600), texte(a.reference, 120),
        texte(a.size, 40), texte(a.color, 60), entier(a.quantity, 1, 1, 99),
        texte(a.displayed_price, 60),
        a.price_amount === null || a.price_amount === undefined ? null : Number(a.price_amount),
        texte(a.price_currency, 10) || 'XOF',
        texte(a.image, 600) || null,
      ),
    ),
  ]);

  const demande = await uneDemande(id, env);

  // Même règle que pour une commande : voir createOrder.
  const alerte = prevenir(env, 'shein', demande as Record<string, unknown>);
  if (attendre) attendre(alerte);
  else await alerte;

  return demande;
}

async function uneDemande(id: string, env: Env) {
  const demande = await env.DB.prepare('select * from shein_requests where id = ?1').bind(id).first<Record<string, unknown>>();
  exige(demande, 'Demande introuvable.', 404);
  const articles = await env.DB.prepare('select * from shein_items where request_id = ?1').bind(id).all();
  return {
    ...demande,
    is_student: vrai(demande!.is_student),
    quote: lireJson(demande!.quote, null),
    shein_items: articles.results,
  };
}

export async function findSheinRequest(corps: Record<string, unknown>, env: Env) {
  const numero = texte(corps.requestNumber, 40);
  const telephone = texte(corps.phone, 40).replace(/\D/g, '');
  if (!numero || telephone.length < 6) return null;
  const ligne = await env.DB.prepare(
    'select id from shein_requests where request_number = ?1' +
    "   and replace(replace(replace(phone,' ',''),'+',''),'-','') like ?2" +
    '   and deleted_at is null',
  ).bind(numero, `%${telephone}`).first<{ id: string }>();
  return ligne ? uneDemande(ligne.id, env) : null;
}

export async function listSheinRequests(_corps: Record<string, unknown>, env: Env) {
  const demandes = await env.DB
    .prepare('select * from shein_requests order by created_at desc limit 500')
    .all<Record<string, unknown>>();
  const articles = await env.DB.prepare('select * from shein_items').all<{ request_id: string }>();
  const parDemande = new Map<string, unknown[]>();
  for (const a of articles.results) {
    const liste = parDemande.get(a.request_id) ?? [];
    liste.push(a);
    parDemande.set(a.request_id, liste);
  }
  return demandes.results.map((d) => ({
    ...d,
    is_student: vrai(d.is_student),
    quote: lireJson(d.quote, null),
    shein_items: parDemande.get(String(d.id)) ?? [],
  }));
}

const ETATS = new Set([
  'received', 'quoted', 'payment_confirmed', 'grouped', 'in_transit',
  'arrived', 'ready', 'delivered', 'cancelled',
]);

export async function updateSheinRequest(corps: Record<string, unknown>, env: Env) {
  const id = texte(corps.id, 80);
  exige(id, 'Demande non désignée.');
  const champs: string[] = [];
  const valeurs: unknown[] = [];

  if (typeof corps.status === 'string') {
    exige(ETATS.has(corps.status), 'État de demande inconnu.');
    champs.push(`status = ?${champs.length + 2}`);
    valeurs.push(corps.status);
  }
  if (corps.quoted_total !== undefined) {
    champs.push(`quoted_total = ?${champs.length + 2}`);
    valeurs.push(corps.quoted_total === null ? null : entier(corps.quoted_total, 0, 0));
  }
  if (corps.grouping_id !== undefined) {
    champs.push(`grouping_id = ?${champs.length + 2}`);
    valeurs.push(texte(corps.grouping_id, 80) || null);
  }
  if (typeof corps.note === 'string') {
    champs.push(`note = ?${champs.length + 2}`);
    valeurs.push(texte(corps.note, 600));
  }
  exige(champs.length > 0, 'Rien à modifier.');
  champs.push(`updated_at = ?${champs.length + 2}`);
  valeurs.push(maintenant());

  await env.DB.prepare(`update shein_requests set ${champs.join(', ')} where id = ?1`)
    .bind(id, ...valeurs).run();
  return uneDemande(id, env);
}

export async function updateSheinTrash(corps: Record<string, unknown>, env: Env) {
  const ids = (Array.isArray(corps.ids) ? corps.ids : []).map((x) => texte(x, 80)).filter(Boolean);
  exige(ids.length > 0, 'Aucune demande désignée.');
  const quand = corps.trashed ? maintenant() : null;
  await env.DB.batch(ids.map((id) =>
    env.DB.prepare('update shein_requests set deleted_at = ?2, updated_at = ?3 where id = ?1')
      .bind(id, quand, maintenant())));
  return { modifiees: ids.length };
}

export async function deleteSheinRequests(corps: Record<string, unknown>, env: Env) {
  const ids = (Array.isArray(corps.ids) ? corps.ids : []).map((x) => texte(x, 80)).filter(Boolean);
  exige(ids.length > 0, 'Aucune demande désignée.');
  await env.DB.batch([
    ...ids.map((id) => env.DB.prepare('delete from shein_items where request_id = ?1').bind(id)),
    ...ids.map((id) => env.DB.prepare('delete from shein_requests where id = ?1').bind(id)),
  ]);
  return { supprimees: ids.length };
}
