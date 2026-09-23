/**
 * ═══════════════════════════════════════════════════════════════════════
 *  RECETTE DU WORKER — on l'interroge vraiment, on ne le relit pas
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  Ce fichier n'examine pas le code : il envoie de vraies requêtes à un
 *  Worker qui tourne, et regarde ce qui revient. C'est la différence
 *  entre « le code a l'air juste » et « le code fait ce qu'il faut ».
 *
 *  Il tourne contre un Worker LOCAL (wrangler dev), sur une base locale
 *  jetable. Jamais contre la vraie base : une recette qui écrit dans les
 *  commandes de la boutique n'est pas une recette, c'est un accident.
 *
 *  Usage :
 *    node cloudflare/recettes/recette-worker.mjs [adresse] [mot de passe]
 *
 *  Par défaut : http://127.0.0.1:8787 et « essai-local ».
 */

const ADRESSE = process.argv[2] ?? 'http://127.0.0.1:8787';
const MOT_DE_PASSE = process.argv[3] ?? 'essai-local';
const ORIGINE = 'https://afauralumea.shop';

let verts = 0;
const rouges = [];

function verifier(intitule, condition, detail = '') {
  if (condition) {
    verts += 1;
    console.log(`  OK      ${intitule}`);
  } else {
    rouges.push(intitule);
    console.log(`  ERREUR  ${intitule}${detail ? ` — ${detail}` : ''}`);
  }
}

async function appeler(methode, corps = {}, { motDePasse = null, origine = ORIGINE } = {}) {
  const entetes = { 'content-type': 'application/json' };
  if (origine) entetes['Origin'] = origine;
  if (motDePasse) entetes['authorization'] = `Bearer ${motDePasse}`;
  const r = await fetch(`${ADRESSE}/api/${methode}`, {
    method: 'POST',
    headers: entetes,
    body: JSON.stringify(corps),
  });
  const texte = await r.text();
  let charge = {};
  try {
    charge = texte ? JSON.parse(texte) : {};
  } catch {
    charge = { brut: texte };
  }
  return { statut: r.status, entetes: r.headers, ...charge };
}

const boutique = (methode, corps) => appeler(methode, corps, { motDePasse: MOT_DE_PASSE });

// ═══════════════════════════════════════════════════════════════════════
console.log('\n── Qui a le droit d\'appeler quoi ──');

{
  const r = await appeler('getSettings');
  verifier('une visiteuse lit les réglages', r.statut === 200 && r.resultat);

  const s = await appeler('listOrders');
  verifier('une visiteuse ne liste PAS les commandes', s.statut === 401, `reçu ${s.statut}`);

  const f = await appeler('listOrders', {}, { motDePasse: 'mauvais-mot-de-passe' });
  verifier('un mauvais mot de passe est refusé', f.statut === 401, `reçu ${f.statut}`);

  const b = await boutique('listOrders');
  verifier('la boutique liste les commandes', b.statut === 200 && Array.isArray(b.resultat));

  const inconnue = await appeler('effacerToutesLesCommandes');
  verifier('une méthode inconnue est refusée', inconnue.statut === 404, `reçu ${inconnue.statut}`);
  verifier(
    "le refus ne dit pas si la méthode existe",
    inconnue.erreur === 'Requête refusée.',
    inconnue.erreur,
  );

  const ailleurs = await appeler('getSettings', {}, { origine: 'https://mechant.example' });
  verifier(
    "une page inconnue ne reçoit pas l'autorisation CORS",
    !ailleurs.entetes.get('access-control-allow-origin'),
    ailleurs.entetes.get('access-control-allow-origin') ?? '',
  );

  const sansJson = await fetch(`${ADRESSE}/api/getSettings`, { method: 'GET' });
  verifier('GET est refusé', sansJson.status === 405, `reçu ${sansJson.status}`);
}

// ═══════════════════════════════════════════════════════════════════════
console.log('\n── Les montants se calculent au Worker, jamais au navigateur ──');

let numeroEssai = null;

