/**
 * ═══════════════════════════════════════════════════════════════════════
 *  LE WORKER : la seule porte vers les données de la boutique
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  Une seule adresse, POST /api/<methode>, un corps JSON. C'est une forme
 *  d'appel de fonction, pas une API REST, et c'est voulu : le seul client
 *  est l'adaptateur du site, qui a vingt-sept méthodes. Les faire
 *  correspondre une à une évite une couche de traduction — donc une
 *  couche où se tromper.
 *
 *  TROIS RÈGLES QUI NE SE DISCUTENT PAS :
 *
 *  1. Une méthode absente de la table d'accès est REFUSÉE. Pas devinée,
 *     pas ouverte « en attendant ». Voir acces.ts.
 *
 *  2. Les montants se calculent ICI. Jamais dans le navigateur. Ce que la
 *     cliente envoie, ce sont des choix — des identifiants d'articles,
 *     des quantités — jamais un total.
 *
 *  3. Ce qui ne regarde pas la cliente ne sort pas. Le coût logistique
 *     d'un groupage, le jeton du robot d'alerte : le Worker les retire
 *     avant de répondre, il ne compte pas sur le site pour ne pas les
 *     afficher.
 */
import { exigence } from './acces';
import { appliquer } from './methodes';

export interface Env {
  DB: D1Database;
  /** Mot de passe de l'administration. Secret du Worker, jamais dans le dépôt. */
  ADMIN_MOT_DE_PASSE?: string;
  /** Origines autorisées à appeler ce Worker, séparées par des virgules. */
  ORIGINES?: string;
  /** Présent seulement une fois R2 activé. */
  PHOTOS?: R2Bucket;
}

/**
 * Les origines qui ont le droit d'appeler.
 *
 * Sans cette liste, n'importe quelle page du web pourrait faire passer
 * des commandes au nom de la boutique depuis le navigateur d'une
 * visiteuse. On ne renvoie donc JAMAIS « * » quand une autorisation
 * accompagne la requête.
 */
function origineAutorisee(requete: Request, env: Env): string | null {
  const origine = requete.headers.get('Origin');
  if (!origine) return null;
  const permises = (env.ORIGINES ?? 'https://afauralumea.shop')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
  return permises.includes(origine) ? origine : null;
}

function entetes(origine: string | null): HeadersInit {
  const h: Record<string, string> = {
    'content-type': 'application/json; charset=utf-8',
    /* Une réponse de données ne se met jamais en cache par un intermédiaire. */
    'cache-control': 'no-store',
  };
  if (origine) {
    h['access-control-allow-origin'] = origine;
    h['access-control-allow-headers'] = 'content-type, authorization';
    h['access-control-allow-methods'] = 'POST, OPTIONS';
    h['access-control-max-age'] = '86400';
    h['vary'] = 'Origin';
  }
  return h;
}

const reponse = (corps: unknown, statut: number, origine: string | null) =>
  new Response(JSON.stringify(corps), { status: statut, headers: entetes(origine) });

/**
 * La boutique est-elle celle qui appelle ?
 *
 * Comparaison à TEMPS CONSTANT. Un `===` sur des chaînes s'arrête au
 * premier caractère différent : le temps de réponse trahit alors combien
 * de caractères sont justes, et un mot de passe se devine lettre par
 * lettre. Ici, on compare toujours tout.
 */
function estLaBoutique(requete: Request, env: Env): boolean {
  const attendu = env.ADMIN_MOT_DE_PASSE;
  /* Pas de mot de passe configuré : personne n'est la boutique. Jamais
     l'inverse — un secret absent ne doit pas ouvrir la porte. */
  if (!attendu) return false;
  const entete = requete.headers.get('authorization') ?? '';
  const donne = entete.startsWith('Bearer ') ? entete.slice(7) : '';
  if (donne.length !== attendu.length) return false;
  let ecart = 0;
  for (let i = 0; i < attendu.length; i += 1) {
    ecart |= donne.charCodeAt(i) ^ attendu.charCodeAt(i);
  }
  return ecart === 0;
}

export default {
  async fetch(requete: Request, env: Env): Promise<Response> {
    const origine = origineAutorisee(requete, env);

    if (requete.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: entetes(origine) });
    }
    if (requete.method !== 'POST') {
      return reponse({ erreur: 'Seul POST est accepté ici.' }, 405, origine);
    }

    const chemin = new URL(requete.url).pathname;
    const methode = chemin.startsWith('/api/') ? chemin.slice(5) : '';
    const exige = exigence(methode);

    /*
     * Méthode inconnue : on répond la même chose que pour un accès
     * refusé, et sans nommer la méthode. Distinguer les deux dirait à un
     * curieux quelles méthodes existent.
     */
    if (exige === null) {
      return reponse({ erreur: 'Requête refusée.' }, 404, origine);
    }
    if (exige === 'boutique' && !estLaBoutique(requete, env)) {
      return reponse({ erreur: 'Réservé à la boutique.' }, 401, origine);
    }

    let corps: unknown = {};
    try {
      const texte = await requete.text();
      corps = texte ? JSON.parse(texte) : {};
    } catch {
      return reponse({ erreur: 'Corps illisible : du JSON était attendu.' }, 400, origine);
    }

    try {
      const resultat = await appliquer(methode, corps, env);
      return reponse({ resultat }, 200, origine);
    } catch (erreur) {
      /*
       * Le détail part dans le journal du Worker, pas dans la réponse :
       * un message d'erreur de base de données décrit la base.
       */
      console.error(`[${methode}]`, erreur);
      const attendue = erreur instanceof ErreurLisible;
      return reponse(
        { erreur: attendue ? (erreur as ErreurLisible).message : "Quelque chose n'a pas fonctionné." },
        attendue ? (erreur as ErreurLisible).statut : 500,
        origine,
      );
    }
  },
};

/** Une erreur dont le message PEUT être montré à qui appelle. */
export class ErreurLisible extends Error {
  constructor(message: string, readonly statut = 400) {
    super(message);
  }
}
