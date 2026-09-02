import { Ruler, Sparkles } from 'lucide-react';
import { useState } from 'react';
import afficheMesures from '@/src/assets/guides/guide-mesures.webp';
import afficheMorphologies from '@/src/assets/guides/guide-morphologies.webp';
import { Button } from '@/src/components/ui/Button';
import { Sheet } from '@/src/components/ui/Sheet';
import {
  MESURES_AFFICHE,
  MORPHOLOGIES,
  RAPPEL_MESURES,
  RAPPEL_MORPHOLOGIE,
} from '@/src/config/morphologies';

/**
 * GUIDE DES MESURES ET DES MORPHOLOGIES
 *
 * Deux affiches d'Afaura Luméa, consultables partout où une taille se choisit :
 * sur la page du guide, et surtout AVANT de valider une commande ou une demande
 * SHEIN — un vêtement commandé à l'étranger ne se ré-essaie pas.
 *
 * Le texte des affiches est repris en clair à côté de l'image : une image ne se
 * lit pas sur un petit écran, ne se cherche pas, et ne se laisse pas lire à
 * voix haute.
 */

export const AFFICHE_MESURES = afficheMesures;
export const AFFICHE_MORPHOLOGIES = afficheMorphologies;

/** Une affiche, avec son lien pour l'ouvrir en grand. */
export function Affiche({
  src,
  alt,
  legende,
}: {
  src: string;
  alt: string;
  legende: string;
}) {
  return (
    <figure className="overflow-hidden rounded-[--radius-md] border border-line bg-white">
      <img src={src} alt={alt} loading="lazy" className="w-full" />
      <figcaption className="flex items-center justify-between gap-3 border-t border-line px-4 py-2.5 text-[12px] text-stone">
        <span>{legende}</span>
        {/*
          Lien direct vers le fichier de l'image : il s'ouvre à part, sans
          quitter la page ni perdre ce qui est déjà saisi.
        */}
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 underline underline-offset-2"
        >
          Voir en grand
        </a>
      </figcaption>
    </figure>
  );
}

/** Les trois mesures, en toutes lettres. */
export function CommentMesurer({ compact = false }: { compact?: boolean }) {
  return (
    <div>
      <p className="text-[13px] leading-relaxed text-graphite">
        Pour un ajustement parfait, prenez vos mesures directement sur votre corps, sans trop
        serrer.
      </p>
      <ul className={compact ? 'mt-3 space-y-2' : 'mt-4 grid gap-3 sm:grid-cols-3'}>
        {MESURES_AFFICHE.map((mesure) => (
          <li key={mesure.id} className="rounded-[--radius-md] border border-line bg-white p-3.5">
            <p className="text-[14px] font-medium">{mesure.nom}</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-stone">{mesure.hint}</p>
          </li>
        ))}
      </ul>
      <p className="mt-3 rounded-[--radius-sm] bg-cream/70 px-3.5 py-2.5 text-[12px] leading-relaxed text-graphite">
        <strong className="font-medium">Rappel.</strong> {RAPPEL_MESURES}
      </p>
    </div>
  );
}

/** Les cinq morphologies, en toutes lettres. */
export function LesMorphologies({ compact = false }: { compact?: boolean }) {
  return (
    <div>
      <p className="text-[13px] leading-relaxed text-graphite">
        Connaître votre morphologie vous aide à choisir des vêtements qui mettent votre silhouette
        en valeur et dans lesquels vous vous sentez bien.
      </p>
      <ul className={compact ? 'mt-3 space-y-2.5' : 'mt-4 grid gap-3 sm:grid-cols-2'}>
        {MORPHOLOGIES.map((m) => (
          <li key={m.id} className="rounded-[--radius-md] border border-line bg-white p-4">
            <p className="text-[14.5px] font-medium">
              {m.nom} <span className="text-[12px] font-normal text-stone">({m.anglais})</span>
            </p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-stone">{m.silhouette}</p>
            <p className="mt-2 rounded-[--radius-sm] bg-blush/50 px-3 py-2 text-[12.5px] leading-relaxed text-graphite">
              <span className="font-medium">Conseil style :</span> {m.conseil}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-[12px] italic text-mauve">
              <Sparkles className="size-3.5 shrink-0" strokeWidth={1.8} /> {m.mot}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-3 rounded-[--radius-sm] bg-cream/70 px-3.5 py-2.5 text-[12px] leading-relaxed text-graphite">
        <strong className="font-medium">Rappel.</strong> {RAPPEL_MORPHOLOGIE}
      </p>
    </div>
  );
}

/** Le guide entier dans un panneau, sans quitter le formulaire en cours. */
export function PanneauGuide({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      side="bottom"
      title="Vos mesures et votre morphologie"
      footer={
        <Button full onClick={onClose}>
          J'ai vérifié, je continue
        </Button>
      }
    >
      <section>
        <h3 className="flex items-center gap-2 text-[18px]">
          <Ruler className="size-4 text-mauve" strokeWidth={1.8} /> Comment prendre vos mesures
        </h3>
        <div className="mt-3">
          <CommentMesurer compact />
        </div>
        <div className="mt-4">
          <Affiche
            src={afficheMesures}
            alt="Guide des mesures Afaura Luméa : buste, taille et hanches, avec la façon de placer le mètre."
            legende="Guide des mesures"
          />
        </div>
      </section>

      <section className="mt-8">
        <h3 className="text-[18px]">Identifiez votre morphologie</h3>
        <div className="mt-3">
          <LesMorphologies compact />
        </div>
        <div className="mt-4">
          <Affiche
            src={afficheMorphologies}
            alt="Guide des morphologies Afaura Luméa : sablier, triangle, ronde, rectangle et triangle inversé, avec un conseil de style pour chacune."
            legende="Guide des morphologies"
          />
        </div>
      </section>
    </Sheet>
  );
}

/**
 * Le rappel posé juste avant le bouton d'envoi.
 *
 * Il ne bloque rien et ne demande rien : une commande part sans qu'on ait
 * saisi la moindre mesure. Il met le guide à portée de doigt au seul moment
 * où il sert vraiment.
 */
export function RappelMesures({ contexte }: { contexte: 'boutique' | 'shein' }) {
  const [ouvert, setOuvert] = useState(false);

  return (
    <>
      <div className="rounded-[--radius-md] border border-line bg-blush/40 p-4">
        <p className="flex items-center gap-2 text-[14px] font-medium">
          <Ruler className="size-4 text-mauve" strokeWidth={1.8} /> Avant de valider : votre taille
        </p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-graphite">
          {contexte === 'shein'
            ? "Les tailles varient beaucoup d'un article SHEIN à l'autre. Prenez vos mesures et comparez-les au tableau affiché sur la fiche de l'article avant d'envoyer votre demande."
            : 'Une pièce est commandée pour vous : vérifiez la taille choisie avec vos mesures avant de valider.'}
        </p>
        <button
          type="button"
          onClick={() => setOuvert(true)}
          className="press mt-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2 text-[13px]"
        >
          <Ruler className="size-3.5" strokeWidth={1.8} /> Guide des mesures et des morphologies
        </button>
      </div>

      <PanneauGuide open={ouvert} onClose={() => setOuvert(false)} />
    </>
  );
}