{
  /* On relit d'abord les vrais prix : la recette ne doit pas contenir de
     montants écrits à la main, qui deviendraient faux le jour où la
     boutique change un tarif. */
  const catalogue = await appeler('listProducts');
  verifier('le catalogue répond', catalogue.statut === 200 && catalogue.resultat.length > 0,
    `${catalogue.resultat?.length ?? 0} articles`);

  /* Une recette qui plante ne dit rien de plus qu'une recette rouge, et
     elle cache les vérifications suivantes. On s'arrête proprement. */
  const disponibles = (catalogue.resultat ?? []).filter(
    (p) => p.status === 'active' && p.stock === null,
  );
  const a = disponibles[0];
  const b = disponibles[1];
  verifier('deux articles servent à l\'essai', Boolean(a && b));

  if (a && b) {
    const attendu = a.price * 3 + b.price * 2;

    const r = await appeler('createOrder', {
      customer_name: 'Recette Tricheuse',
      phone: '770000000',
      address: 'Rue de la recette',
      city: 'Saint-Louis',
      delivery_zone_id: 'city',
      payment_method: 'wave',
      promo_code: '',
      is_student: false,
      /* Les montants que la cliente aimerait voir appliqués. */
      total: 1,
      subtotal: 1,
      discount: 9_999_999,
      delivery_fee: 0,
      service_fee: 0,
      items: [
        { product_id: a.id, quantity: 3, options: {} },
        { product_id: b.id, quantity: 2, options: {} },
      ],
    });

    verifier('la commande est acceptée', r.statut === 200, r.erreur ?? '');
    const c = r.resultat ?? {};
    numeroEssai = c.order_number ?? null;
    verifier('le sous-total est celui des fiches', c.subtotal === attendu, `${c.subtotal} au lieu de ${attendu}`);
    verifier('la remise envoyée par le navigateur est ignorée', c.discount === 0, String(c.discount));
    verifier('le total n\'est pas celui envoyé', c.total !== 1, String(c.total));
    verifier(
      'les prix unitaires viennent des fiches',
      (c.order_items ?? []).every((l) => {
        const fiche = [a, b].find((p) => p.id === l.product_id);
        return fiche && l.unit_price === fiche.price;
      }),
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════
console.log('\n── Le stock, et la numérotation ──');

{
  const avant = await boutique('listOrders');
  const refus = await appeler('createOrder', {
    customer_name: 'X', phone: '770000000', address: 'a', city: 'b',
    delivery_zone_id: 'city', payment_method: 'cash', promo_code: '', is_student: false,
    items: [{ product_id: 'article-qui-n-existe-pas', quantity: 1, options: {} }],
  });
  verifier('un article inconnu fait refuser la commande', refus.statut === 400, `reçu ${refus.statut}`);
  verifier('rien n\'a été enregistré', (await boutique('listOrders')).resultat.length === avant.resultat.length);

  /*
   * LE NUMÉRO NE DOIT PAS SAUTER après un refus. Pour la boutique, un trou
   * dans la suite ressemble à une commande perdue, et on cherche longtemps
   * une commande qui n'a jamais existé.
   */
  const catalogue = await appeler('listProducts');
  const a = (catalogue.resultat ?? []).find((p) => p.status === 'active' && p.stock === null);
  if (a && numeroEssai) {
    const suivante = await appeler('createOrder', {
      customer_name: 'Recette Suite', phone: '771234567', address: 'Sor', city: 'Saint-Louis',
      delivery_zone_id: 'pickup', payment_method: 'cash', promo_code: '', is_student: false,
      items: [{ product_id: a.id, quantity: 1, options: {} }],
    });
    const n = (s) => Number(String(s).split('-').pop());
    verifier(
      'le numéro suit sans trou malgré le refus',
      n(suivante.resultat?.order_number) === n(numeroEssai) + 1,
      `${numeroEssai} puis ${suivante.resultat?.order_number}`,
    );
  }
}

// ═══════════════════════════════════════════════════════════════════════
console.log('\n── Retrouver sa commande : le numéro ET le téléphone ──');

{
  const commandes = (await boutique('listOrders')).resultat ?? [];
  const c = commandes[0];
  verifier('il y a une commande à retrouver', Boolean(c));
  if (c) {
    const bonne = await appeler('findOrder', { orderNumber: c.order_number, phone: c.phone });
    verifier('avec les deux, on la retrouve', bonne.resultat?.order_number === c.order_number);

    const mauvaise = await appeler('findOrder', { orderNumber: c.order_number, phone: '700000000' });
    verifier('avec un autre téléphone, non', mauvaise.resultat === null);

    const sansTelephone = await appeler('findOrder', { orderNumber: c.order_number, phone: '' });
    verifier('sans téléphone, non', sansTelephone.resultat === null);
  }
}

// ═══════════════════════════════════════════════════════════════════════
console.log('\n── Ce qui ne regarde pas la cliente ne sort pas ──');

{
  const groupage = await boutique('saveGrouping', {
    grouping: {
      id: 'recette-groupage',
      name: 'Groupage de recette',
      status: 'open',
      logistics_cost: 123456,
      note: 'Note interne qui ne doit pas sortir',
    },
  });
  verifier('la boutique enregistre un groupage', groupage.statut === 200, groupage.erreur ?? '');

  const vueBoutique = await boutique('listGroupings');
  const vuBoutique = (vueBoutique.resultat ?? []).find((g) => g.id === 'recette-groupage');
  verifier('la boutique voit le coût logistique', vuBoutique?.logistics_cost === 123456);

  const vuePublique = await appeler('listGroupings');
  const vuPublic = (vuePublique.resultat ?? []).find((g) => g.id === 'recette-groupage');
  verifier('une visiteuse voit le groupage', Boolean(vuPublic));
  verifier('mais PAS le coût logistique', vuPublic?.logistics_cost === undefined,
    String(vuPublic?.logistics_cost));
  verifier('ni la note interne', vuPublic?.note === undefined, String(vuPublic?.note));

  await boutique('deleteGrouping', { id: 'recette-groupage' });
}

// ═══════════════════════════════════════════════════════════════════════
console.log('\n── Les alertes portent des secrets ──');

{
  const publique = await appeler('getAlertSettings');
  verifier('le canal ntfy n\'est pas lisible publiquement', publique.statut === 401,
    `reçu ${publique.statut}`);

  const reservee = await boutique('getAlertSettings');
  verifier('la boutique lit ses réglages d\'alerte', reservee.statut === 200);
}

// ═══════════════════════════════════════════════════════════════════════
console.log(`\n${'─'.repeat(60)}`);
console.log(`${verts} vérifications vertes, ${rouges.length} en échec.`);
if (rouges.length) {
  console.log('\nEn échec :');
  for (const r of rouges) console.log(`  · ${r}`);
  process.exit(1);
}
console.log('Le Worker fait ce qu\'il annonce.\n');
