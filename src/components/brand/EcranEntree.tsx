import { useEffect, useState } from 'react';
import { cn } from '@/src/lib/cn';

/** Le nom s'écrit une fois par visite, pas à chaque page ouverte. */
const CLE = 'lumea.entree.v1';

const NOM = 'Afaura';
/** Cadence d'écriture : une lettre toutes les 90 ms. */
const PAS = 90;
/** Temps de lecture une fois le nom écrit. */
const REPOS = 340;
/** Durée du fondu de sortie — la même que dans .entree-sortie. */
const SORTIE = 420;

function dejaVu(): boolean {
  // Téléphone réglé sur « animations réduites » : on entre directement.
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  } catch {
    /* navigateur sans matchMedia : on continue */
  }
  try {
    return sessionStorage.getItem(CLE) === '1';
  } catch {
    // Stockage bloqué (navigation privée) : on ne montre rien plutôt que de
    // rejouer l'animation à chaque page.
    return true;
  }
}

function noter(): void {
  try {
    sessionStorage.setItem(CLE, '1');
  } catch {
    /* rien à faire : l'écran ne se montrera simplement pas deux fois de suite */
  }
}

/**
 * ─────────────────────────────────────────────────────────────
 *  ÉCRAN D'ENTRÉE
 * ─────────────────────────────────────────────────────────────
 *  Le nom de la boutique s'écrit, puis la boutique apparaît.
 *
 *  C'est un rideau posé PAR-DESSUS le site, pas une étape avant lui :
 *  la page se charge derrière pendant que le nom s'écrit. L'écran ne
 *  retarde donc aucun affichage, et il se retire tout seul au bout
 *  d'une seconde et demie — ou dès qu'on le touche.
 *
 *  Il ne se montre qu'une fois par visite, jamais dans l'espace
 *  boutique, et jamais quand le téléphone est réglé sur « animations
 *  réduites ».
 */
export function EcranEntree() {
  const [etat, setEtat] = useState<'ecrit' | 'sort' | 'fini'>(() =>
    dejaVu() ? 'fini' : 'ecrit',
  );

  useEffect(() => {
    if (etat === 'fini') return;
    noter();
    const total = NOM.length * PAS + REPOS;
    const versSortie = window.setTimeout(() => setEtat('sort'), total);
    const versFin = window.setTimeout(() => setEtat('fini'), total + SORTIE);
    return () => {
      window.clearTimeout(versSortie);
      window.clearTimeout(versFin);
    };
    // Volontairement au montage seulement : la minuterie ne se relance pas.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (etat === 'fini') return null;

  return (
    <div
      // Purement décoratif : les lecteurs d'écran annoncent déjà le nom du
      // site dans l'en-tête, inutile de le répéter ici.
      aria-hidden="true"
      onClick={() => setEtat('sort')}
      className={cn(
        'fixed inset-0 z-[120] grid place-items-center bg-[linear-gradient(160deg,#c1498b_0%,#a33370_45%,#5b203f_100%)]',
        etat === 'sort' && 'entree-sortie pointer-events-none',
      )}
    >
      <div className="text-center">
        <p className="font-entree text-[clamp(52px,17vw,104px)] font-semibold leading-none tracking-[0.01em] text-[#fdeef5] drop-shadow-[0_3px_0_rgba(91,32,63,0.28)]">
          {NOM.split('').map((lettre, index) => (
            <span
              key={`${lettre}-${index}`}
              className="entree-lettre"
              style={{ animationDelay: `${index * PAS}ms` }}
            >
              {lettre}
            </span>
          ))}
        </p>
        <p
          className="entree-lettre mt-3 text-[13px] uppercase tracking-[0.42em] text-[#f6d7e6]"
          style={{ animationDelay: `${NOM.length * PAS}ms` }}
        >
          Luméa
        </p>
      </div>
    </div>
  );
}
