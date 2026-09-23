/**
 * ═══════════════════════════════════════════════════════════════════════
 *  RECETTE DE L'ALERTE — le message qui arrive sur le téléphone
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  Ce message est porté depuis les fonctions `texte_alerte` et
 *  `libelle_alerte` de Postgres, MOT POUR MOT. La boutique le lit d'un
 *  coup d'œil, souvent en servant une cliente : une formulation qui
 *  change du jour au lendemain se lit moins vite, et un intitulé qui
 *  disparaît se remarque au pire moment.
 *
 *  On compare donc au texte attendu, caractère par caractère.
 *
 *  Usage : node cloudflare/recettes/recette-alerte.mjs
 */
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const racine = path.resolve(import.meta.dirname, '../..');
const dossier = await mkdtemp(path.join(tmpdir(), 'lumea-alerte-'));
const sortie = path.join(dossier, 'divers.mjs');

await build({
  entryPoints: [path.join(racine, 'cloudflare/src/divers.ts')],
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  outfile: sortie,
  logLevel: 'error',
});

const { texteAlerteCommande, texteAlerteShein } = await import(pathToFileURL(sortie).href);

let verts = 0;
const rouges = [];

function comparer(intitule, obtenu, attendu) {
  if (obtenu === attendu) {
    verts += 1;
    console.log(`  OK      ${intitule}`);
  } else {
    rouges.push(intitule);
    console.log(`  ERREUR  ${intitule}`);
    console.log('    attendu :');
    console.log(attendu.split('\n').map((l) => `      │ ${l}`).join('\n'));
    console.log('    obtenu :');
    console.log(obtenu.split('\n').map((l) => `      │ ${l}`).join('\n'));
  }
}

const COMMANDE = {
  order_number: 'CMD-2026-00004',
  customer_name: 'Fatou Ndiaye',
  phone: '771234567',
  total: 11000,
  delivery_zone_id: 'city',
  delivery_fee: 1000,
  payment_method: 'wave',
  address: 'Guet Ndar, Saint-Louis',
};

console.log('\n── Le message d\'une nouvelle commande ──');

/*
 * PAR DÉFAUT, L'ALERTE NE DIT PAS QUI EST LA CLIENTE. Un canal ntfy n'a
 * pas de mot de passe : qui devine son nom lirait sinon le nom, le
 * téléphone et l'adresse de chaque cliente. C'est la boutique qui décide
 * de les ajouter, en connaissance de cause.
 */
comparer(
  'sans les coordonnées (le réglage par défaut)',
  texteAlerteCommande(COMMANDE, false),
  ['N° CMD-2026-00004', 'Total : 11000 FCFA', 'Livraison : Saint-Louis', 'Paiement : Wave'].join('\n'),
);

comparer(
  'avec les coordonnées, quand la boutique le demande',
  texteAlerteCommande(COMMANDE, true),
  [
    'N° CMD-2026-00004',
    'Fatou Ndiaye — 771234567',
    'Total : 11000 FCFA',
    'Livraison : Saint-Louis',
    'Paiement : Wave',
    'Guet Ndar, Saint-Louis',
  ].join('\n'),
);

/* « Livraison : Saint-Louis » et non « Livraison : Livraison Saint-Louis » :
   la ligne le dit déjà. Ce détail vient d'une correction faite chez
   Postgres, et il se perdrait facilement. */
comparer(
  'la zone ne répète pas le mot « Livraison »',
  texteAlerteCommande({ ...COMMANDE, delivery_zone_id: 'around' }, false),
  ['N° CMD-2026-00004', 'Total : 11000 FCFA', 'Livraison : Environs de Saint-Louis', 'Paiement : Wave'].join('\n'),
);

/* Une zone sans tarif se règle de vive voix. L'alerte DOIT le dire :
   sinon le total lu n'est pas le total dû. */
comparer(
  'une zone sans tarif annonce « frais à confirmer »',
  texteAlerteCommande({ ...COMMANDE, delivery_zone_id: 'regions', delivery_fee: null }, false),
  [
    'N° CMD-2026-00004',
    'Total : 11000 FCFA',
    'Livraison : Louga, Thiès, Dakar (frais à confirmer)',
    'Paiement : Wave',
  ].join('\n'),
);

/* Un retrait en boutique n'a pas de frais à confirmer : il n'en a pas. */
comparer(
  'un retrait en boutique n\'annonce pas de frais',
  texteAlerteCommande({ ...COMMANDE, delivery_zone_id: 'pickup', delivery_fee: null }, false),
  ['N° CMD-2026-00004', 'Total : 11000 FCFA', 'Livraison : Point de retrait', 'Paiement : Wave'].join('\n'),
);

comparer(
  'les moyens de paiement gardent leurs noms',
  texteAlerteCommande({ ...COMMANDE, payment_method: 'orange_money' }, false),
  ['N° CMD-2026-00004', 'Total : 11000 FCFA', 'Livraison : Saint-Louis', 'Paiement : Orange Money'].join('\n'),
);

comparer(
  'un code inconnu s\'affiche tel quel plutôt que de disparaître',
  texteAlerteCommande({ ...COMMANDE, payment_method: 'nouveau_moyen' }, false),
  ['N° CMD-2026-00004', 'Total : 11000 FCFA', 'Livraison : Saint-Louis', 'Paiement : nouveau_moyen'].join('\n'),
);

/* Une commande sans adresse enregistrée ne doit pas produire une ligne vide. */
comparer(
  'une adresse absente n\'ajoute pas de ligne vide',
  texteAlerteCommande({ ...COMMANDE, address: '' }, true),
  [
    'N° CMD-2026-00004',
    'Fatou Ndiaye — 771234567',
    'Total : 11000 FCFA',
    'Livraison : Saint-Louis',
    'Paiement : Wave',
  ].join('\n'),
);

console.log('\n── Le message d\'une demande SHEIN ──');

comparer(
  'sans les coordonnées',
  texteAlerteShein({ request_number: 'SHE-2026-00001', customer_name: 'Fatou', phone: '771234567' }, false),
  ['N° SHE-2026-00001', 'À chiffrer, puis à confirmer à la cliente.'].join('\n'),
);

comparer(
  'avec les coordonnées',
  texteAlerteShein({ request_number: 'SHE-2026-00001', customer_name: 'Fatou Ndiaye', phone: '771234567' }, true),
  ['N° SHE-2026-00001', 'Fatou Ndiaye — 771234567', 'À chiffrer, puis à confirmer à la cliente.'].join('\n'),
);

await rm(dossier, { recursive: true, force: true });

console.log(`\n${'─'.repeat(60)}`);
console.log(`${verts} vérifications vertes, ${rouges.length} en échec.`);
if (rouges.length) {
  console.log('\nEn échec :');
  for (const r of rouges) console.log(`  · ${r}`);
  process.exit(1);
}
console.log('L\'alerte dit la même chose qu\'avant.\n');
