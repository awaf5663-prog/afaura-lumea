import { Eye, HeartHandshake, MapPin, Sparkles, TrendingUp } from 'lucide-react';
import atelier from '@/src/assets/images/atelier-editorial.webp';
import fondatrice from '@/src/assets/images/fondatrice.webp';
import { WhatsAppLink } from '@/src/components/whatsapp/WhatsAppLink';
import { Button } from '@/src/components/ui/Button';
import { Reveal } from '@/src/components/ui/Reveal';
import { BRAND } from '@/src/config/site';
import { useRouter } from '@/src/lib/router';
import { useSeo } from '@/src/lib/seo';

/*
 * Cinq engagements, écrits par la boutique elle-même.
 *
 * Règle tenue ici comme ailleurs : on n'écrit que ce qui est réellement tenu.
 * Pas de délai chiffré, pas de « satisfaction garantie », pas de promesse de
 * remboursement — la boutique ne s'engage que sur ce qu'elle maîtrise.
 */
const ENGAGEMENTS = [
  {
    icon: Eye,
    title: 'La transparence',
    text: "Le montant vous est confirmé avant que vous payiez quoi que ce soit. Quand un tarif n'est pas encore fixé, nous vous le disons au lieu d'afficher un prix approximatif.",
  },
  {
    icon: Sparkles,
    title: 'La sélection',
    text: "Chaque pièce est choisie une par une. Nous préférons un catalogue court, dont nous savons défendre chaque article, plutôt qu'une liste interminable.",
  },
  {
    icon: HeartHandshake,
    title: "L'accompagnement",
    text: "Vous n'êtes pas une ligne dans un tableau. Une question sur une taille, un doute sur une matière, un changement d'avis : écrivez, on répond.",
  },
  {
    icon: MapPin,
    title: 'La proximité',
    text: 'Nous rapprochons peu à peu le retrait de chez vous. Saint-Louis et ses environs pour commencer, puis Louga, Thiès et Dakar.',
  },
  {
    icon: TrendingUp,
    title: "L'amélioration continue",
    text: "Nous sommes une jeune marque et nous le disons. Vos retours nous servent vraiment : ce site a déjà changé plusieurs fois grâce à des remarques de clientes.",
  },
];

/** Les critères de sélection, tels que la boutique les applique. */
const CRITERES = ['L’esthétique', 'L’utilité', 'Le rapport qualité-prix', 'La tendance', 'Les avis disponibles'];

