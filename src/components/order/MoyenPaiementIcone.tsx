import { Banknote } from 'lucide-react';
import { cn } from '@/src/lib/cn';

/**
 * ─────────────────────────────────────────────────────────────
 *  PASTILLES DES MOYENS DE PAIEMENT
 * ─────────────────────────────────────────────────────────────
 *  Une cliente repère Wave et Orange Money à leur couleur avant de lire
 *  leur nom. La pastille sert exactement à ça : reconnaître le moyen de
 *  paiement d'un coup d'œil, dans la liste comme sur la confirmation.
 *
 *  Ce ne sont PAS les logos officiels de Wave ni d'Orange — ces marques
 *  ne nous appartiennent pas et leurs fichiers ne sont pas dans le
 *  dépôt. Ce sont des repères dessinés à la main, aux couleurs de
 *  chaque service. Le jour où la boutique obtient les vrais visuels,
 *  ils remplacent ces tracés sans rien changer ailleurs.
 */
export function MoyenPaiementIcone({ id, className }: { id: string; className?: string }) {
  const base = cn('grid size-9 shrink-0 place-items-center rounded-[10px]', className);

  if (id === 'wave') {
    return (
      <span className={cn(base, 'bg-[#1dc4f2]')} aria-hidden="true">
        {/* Une vague : deux ondulations blanches sur le bleu de Wave. */}
        <svg viewBox="0 0 24 24" className="size-[22px]" fill="none">
          <path
            d="M2 9c2.2-3 4.4-3 6.6 0s4.4 3 6.6 0 4.4-3 6.6 0"
            stroke="#fff"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          <path
            d="M2 15c2.2-3 4.4-3 6.6 0s4.4 3 6.6 0 4.4-3 6.6 0"
            stroke="#fff"
            strokeWidth="2.1"
            strokeLinecap="round"
            opacity="0.75"
          />
        </svg>
      </span>
    );
  }

  if (id === 'orange_money') {
    return (
      <span className={cn(base, 'bg-[#ff7900]')} aria-hidden="true">
        {/* Le carré orange, marque de fabrique de l'opérateur, et ses initiales. */}
        <span className="text-[12px] font-bold leading-none tracking-tight text-white">OM</span>
      </span>
    );
  }

  // Paiement à la livraison : des billets, rien de plus.
  return (
    <span className={cn(base, 'bg-cream text-graphite')} aria-hidden="true">
      <Banknote className="size-[19px]" strokeWidth={1.7} />
    </span>
  );
}
