import { Banknote, MessagesSquare, PackageSearch, Store } from 'lucide-react';
import { Reveal } from '@/src/components/ui/Reveal';

/** Engagements factuels, vérifiables sur le site — aucun chiffre inventé. */
const POINTS = [
  { icon: Banknote, title: 'Prix en FCFA', text: 'Aucun taux de change à calculer soi-même.' },
  { icon: MessagesSquare, title: 'Montant confirmé avant paiement', text: 'Pour toute commande SHEIN.' },
  { icon: Store, title: 'Livraison ou retrait', text: 'Saint-Louis, environs, Louga, Thiès et Dakar.' },
  { icon: PackageSearch, title: 'Suivi par numéro', text: 'Chaque commande a son numéro.' },
];

export function TrustRow() {
  return (
    <section className="container-page mt-20">
      <Reveal>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 rounded-[--radius-lg] border border-line bg-blush/45 p-6 lg:grid-cols-4 lg:p-8">
          {POINTS.map((point) => (
            <li key={point.title} className="flex gap-3">
              <point.icon className="mt-0.5 size-5 shrink-0 text-mauve" strokeWidth={1.5} />
              <div>
                <p className="text-[13.5px] font-medium leading-snug">{point.title}</p>
                <p className="mt-1 text-[12.5px] leading-snug text-stone">{point.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
