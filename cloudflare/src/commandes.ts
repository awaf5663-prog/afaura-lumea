/**
 * ═══════════════════════════════════════════════════════════════════════
 *  LES COMMANDES — et le calcul des montants
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  LA RÈGLE DE CE FICHIER, celle dont tout le reste découle : le
 *  navigateur envoie des CHOIX — quels articles, en quelle quantité, avec
 *  quelles options, vers quelle zone — et JAMAIS un montant. Les prix sont
 *  relus dans la fiche, les frais dans les réglages, les offres dans les
 *  réglages. Un panier bricolé ne peut donc rien obtenir de plus qu'un
 *  panier honnête.
 *
 *  C'est le portage fidèle de la fonction `create_order` de Postgres, y
 *  compris ses bizarreries voulues — expliquées au fil du code.
 */
import type { Env } from './index';
import {
  entier, exige, identifiant, lireJson, maintenant,
  fraisBoutique, prixOption, prochainNumero, texte, vrai,
} from './outils';

interface LigneArticle {
  product_id?: unknown;
  quantity?: unknown;
  options?: unknown;
}

interface FicheProduit {
  id: string;
  name: string;
  price: number;
  status: string;
  stock: number | null;
  category: string;
  ready_to_ship: number;
  option_prices: string;
}

/** Une offre telle que la boutique la règle dans l'administration. */
interface Offre {
  active?: unknown;
  scope?: unknown;
  code?: unknown;
  label?: unknown;
  studentOnly?: unknown;
  startsAt?: unknown;
  endsAt?: unknown;
  deliveryOptionIds?: unknown;
  minSubtotal?: unknown;
  effect?: { type?: unknown; amount?: unknown; categories?: unknown; tiers?: unknown };
}

