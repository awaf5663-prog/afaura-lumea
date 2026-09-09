import { useCallback, useEffect, useState } from 'react';
import { BASE_URL } from '@/src/lib/router';

/**
 * Détection d'une nouvelle version publiée.
 *
 * Le problème : les navigateurs mobiles gardent longtemps l'ancien
 * index.html. Une correction publiée peut rester invisible des heures, et la
 * boutique — ou une cliente — utilise sans le savoir une version dépassée.
 * Les fichiers JavaScript portent une empreinte dans leur nom, donc seul le
 * document d'entrée pose problème.
 *
 * Le site interroge version.json, écrit à chaque publication, en demandant
 * explicitement de ne PAS servir depuis le cache. Si l'empreinte diffère de
 * celle embarquée dans le code en cours d'exécution, une nouvelle version
 * est en ligne.
 *
 * Ce qu'on en fait ensuite dépend de l'écran : sur une page tranquille, on
 * recharge sans rien demander ; sur un formulaire, jamais — recharger sous
 * les doigts de quelqu'un qui remplit son adresse effacerait sa saisie. On
 * lui propose alors, et elle choisit son moment.
 *
 * ET ON NE RECHARGE QU'UNE FOIS PAR VERSION.
 *
 * Recharger ne garantit pas de recevoir le nouveau document : c'est même
 * précisément le cas que ce fichier cherche à traiter, celui d'un navigateur
 * mobile qui garde l'ancien index.html. Quand cela arrive, le code qui repart
 * est le même, il constate le même écart, et recharge encore — la boutique se
 * recharge en boucle et n'affiche jamais ses articles. C'est le défaut qu'on
 * a mis le plus longtemps à voir, parce qu'il ressemble à de la lenteur.
 *
 * On garde donc trace, le temps de l'onglet, de la version pour laquelle on a
 * déjà rechargé. Si l'écart persiste après ce rechargement, on cesse d'y
 * croire : la bannière prend le relais, et la page reste utilisable.
 */

declare const __BUILD_ID__: string;

/** Écrans où l'on ne recharge jamais sans demander : une saisie est en cours. */
const ECRANS_DE_SAISIE = ['/commander', '/shein/demande', '/admin'];

/** Version pour laquelle cet onglet a déjà tenté un rechargement. */
const CLE_TENTATIVE = 'lumea.version.rechargee';

/**
 * A-t-on déjà rechargé pour cette version-là ?
 *
 * `sessionStorage` et non `localStorage` : la trace doit survivre au
 * rechargement, et disparaître à la fermeture de l'onglet. Un navigateur qui
 * refuse le stockage ne doit pas non plus faire échouer la page — dans le
 * doute, on répond « oui », ce qui revient à ne pas recharger. Ne rien faire
 * est toujours plus sûr que recharger en boucle.
 */
function dejaTente(version: string): boolean {
  try {
    return sessionStorage.getItem(CLE_TENTATIVE) === version;
  } catch {
    return true;
  }
}

function noterTentative(version: string): void {
  try {
    sessionStorage.setItem(CLE_TENTATIVE, version);
  } catch {
    /* Stockage refusé : la ligne suivante ne rechargera pas, et c'est très bien. */
  }
}

async function versionPubliee(): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as { build?: string };
    return data.build ?? null;
  } catch {
    // Hors ligne, ou hébergeur momentanément injoignable : on ne fait rien.
    return null;
  }
}

export function useVersionCheck(path: string): { nouvelleVersion: boolean; recharger: () => void } {
  const [nouvelleVersion, setNouvelleVersion] = useState(false);

  const recharger = useCallback(() => {
    window.location.reload();
  }, []);

  useEffect(() => {
    let vivant = true;

    const verifier = async () => {
      /*
       * En développement, rien n'est publié : le code tourne sous une
       * empreinte « dev » qui ne correspondra jamais au version.json du
       * dernier envoi. Comparer les deux revient à recharger la page à
       * chaque ouverture, ce qui interrompt le rendu au moment le moins
       * choisi — la boutique n'a jamais fini d'afficher ses articles.
       */
      if (__BUILD_ID__ === 'dev') return;

      const publiee = await versionPubliee();
      if (!vivant || !publiee || publiee === __BUILD_ID__) return;

      const enSaisie = ECRANS_DE_SAISIE.some((ecran) => path.startsWith(ecran));
      /*
       * En saisie, on n'a jamais rechargé tout seul. Et si un rechargement a
       * déjà été tenté pour cette version sans rien changer, on n'insiste pas :
       * la bannière laisse la cliente décider, et la page continue de vivre.
       */
      if (enSaisie || dejaTente(publiee)) {
        setNouvelleVersion(true);
        return;
      }
      noterTentative(publiee);
      window.location.reload();
    };

    void verifier();

    // Revenir sur l'onglet est le bon moment : c'est là qu'on rouvre le site
    // après l'avoir laissé de côté, souvent des heures plus tard.
    const surRetour = () => {
      if (document.visibilityState === 'visible') void verifier();
    };
    document.addEventListener('visibilitychange', surRetour);
    return () => {
      vivant = false;
      document.removeEventListener('visibilitychange', surRetour);
    };
  }, [path]);

  return { nouvelleVersion, recharger };
}
