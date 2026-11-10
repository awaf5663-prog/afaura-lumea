import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { WhatsAppLink } from '@/src/components/whatsapp/WhatsAppLink';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/cn';
import { useRouter } from '@/src/lib/router';
import { useSeo } from '@/src/lib/seo';

const FAQ = [
  {
    q: 'Les pièces de la boutique sont-elles en stock ?',
    a: "La plupart du temps non : vous choisissez sur le site, nous commandons la pièce pour vous, et elle arrive avec le prochain groupage. C'est ce qui nous permet de proposer ces prix. Le délai vous est confirmé sur WhatsApp avant tout paiement — nous préférons vous le dire d'avance plutôt que de vous faire attendre sans explication. Certains articles font exception : les glosses et huiles à lèvres sont gardés sur place, et leur fiche indique « disponible tout de suite ».",
  },
  {
    q: 'Êtes-vous SHEIN ?',
    a: "Non. Nous sommes un service indépendant de commande groupée basé à Saint-Louis. Nous achetons pour vous les articles que vous nous indiquez et organisons leur acheminement. Nous n'avons aucun lien officiel avec la marque.",
  },
  {
    q: 'Gérez-vous aussi les commandes groupées ALIBABA ?',
    a: "Oui ! Nous validons, commandons et acheminons vos articles et lots ALIBABA. Vous n'avez pas besoin de chercher un transitaire : Espace AFAURA prend tout en charge de A à Z (contact fournisseur, formalités fret par avion 15-20j ou bateau 2-3 mois, dédouanement et livraison à Saint-Louis, Dakar, Thiès et Louga).",
  },
  {
    q: 'Proposez-vous des tarifs pour les revendeuses et grossistes ?',
    a: "Absolument. Nos voiles et pièces d'exception sont disponibles à tarif de gros par lot de 10 pièces (dizaine) ou par lot de 12 pièces (douzaine). Consultez l'encadré « Tarif Grossiste & Revendeurs » directement sur les fiches produits pour commander vos lots à tarif remisé.",
  },
  {
    q: 'Comment rejoindre la Communauté Privée WhatsApp AFAURA ?',
    a: "Il vous suffit de cliquer sur « Rejoindre le Groupe VIP » sur notre site ! Vous intégrerez directement notre groupe privé pour découvrir les arrivages en exclusivité, les photos des lots et participer aux achats groupés.",
  },
  {
    q: 'Comment se passe une commande SHEIN ?',
    a: "Vous repérez vos articles sur SHEIN, vous nous transmettez les liens (taille, couleur, quantité) via le formulaire, nous vérifions la disponibilité, nous vous confirmons le montant total en FCFA, vous payez, et votre commande part avec le prochain groupage.",
  },
  {
    q: 'Puis-je vous envoyer directement mon panier SHEIN ou ALIBABA ?',
    a: "Il n'existe pas de connexion automatique entre SHEIN/Alibaba et notre site. Le formulaire est prévu pour aller vite — un lien copié depuis l'application suffit pour chaque article, ou vous pouvez ajouter des captures d'écran de votre panier.",
  },
  {
    q: 'Quand dois-je payer ?',
    a: "Pour les pièces de la boutique, au moment de la commande ou à la livraison selon le mode choisi. Pour SHEIN et ALIBABA, uniquement après que nous vous avons confirmé le montant total : rien n'est demandé avant.",
  },
  {
    q: 'Quels moyens de paiement acceptez-vous ?',
    a: "Wave, Orange Money (menu #144# ou transfert), et le paiement à la livraison à Saint-Louis et dans les environs. Après un paiement mobile, envoyez-nous la capture de confirmation sur WhatsApp.",
  },
  {
    q: 'Où livrez-vous ?',
    a: "À Saint-Louis et dans ses environs, et par transporteur jusqu'à Louga, Thiès et Dakar. Vous pouvez aussi récupérer votre commande en main propre au point de retrait.",
  },
  {
    q: 'Combien coûte la livraison ?',
    a: "Cela dépend de la zone. Les frais fixés sont affichés au moment de la commande ; lorsqu'une zone n'a pas encore de tarif défini, nous vous confirmons le montant sur WhatsApp avant paiement plutôt que d'afficher un prix approximatif.",
  },
  {
    q: 'Combien de temps prend le groupage ?',
    a: "Pour SHEIN, comptez environ 15 jours (2 semaines). Pour ALIBABA, le fret express avion prend 15 à 20 jours ouvrés, et le fret maritime bateau prend 2 à 3 mois maximum (idéal gros volumes économiques).",
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
  const { navigate } = useRouter();

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
            <WhatsAppLink message="Bonjour, j’ai une question." className="h-12 w-auto text-[14px]">
              Écrire sur WhatsApp
            </WhatsAppLink>
            <Button variant="secondary" onClick={() => navigate('/comment-ca-marche')}>
              Voir comment ça marche
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