export async function createOrder(corps: Record<string, unknown>, env: Env) {
  const articles = Array.isArray(corps.items) ? (corps.items as LigneArticle[]) : [];
  exige(articles.length > 0, 'Panier vide.');
  exige(articles.length <= 60, 'Panier trop long.');

  const zone = texte(corps.delivery_zone_id, 60);
  const code = texte(corps.promo_code, 40).toUpperCase();
  const etudiante = Boolean(corps.is_student);

  const reglages = await env.DB
    .prepare('select delivery_fees, promotions, pricing from settings where id = 1')
    .first<{ delivery_fees: string; promotions: string; pricing: string }>();
  exige(reglages, 'Réglages introuvables.', 500);

  const zones = lireJson<Record<string, unknown>>(reglages!.delivery_fees, {});
  const brut = zones[zone];
  /* `null` veut dire « à confirmer », et ce n'est pas la même chose que
     zéro : une zone sans tarif se règle de vive voix. */
  let livraison: number | null = typeof brut === 'number' ? Math.max(0, Math.trunc(brut)) : null;
  let livraisonAvant: number | null = null;

  const offres = lireJson<Offre[]>(reglages!.promotions, []);
  const tarification = lireJson<Record<string, unknown>>(reglages!.pricing, {});
  const tranches = tarification.tiers;
  const rayonsSansFrais = new Set(
    (Array.isArray(tarification.feeExemptCategories) ? tarification.feeExemptCategories : [])
      .filter((x): x is string => typeof x === 'string'),
  );

  /*
   * Rayons de la PREMIÈRE offre par quantité active. On les repère AVANT la
   * boucle : l'assiette de cette offre s'accumule article par article, et
   * reparcourir le panier ensuite serait absurde. Liste vide = tout compte.
   */
  const offreQuantite = offres.find(
    (o) => Boolean(o?.active) && o?.effect?.type === 'percent_by_quantity',
  );
  const rayonsAssiette = Array.isArray(offreQuantite?.effect?.categories)
    ? (offreQuantite!.effect!.categories as unknown[]).filter((x): x is string => typeof x === 'string')
    : null;

  const numero = await prochainNumero(env.DB, 'commande', 'CMD');
  const idCommande = identifiant();

  let sousTotal = 0;
  let nombreArticles = 0;
  let assietteUnites = 0;
  let assietteMontant = 0;
  const lignes: Array<{ id: string; produit: FicheProduit; quantite: number; unitaire: number; options: Record<string, unknown> }> = [];

  for (const ligne of articles) {
    const idProduit = texte(ligne.product_id, 80);
    const fiche = await env.DB
      .prepare(
        'select id, name, price, status, stock, category, ready_to_ship, option_prices' +
        '  from products where id = ?1',
      )
      .bind(idProduit)
      .first<FicheProduit>();
    exige(fiche && fiche.status === 'active', `Article indisponible : ${idProduit}`);

    const quantite = entier(ligne.quantity, 1, 1, 99);
    exige(
      fiche!.stock === null || quantite <= fiche!.stock,
      `Stock insuffisant pour ${fiche!.name}.`,
    );

    const options = (ligne.options && typeof ligne.options === 'object'
      ? ligne.options : {}) as Record<string, unknown>;
    const unitaire = prixOption(
      fiche!.price,
      lireJson<Record<string, Record<string, unknown>>>(fiche!.option_prices, {}),
      options,
    );

    lignes.push({ id: identifiant(), produit: fiche!, quantite, unitaire, options });
    sousTotal += unitaire * quantite;

    /*
     * Les articles se comptent en UNITÉS, pas en lignes : douze voiles font
     * douze articles. Deux exceptions, pour la même raison de fond — le
     * travail n'a pas lieu :
     *   • l'article est DÉJÀ EN BOUTIQUE ;
     *   • son RAYON est dispensé par les réglages.
     * Le rayon et l'état sont relus DANS LA FICHE, jamais reçus du
     * navigateur : c'est ce qui empêche un panier bricolé de réclamer une
     * exemption.
     */
    if (!vrai(fiche!.ready_to_ship) && !rayonsSansFrais.has(fiche!.category)) {
      nombreArticles += quantite;
    }

    if (rayonsAssiette && (rayonsAssiette.length === 0 || rayonsAssiette.includes(fiche!.category))) {
      assietteUnites += quantite;
      assietteMontant += unitaire * quantite;
    }
  }

  const frais = fraisBoutique(nombreArticles, tranches);

  // ── Les offres ───────────────────────────────────────────────────────
  //  Toutes les conditions renseignées doivent être remplies ; une liste
  //  vide ne restreint rien. Vérifiées ICI, jamais d'après le navigateur,
  //  qui ne transmet qu'un code et une déclaration.
  const aujourdhui = new Date().toISOString().slice(0, 10);
  let remise = 0;
  let libelleOffre: string | null = null;

  for (const offre of offres) {
    if (!offre?.active) continue;
    const portee = typeof offre.scope === 'string' ? offre.scope : 'all';
    if (portee !== 'all' && portee !== 'store') continue;
    if (offre.studentOnly && !etudiante) continue;
    if (typeof offre.startsAt === 'string' && aujourdhui < offre.startsAt) continue;
    if (typeof offre.endsAt === 'string' && aujourdhui > offre.endsAt) continue;
    const zonesOffre = Array.isArray(offre.deliveryOptionIds) ? offre.deliveryOptionIds : [];
    if (zonesOffre.length > 0 && !zonesOffre.includes(zone)) continue;
    /* Le seuil porte sur le prix des ARTICLES seuls, jamais sur les frais
       ni la livraison. */
    if (typeof offre.minSubtotal === 'number' && sousTotal < offre.minSubtotal) continue;
    /* Une offre à code ne s'applique jamais toute seule. */
    if (texte(offre.code, 40).toUpperCase() !== code) continue;

    const type = offre.effect?.type;
    const plafond = sousTotal + frais + (livraison ?? 0);

    if (type === 'free_delivery' && livraison !== null && livraison > 0) {
      livraisonAvant = livraison;
      livraison = 0;
      libelleOffre = texte(offre.label, 120) || null;
      break;
    }
    if (type === 'discount_amount') {
      /* Plafonnée au montant connu : une remise ne rend jamais d'argent. */
      remise = Math.min(Math.max(0, entier(offre.effect?.amount, 0)), plafond);
      if (remise > 0) {
        libelleOffre = texte(offre.label, 120) || null;
        break;
      }
    }
    if (type === 'percent_by_quantity') {
      /*
       * « 3 voiles −5 %, 4 à 5 −6 %, 6 et plus −7 ». Le palier retenu est
       * le PLUS ÉLEVÉ dont le seuil est atteint, et non le premier
       * rencontré : sans cette règle, passer de dix à onze voiles ferait
       * monter la facture.
       */
      const paliers = Array.isArray(offre.effect?.tiers) ? offre.effect!.tiers as Array<Record<string, unknown>> : [];
      let pourcent = 0;
      let seuil = -1;
      for (const palier of paliers) {
        const min = entier(palier?.minQuantity, 0);
        const pct = entier(palier?.percent, 0);
        if (min > assietteUnites || pct <= 0) continue;
        if (min > seuil) { seuil = min; pourcent = pct; }
      }
      if (pourcent > 0 && assietteMontant > 0) {
        /* Arrondi à l'entier : le franc CFA n'a pas de centimes. */
        remise = Math.min(Math.round((assietteMontant * pourcent) / 100), plafond);
        if (remise > 0) {
          libelleOffre = texte(offre.label, 120) || null;
          break;
        }
      }
    }
  }

  const total = Math.max(0, sousTotal + frais + (livraison ?? 0) - remise);
  const paiement = texte(corps.payment_method, 40);
  const quand = maintenant();

  /*
   * TOUT PART EN UN SEUL LOT. D1 exécute un `batch` dans une transaction :
   * soit la commande, ses lignes et les stocks passent ensemble, soit rien
   * ne passe. Une commande à moitié écrite — des lignes sans commande, un
   * stock déduit pour rien — serait pire qu'une commande refusée.
   */
  const operations = [
    env.DB.prepare(
      'insert into orders (id, order_number, customer_name, phone, address, city, note,' +
      ' delivery_zone_id, delivery_label, delivery_fee, delivery_fee_before_promotion,' +
      ' subtotal, service_fee, discount, promotion_label, promo_code, total,' +
      ' payment_method, payment_method_label, created_at, updated_at)' +
      ' values (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?14,?15,?16,?17,?18,?19,?20,?20)',
    ).bind(
      idCommande, numero, texte(corps.customer_name, 120), texte(corps.phone, 40),
      texte(corps.address, 300), texte(corps.city, 120), texte(corps.note, 600) || null,
      zone, zone, livraison, livraisonAvant,
      sousTotal, frais, remise, libelleOffre, code, total,
      paiement, paiement, quand,
    ),
    ...lignes.map((l) =>
      env.DB.prepare(
        'insert into order_items (id, order_id, product_id, name, quantity, unit_price, options)' +
        ' values (?1,?2,?3,?4,?5,?6,?7)',
      ).bind(l.id, idCommande, l.produit.id, l.produit.name, l.quantite, l.unitaire, JSON.stringify(l.options)),
    ),
    ...lignes
      .filter((l) => l.produit.stock !== null)
      .map((l) =>
        env.DB.prepare('update products set stock = max(0, stock - ?2) where id = ?1')
          .bind(l.produit.id, l.quantite),
      ),
  ];
  await env.DB.batch(operations);

  return unecommande(idCommande, env);
}

