import type { ServiceFeeTier } from '@/src/types';
import { fraisBoutique } from './storeFee';

/**
 * ─────────────────────────────────────────────────────────────
 *  RÉPARTITION D'UN COLIS GROUPÉ
 * ─────────────────────────────────────────────────────────────
 *  Le transport SHEIN se paie PAR COLIS, pas par article : trois petits
 *  articles ou cinquante, c'est presque le même prix. Facturé à une seule
 *  cliente, il dépasse le prix des articles ; partagé entre toutes celles du
 *  groupage, il devient supportable.
 *
 *  Ce fichier fait ce partage, et rien d'autre. Il ne décide d'aucun tarif :
 *  les frais de traitement viennent de la grille de la boutique, le taux de
 *  change est saisi par la boutique, et les montants SHEIN sont recopiés de
 *  l'écran de paiement — jamais devinés.
 *
 *  STRICTEMENT ADMINISTRATIF : le bénéfice calculé ici ne s'affiche jamais
 *  côté cliente.
 */

/** Comment partager le transport entre les clientes. */
export type MethodeRepartition = 'valeur' | 'articles';

export interface LigneCliente {
  id: string;
  nom: string;
  /** Valeur de ses articles, dans la devise de la commande (prix payé, promotions déduites). */
  valeur: number;
  /** Nombre d'articles, en unités. */
  articles: number;
}

/** Les quatre lignes de l'écran « PAYER » de SHEIN. */
export interface CommandeShein {
  /** « Retail Price » : le prix des articles avant promotions. */
  articles: number;
  /** « Promotions » : saisi en positif, retranché du prix des articles. */
  promotions: number;
  /** « Shipping Fee ». */
  livraison: number;
  /** « Shipping Guarantee ». 0 si elle n'est pas prise. */
  garantie: number;
}

export interface PartCliente {
  id: string;
  nom: string;
  articles: number;
  /** Ses articles, convertis. */
  articlesFcfa: number;
  /** Sa part du transport du colis. */
  transportFcfa: number;
  /** Frais de traitement de la boutique, d'après sa grille. */
  fraisFcfa: number;
  /** Ce qu'il faut lui réclamer. */
  totalFcfa: number;
}

export interface Repartition {
  /** Articles, promotions déduites, dans la devise. */
  articlesNets: number;
  /** Livraison + garantie : le pot à partager. */
  transport: number;
  /** Ce que la boutique paie à SHEIN, dans la devise. Égal au total de l'écran. */
  totalDevise: number;
  totalFcfa: number;
  parts: PartCliente[];
  /** Somme réclamée aux clientes. */
  encaisse: number;
  /** Encaissé − payé. C'est le vrai bénéfice, pas la somme des frais. */
  benefice: number;
  /**
   * Valeur d'articles qui n'est rattachée à aucune cliente, dans la devise.
   * Positive : des articles ne sont attribués à personne — leur part de
   * transport sortira de la poche de la boutique.
   * Négative : les lignes annoncent plus que la commande.
   */
  ecart: number;
}

const arrondir = (n: number) => (Number.isFinite(n) ? Math.round(n) : 0);
const positif = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

/**
 * Partage un colis entre les clientes.
 *
 * @param taux  FCFA pour une unité de la devise saisie. 0 = pas encore fixé,
 *              tous les montants en francs valent alors 0.
 * @param marge Marge de sécurité sur le transport, en pourcentage. Elle absorbe
 *              ce qu'on ne sait pas encore (poids réel, variation du taux).
 *              Elle appartient à la boutique et ne se montre jamais à la cliente.
 */
export function repartir({
  commande,
  lignes,
  taux,
  methode,
  tiers,
  marge = 0,
}: {
  commande: CommandeShein;
  lignes: LigneCliente[];
  taux: number;
  methode: MethodeRepartition;
  tiers: ServiceFeeTier[];
  marge?: number;
}): Repartition {
  const articlesNets = positif(commande.articles) - positif(commande.promotions);
  const transport = positif(commande.livraison) + positif(commande.garantie);
  const totalDevise = articlesNets + transport;
  const change = positif(taux);

  // Le pot à partager, majoré de la marge de sécurité s'il y en a une.
  const potFcfa = transport * change * (1 + positif(marge) / 100);

  const totalValeur = lignes.reduce((s, l) => s + positif(l.valeur), 0);
  const totalArticles = lignes.reduce((s, l) => s + positif(l.articles), 0);

  // Une clé de répartition vide ne partage rien : mieux vaut zéro qu'un
  // montant tiré au sort.
  const base = methode === 'valeur' ? totalValeur : totalArticles;

  /*
   * Les parts sont arrondies au franc. Arrondir chacune séparément laisserait
   * un franc ou deux dans la nature — payés par la boutique sans qu'elle le
   * voie. La dernière part prend donc le reste exact : la somme des parts est
   * toujours égale au transport à partager.
   */
  const potArrondi = arrondir(potFcfa);
  let distribue = 0;

  const parts: PartCliente[] = lignes.map((ligne, index) => {
    const valeur = positif(ligne.valeur);
    const articles = Math.max(0, Math.round(positif(ligne.articles)));
    const poids = methode === 'valeur' ? valeur : articles;
    const dernier = index === lignes.length - 1;
    let transportFcfa = 0;
    if (base > 0) {
      transportFcfa = dernier ? potArrondi - distribue : arrondir((potArrondi * poids) / base);
      distribue += transportFcfa;
    }
    const articlesFcfa = arrondir(valeur * change);
    const fraisFcfa = fraisBoutique(articles, tiers);
    return {
      id: ligne.id,
      nom: ligne.nom,
      articles,
      articlesFcfa,
      transportFcfa,
      fraisFcfa,
      totalFcfa: articlesFcfa + transportFcfa + fraisFcfa,
    };
  });

  const encaisse = parts.reduce((s, p) => s + p.totalFcfa, 0);
  const totalFcfa = arrondir(totalDevise * change);

  return {
    articlesNets,
    transport,
    totalDevise,
    totalFcfa,
    parts,
    encaisse,
    benefice: encaisse - totalFcfa,
    ecart: articlesNets - totalValeur,
  };
}

/**
 * Ce qu'il faudrait réclamer à une cliente pour que le colis soit à l'équilibre,
 * si elle était seule à le porter. Sert à montrer, chiffres en main, ce que
 * coûte une commande passée pour une seule personne.
 */
export function coutSeule(commande: CommandeShein, taux: number): number {
  const total =
    positif(commande.articles) -
    positif(commande.promotions) +
    positif(commande.livraison) +
    positif(commande.garantie);
  return arrondir(total * positif(taux));
}
