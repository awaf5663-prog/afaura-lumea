import { Banknote } from 'lucide-react';
import orangeMoney from '@/src/assets/paiement/orange-money.webp';
import wave from '@/src/assets/paiement/wave.webp';
import { cn } from '@/src/lib/cn';

/**
 * ─────────────────────────────────────────────────────────────
 *  LOGOS DES MOYENS DE PAIEMENT
 * ─────────────────────────────────────────────────────────────
 *  Une cliente reconnaît Wave et Orange Money à leur logo avant de lire
 *  leur nom. Ce sont les vrais visuels, fournis par la boutique, utilisés
 *  pour ce qu'ils sont : indiquer par quel service on règle.
 *
 *  Pour en changer : remplacer le fichier dans src/assets/paiement.
 */
const LOGOS: Record<string, { src: string; nom: string }> = {
  wave: { src: wave, nom: 'Wave' },
  orange_money: { src: orangeMoney, nom: 'Orange Money' },
};

export function MoyenPaiementIcone({ id, className }: { id: string; className?: string }) {
  const logo = LOGOS[id];

  if (logo) {
    return (
      <img
        src={logo.src}
        // Le nom du moyen de paiement est déjà écrit juste à côté : le
        // répéter ferait dire deux fois la même chose à un lecteur d'écran.
        alt=""
        width={36}
        height={36}
        loading="lazy"
        decoding="async"
        className={cn('size-9 shrink-0 rounded-[10px] object-cover', className)}
      />
    );
  }

  // Paiement à la livraison : des billets, rien de plus.
  return (
    <span
      className={cn('grid size-9 shrink-0 place-items-center rounded-[10px] bg-cream text-graphite', className)}
      aria-hidden="true"
    >
      <Banknote className="size-[19px]" strokeWidth={1.7} />
    </span>
  );
}