/** Relit une commande entière, ses lignes comprises. */
async function unecommande(id: string, env: Env) {
  const commande = await env.DB.prepare('select * from orders where id = ?1').bind(id).first();
  exige(commande, 'Commande introuvable.', 404);
  const lignes = await env.DB
    .prepare('select * from order_items where order_id = ?1')
    .bind(id)
    .all();
  return { ...commande, items: lignes.results };
}

/**
 * RETROUVER SA COMMANDE — numéro ET téléphone, les deux.
 *
 * Le numéro seul se devine : ils se suivent. Le téléphone seul aussi, pour
 * qui connaît la cliente. Les deux ensemble, non. C'était déjà la règle
 * dans Postgres, et c'est la seule lecture ouverte au public.
 */
export async function findOrder(corps: Record<string, unknown>, env: Env) {
  const numero = texte(corps.orderNumber, 40);
  const telephone = texte(corps.phone, 40).replace(/\D/g, '');
  if (!numero || telephone.length < 6) return null;
  const ligne = await env.DB
    .prepare(
      "select * from orders where order_number = ?1" +
      "   and replace(replace(replace(phone,' ',''),'+',''),'-','') like ?2" +
      '   and deleted_at is null',
    )
    .bind(numero, `%${telephone}`)
    .first<{ id: string }>();
  if (!ligne) return null;
  return unecommande(ligne.id, env);
}

