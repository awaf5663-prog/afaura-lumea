import { BadgeCheck, CreditCard, MessageCircle, PackageCheck, ShoppingBag, Sparkles, Truck } from 'lucide-react';
import { Reveal } from '@/src/components/ui/Reveal';
import { cn } from '@/src/lib/cn';

const STORE_STEPS = [
  { icon: ShoppingBag, title: 'Je choisis', text: 'Les pièces de la boutique sont déjà là, prêtes à partir.' },
  { icon: BadgeCheck, title: "J'ajoute au panier", text: 'Quantités et options modifiables jusqu’au dernier moment.' },
  { icon: CreditCard, title: 'Je confirme', text: 'Coordonnées, livraison, paiement : trois champs, c’est réglé.' },
  { icon: Truck, title: 'Je reçois', text: 'Livraison à Saint-Louis ou retrait au point convenu.' },
];

const SHEIN_STEPS = [
  { icon: Sparkles, title: 'Je choisis sur SHEIN', text: 'Je fais mon repérage tranquillement sur l’application.' },
  { icon: MessageCircle, title: 'Je transmets', text: 'Lien, taille, couleur, quantité — le formulaire fait le reste.' },
  { icon: CreditCard, title: 'Je paie le montant confirmé', text: 'Vous recevez le total en FCFA avant de payer quoi que ce soit.' },
  { icon: PackageCheck, title: 'Je reçois au groupage', text: 'La commande part avec le prochain départ, suivi communiqué.' },
];

export function HowItWorks({ variant = 'both' }: { variant?: 'both' | 'store' | 'shein' }) {
  return (
    <section id="comment" className="container-page mt-24">
      <Reveal>
        <p className="eyebrow">Comment ça marche</p>
        <h2 className="mt-3 max-w-xl text-[30px] sm:text-[38px]">
          Deux façons de commander, aucune mauvaise surprise.
        </h2>
      </Reveal>

      <div className={cn('mt-10 grid gap-12', variant === 'both' && 'lg:grid-cols-2 lg:gap-16')}>
        {variant !== 'shein' && <StepColumn label="Pièces disponibles" steps={STORE_STEPS} />}
        {variant !== 'store' && <StepColumn label="Commande SHEIN" steps={SHEIN_STEPS} accent />}
      </div>
    </section>
  );
}

function StepColumn({
  label,
  steps,
  accent,
}: {
  label: string;
  steps: typeof STORE_STEPS;
  accent?: boolean;
}) {
  return (
    <div>
      <p
        className={cn(
          'inline-flex rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]',
          accent ? 'bg-blush text-mauve' : 'bg-sand text-graphite',
        )}
      >
        {label}
      </p>
      <ol className="mt-6">
        {steps.map((step, index) => (
          <Reveal key={step.title} delay={index * 70} as="li">
            <div className="flex gap-4 py-4">
              <div className="relative flex flex-col items-center">
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-white">
                  <step.icon className="size-[18px]" strokeWidth={1.5} />
                </span>
                {index < steps.length - 1 && <span className="mt-2 w-px flex-1 bg-line" aria-hidden />}
              </div>
              <div className="pb-2">
                <p className="font-display text-[19px] leading-snug">
                  <span className="mr-2 text-stone">{index + 1}.</span>
                  {step.title}
                </p>
                <p className="mt-1 text-[14px] leading-relaxed text-stone">{step.text}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
