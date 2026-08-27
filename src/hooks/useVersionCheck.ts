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
 */

declare const __BUILD_ID__: string;

/** Écrans où l'on ne recharge jamais sans demander : une saisie est en cours. */
const ECRANS_DE_SAISIE = ['/commander', '/shein/demande', '/admin'];

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
      const publiee = await versionPubliee();
      if (!vivant || !publiee || publiee === __BUILD_ID__) return;

      const enSaisie = ECRANS_DE_SAISIE.some((ecran) => path.startsWith(ecran));
      if (enSaisie) {
        setNouvelleVersion(true);
        return;
      }
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
