import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/src/components/ui/Button';
import { useSettings } from '@/src/hooks/useSettings';
import { cn } from '@/src/lib/cn';
import { useRouter } from '@/src/lib/router';
import { useSeo } from '@/src/lib/seo';
import { isWhatsappConfigured, whatsappLink } from '@/src/lib/whatsapp';

const FAQ = [
  {
    q: 'Êtes-vous SHEIN ?',
    a: "Non. Nous sommes un service indépendant de commande groupée basé à Dakar. Nous achetons pour vous les articles que vous nous indiquez et organisons leur acheminement. Nous n'avons aucun lien officiel avec la marque.",
  },
  {
    q: 'Comment se passe une commande SHEIN ?',
    a: "Vous repérez vos articles sur SHEIN, vous nous transmettez les liens (taille, couleur, quantité) via le formulaire, nous vérifions la disponibilité, nous vous confirmons le montant total en FCFA, vous payez, et votre commande part avec le prochain groupage.",
  },
  {
    q: 'Puis-je vous envoyer directement mon panier SHEIN ?',
    a: "Il n'existe pas de connexion automatique entre SHEIN et notre site : personne ne peut récupérer votre panier à votre place. Le formulaire est prévu pour aller vite — un lien copié depuis l'application suffit pour chaque article, et vous pouvez ajouter une capture d'écran.",
  },
  {
    q: 'Quand dois-je payer ?',
    a: "Pour les pièces de la boutique, au moment de la commande ou à la livraison selon le mode choisi. Pour SHEIN, uniquement après que nous vous avons confirmé le montant total : rien n'est demandé avant.",
  },
  {
    q: 'Quels moyens de paiement acceptez-vous ?',
    a: "Wave, Orange Money, et le paiement à la livraison pour Dakar et la banlieue. Après un paiement mobile, envoyez-nous la capture de confirmation sur WhatsApp.",
  },
  {
    q: 'Combien coûte la livraison ?',
    a: "Cela dépend de la zone. Les frais fixés sont affichés au moment de la commande ; lorsqu'une zone n'a pas encore de tarif défini, nous vous confirmons le montant sur WhatsApp avant paiement plutôt que d'afficher un prix approximatif.",
  },
  {
    q: 'Combien de temps prend le groupage ?',
    a: "La date de clôture du prochain départ est affichée sur le site quand elle est fixée. Le délai d'acheminement dépend du transporteur : nous vous communiquons l'estimation au moment de la confirmation.",
  },
  {
    q: 'Comment suivre ma commande ?',
    a: "Chaque commande reçoit un numéro (CMD-… ou SHEIN-…). Depuis la page Suivi, entrez ce numéro et votre numéro WhatsApp pour voir l'étape en cours.",
  },
  {
    q: 'Et si un article ne me va pas ?',
    a: "Écrivez-nous sur WhatsApp en précisant votre numéro de commande. Nous regardons ensemble ce qui est possible selon l'article et le moment où vous nous contactez.",
  },
];

export function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);
  const { settings } = useSettings();
  const { navigate } = useRouter();
  const number = settings?.whatsappNumber ?? '';

  useSeo({
    title: 'Questions fréquentes',
    description:
      'Paiement, livraison, groupage, suivi, service SHEIN : les réponses aux questions les plus posées.',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQ.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  });

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow">FAQ</p>
        <h1 className="mt-3 text-[34px] sm:text-[44px]">Questions fréquentes</h1>

        <ul className="mt-8 border-t border-line">
          {FAQ.map((item, index) => {
            const isOpen = open === index;
            return (
              <li key={item.q} className="border-b border-line">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="font-display text-[19px] leading-snug">{item.q}</span>
                  <ChevronDown
                    className={cn(
                      'size-5 shrink-0 text-stone transition-transform duration-300',
                      isOpen && 'rotate-180',
                    )}
                  />
                </button>
                {isOpen && (
                  <p className="animate-fade pb-5 text-[14.5px] leading-relaxed text-graphite">{item.a}</p>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-10 rounded-[--radius-lg] border border-line bg-white p-6 text-center">
          <h2 className="text-[22px]">Vous ne trouvez pas votre réponse ?</h2>
          <p className="mt-2 text-[14px] text-stone">Écrivez-nous, on répond directement.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            {isWhatsappConfigured(number) ? (
              <Button
                variant="whatsapp"
                onClick={() =>
                  window.open(whatsappLink(number, 'Bonjour, j’ai une question.'), '_blank', 'noopener')
                }
              >
                Écrire sur WhatsApp
              </Button>
            ) : null}
            <Button variant="secondary" onClick={() => navigate('/comment-ca-marche')}>
              Voir comment ça marche
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