export function AboutPage() {
  const { navigate } = useRouter();

  useSeo({
    title: 'À propos',
    description:
      "L'histoire d'Afaura Luméa, jeune marque sénégalaise de voiles et d'abayas basée à Saint-Louis : d'où vient le nom, ce que nous promettons, comment nous choisissons nos articles.",
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      mainEntity: {
        '@type': 'Organization',
        name: BRAND.name,
        slogan: BRAND.tagline,
        address: { '@type': 'PostalAddress', addressLocality: 'Saint-Louis', addressCountry: 'SN' },
      },
    },
  });

  return (
    <div className="pt-8">
      <section className="container-page">
        <p className="eyebrow">La marque</p>
        <h1 className="mt-3 max-w-3xl text-[36px] leading-[1.07] sm:text-[50px]">
          Une marque qui commence petit, mais qui pense grand.
        </h1>
        <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-graphite">
          Afaura Luméa est née d’une idée simple : rendre l’achat en ligne plus facile, plus
          accessible et plus fiable, ici, au Sénégal. Pas seulement vendre — accompagner, depuis
          le moment où vous repérez une pièce jusqu’à celui où vous l’avez entre les mains.
        </p>

        <Reveal className="mt-10 overflow-hidden rounded-[--radius-lg] border border-line">
          <img
            src={atelier}
            alt="Voiles et tissus pliés dans une lumière douce"
            width={1400}
            height={784}
            className="h-full w-full object-cover"
          />
        </Reveal>
      </section>

      <section className="container-page mt-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-[28px] sm:text-[34px]">D’où vient le nom</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-graphite">
              <strong className="font-medium text-ink">Afaura</strong> reprend les initiales de
              celle qui a fondé la marque — c’est une signature discrète, une manière de dire que
              derrière la boutique il y a quelqu’un, et pas une enseigne anonyme.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-graphite">
              <strong className="font-medium text-ink">Luméa</strong> vient de la lumière. Il porte
              l’idée de clarté, d’élégance et de modernité — ce que nous cherchons dans les pièces
              que nous proposons, et dans la façon dont nous travaillons.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <h2 className="text-[28px] sm:text-[34px]">Une jeune marque, et ça se dit</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-graphite">
              Afaura Luméa est en pleine construction. Nous préférons installer un service solide et
              une communauté de clientes fidèles plutôt que de grandir trop vite et mal.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-graphite">
              Concrètement, la boutique s’organise aujourd’hui autour de trois choses : les voiles et
              abayas de notre sélection, commandés pour vous ; les commandes SHEIN, que nous
              vérifions et chiffrons avant tout paiement ; et les groupages, qui permettent de
              partager les frais d’acheminement au lieu de les payer seule.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="container-page mt-20">
        <Reveal>
          <h2 className="text-[28px] sm:text-[34px]">Ce sur quoi nous nous engageons</h2>
          <p className="mt-3 max-w-2xl text-[14.5px] text-stone">
            Cinq engagements, et seulement ceux que nous savons tenir.
          </p>
        </Reveal>

        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ENGAGEMENTS.map((item, index) => (
            <Reveal
              as="li"
              key={item.title}
              delay={index * 60}
              className="rounded-[--radius-lg] border border-line bg-white p-6"
            >
              <item.icon className="size-5 text-mauve" />
              <h3 className="mt-3 font-display text-[19px]">{item.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-graphite">{item.text}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="container-page mt-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-[28px] sm:text-[34px]">Comment nous choisissons nos articles</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-graphite">
              Nous ne cherchons pas seulement le moins cher. Une pièce entre au catalogue quand elle
              tient sur plusieurs points à la fois :
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {CRITERES.map((critere) => (
                <li
                  key={critere}
                  className="rounded-full border border-line bg-cream/70 px-3.5 py-1.5 text-[13px] text-graphite"
                >
                  {critere}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[15px] leading-relaxed text-graphite">
              Nous préférons proposer moins d’articles, mais avoir une vraie raison de les mettre en
              avant — plutôt que de remplir le catalogue pour faire du volume.
            </p>
          </Reveal>

          <Reveal delay={80}>
            <h2 className="text-[28px] sm:text-[34px]">Où récupérer vos commandes</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-graphite">
              À Saint-Louis, vous pouvez être livrée ou récupérer votre commande en main propre au
              point de retrait. Nous livrons aussi les environs, et jusqu’à Louga, Thiès et Dakar.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-graphite">
              L’adresse exacte, l’horaire ou les frais dépendent de votre ville : ils vous sont
              communiqués sur WhatsApp au moment de la commande, avant que vous payiez.
            </p>
            <Button variant="secondary" className="mt-6" onClick={() => navigate('/comment-ca-marche')}>
              Voir les zones et les frais
            </Button>
          </Reveal>
        </div>
      </section>

      <section className="container-page mt-20">
        <Reveal className="rounded-[--radius-lg] border border-line bg-blush/35 p-8 sm:p-12">
          <div className="grid items-center gap-8 md:grid-cols-[minmax(0,320px)_1fr] md:gap-12">
            {/*
              Le portrait de la fondatrice. C'est la pièce qui lève le doute :
              une cliente qui s'apprête à payer par Wave veut voir à qui elle
              a affaire. Cadré en 4:5, il garde ses proportions à toutes les
              largeurs — d'où le rapport fixé plutôt qu'une hauteur devinée.
            */}
            <img
              src={fondatrice}
              alt="Portrait de la fondatrice d’Afaura Luméa"
              width={1020}
              height={1275}
              className="aspect-[4/5] w-full max-w-[320px] justify-self-center rounded-[--radius-lg] object-cover shadow-lg shadow-black/5 md:justify-self-start"
            />

            <div>
              <p className="eyebrow">Derrière la marque</p>
              <h2 className="mt-3 text-[28px] leading-snug sm:text-[34px]">
                Une jeune entrepreneure, passionnée de création et de digital.
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-graphite">
                Afaura Luméa, c’est l’envie de transformer une idée en quelque chose de concret.
                C’est aussi un espace d’expérimentation : on teste, on apprend, on corrige, et on
                construit petit à petit une marque qui nous ressemble.
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-graphite">
                Nous ne prétendons pas être parfaites dès le départ. Nous préférons le dire
                franchement, et grandir avec vous. C’est aussi pour ça que chaque remarque compte.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="container-page mt-16 mb-4">
        <div className="rounded-[--radius-lg] border border-line bg-white p-8 text-center">
          <h2 className="text-[24px] sm:text-[28px]">Bienvenue chez Afaura Luméa</h2>
          <p className="mx-auto mt-2 max-w-lg text-[14.5px] text-stone">
            {/* Espace insécable avant le « ? » : sinon il se retrouve seul en début de ligne. */}
            Une question, un doute, une pièce que vous cherchez sans la trouver&nbsp;? Écrivez-nous,
            on répond nous-mêmes.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={() => navigate('/boutique')}>Découvrir la boutique</Button>
            <WhatsAppLink
              message="Bonjour, je viens de lire votre page À propos."
              className="h-12 w-auto text-[14px]"
            >
              Écrire sur WhatsApp
            </WhatsAppLink>
          </div>
        </div>
      </section>
    </div>
  );
}