export async function listOrders(_corps: Record<string, unknown>, env: Env) {
  const commandes = await env.DB
    .prepare('select * from orders order by created_at desc limit 500')
    .all<{ id: string }>();
  const lignes = await env.DB.prepare('select * from order_items').all<{ order_id: string }>();
  const parCommande = new Map<string, unknown[]>();
  for (const l of lignes.results) {
    const liste = parCommande.get(l.order_id) ?? [];
    liste.push(l);
    parCommande.set(l.order_id, liste);
  }
  return commandes.results.map((c) => ({ ...c, items: parCommande.get(c.id) ?? [] }));
}

const ETATS_COMMANDE = new Set([
  'received', 'payment_confirmed', 'grouped', 'in_transit',
  'arrived', 'ready', 'delivered', 'cancelled',
]);
const ETATS_PAIEMENT = new Set(['pending', 'proof_sent', 'confirmed', 'refused']);

export async function updateOrder(corps: Record<string, unknown>, env: Env) {
  const id = texte(corps.id, 80);
  exige(id, 'Commande non désignée.');
  const champs: string[] = [];
  const valeurs: unknown[] = [];

  /* Liste blanche : seuls ces champs se modifient, et seulement vers des
     valeurs connues. Un état inventé ne doit pas entrer en base. */
  if (typeof corps.order_status === 'string') {
    exige(ETATS_COMMANDE.has(corps.order_status), 'État de commande inconnu.');
    champs.push(`order_status = ?${champs.length + 2}`);
    valeurs.push(corps.order_status);
  }
  if (typeof corps.payment_status === 'string') {
    exige(ETATS_PAIEMENT.has(corps.payment_status), 'État de paiement inconnu.');
    champs.push(`payment_status = ?${champs.length + 2}`);
    valeurs.push(corps.payment_status);
  }
  if (corps.delivery_fee !== undefined) {
    champs.push(`delivery_fee = ?${champs.length + 2}`);
    valeurs.push(corps.delivery_fee === null ? null : entier(corps.delivery_fee, 0, 0));
  }
  if (typeof corps.note === 'string') {
    champs.push(`note = ?${champs.length + 2}`);
    valeurs.push(texte(corps.note, 600));
  }
  exige(champs.length > 0, 'Rien à modifier.');

  champs.push(`updated_at = ?${champs.length + 2}`);
  valeurs.push(maintenant());

  /*
   * Le total est RECALCULÉ par la base après coup, jamais reçu : modifier
   * des frais de livraison doit refaire la somme, et personne ne doit
   * pouvoir envoyer un total de son choix.
   */
  await env.DB.batch([
    env.DB.prepare(`update orders set ${champs.join(', ')} where id = ?1`).bind(id, ...valeurs),
    env.DB.prepare(
      'update orders set total = max(0, subtotal + service_fee + coalesce(delivery_fee, 0) - discount)' +
      ' where id = ?1',
    ).bind(id),
  ]);
  return unecommande(id, env);
}

export async function updateOrdersTrash(corps: Record<string, unknown>, env: Env) {
  const ids = (Array.isArray(corps.ids) ? corps.ids : []).map((x) => texte(x, 80)).filter(Boolean);
  exige(ids.length > 0, 'Aucune commande désignée.');
  const quand = corps.trashed ? maintenant() : null;
  await env.DB.batch(
    ids.map((id) =>
      env.DB.prepare('update orders set deleted_at = ?2, updated_at = ?3 where id = ?1')
        .bind(id, quand, maintenant()),
    ),
  );
  return { modifiees: ids.length };
}

export async function deleteOrders(corps: Record<string, unknown>, env: Env) {
  const ids = (Array.isArray(corps.ids) ? corps.ids : []).map((x) => texte(x, 80)).filter(Boolean);
  exige(ids.length > 0, 'Aucune commande désignée.');
  /* Les lignes partent avec la commande : la clé étrangère est en cascade,
     mais on ne compte pas dessus — `pragma foreign_keys` peut être éteint. */
  await env.DB.batch([
    ...ids.map((id) => env.DB.prepare('delete from order_items where order_id = ?1').bind(id)),
    ...ids.map((id) => env.DB.prepare('delete from orders where id = ?1').bind(id)),
  ]);
  return { supprimees: ids.length };
}

