import { useEffect, useRef } from 'react';
import { cn } from '@/src/lib/cn';

/**
 * Galerie produit.
 *
 * Sur téléphone, on fait défiler les photos au doigt : un simple conteneur à
 * défilement horizontal avec accrochage, plutôt qu'un carrousel en JavaScript.
 * C'est le geste que les clientes connaissent déjà, et ça reste fluide sur une
 * connexion mobile.
 *
 * L'index est piloté par le parent : sur une fiche « Pièce unique », faire
 * défiler sélectionne le modèle correspondant, et choisir un modèle amène sa
 * photo. Les deux sens fonctionnent.
 */
export function Gallery({
  images,
  alt,
  labels,
  activeIndex,
  onIndexChange,
}: {
  images: string[];
  alt: string;
  /** Libellé de chaque photo (nom du modèle), affiché sous la galerie. */
  labels?: string[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
}) {
  const list = images.length > 0 ? images : [''];
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  /**
   * Position visée par un défilement programmé.
   *
   * Tant qu'elle n'est pas atteinte, les événements de défilement sont ignorés :
   * l'animation traverse les photos intermédiaires, et les prendre pour un geste
   * de la cliente ferait osciller la galerie sans fin. Un simple délai fixe ne
   * suffit pas — un saut de la photo 1 à la photo 9 dure bien plus longtemps
   * qu'un saut d'une photo à la suivante.
   */
  const pending = useRef<number | null>(null);

  // Le parent change de modèle : on amène la photo correspondante.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const target = activeIndex * scroller.clientWidth;
    const distance = Math.abs(scroller.scrollLeft - target);
    if (distance < 8) {
      pending.current = null;
      return;
    }
    pending.current = target;
    // Au-delà de deux photos, l'animation devient longue et donne le tournis :
    // on saute directement.
    const smooth = distance <= scroller.clientWidth * 2;
    scroller.scrollTo({ left: target, behavior: smooth ? 'smooth' : 'auto' });
    // Filet de sécurité si l'animation n'arrive jamais au bout (onglet en
    // arrière-plan, animations désactivées) : on ne reste pas bloqué.
    const timer = window.setTimeout(() => {
      pending.current = null;
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [activeIndex]);

  // La cliente fait défiler : on remonte le modèle atteint.
  const handleScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller || scroller.clientWidth === 0) return;
    if (pending.current !== null) {
      if (Math.abs(scroller.scrollLeft - pending.current) < 8) pending.current = null;
      return;
    }
    const index = Math.round(scroller.scrollLeft / scroller.clientWidth);
    if (index !== activeIndex && index >= 0 && index < list.length) onIndexChange(index);
  };

  // La cliente pose le doigt sur la galerie : elle reprend la main, même si une
  // animation était en cours.
  const handlePointerDown = () => {
    pending.current = null;
  };

  const single = list.length === 1;

  return (
    /*
     * `min-w-0` : sans lui, la galerie est un élément de grille dont la largeur
     * minimale est calculée sur son contenu. Passé un certain nombre de photos,
     * elle déborde de sa colonne, le téléphone dézoome pour tout faire tenir, et
     * toute la fiche produit rétrécit. Le défilement horizontal doit rester à
     * l'intérieur de la galerie, jamais sur la page.
     */
    <div className="min-w-0">
      <div className="relative overflow-hidden rounded-[--radius-lg] bg-blush">
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          onPointerDown={handlePointerDown}
          className={cn(
            'no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain',
            single && 'overflow-x-hidden',
          )}
        >
          {list.map((image, index) => (
            <div key={`${image}-${index}`} className="aspect-[4/5] max-h-[56vh] w-full shrink-0 snap-center sm:max-h-none">
              {image ? (
                <img
                  src={image}
                  alt={labels?.[index] ? `${alt} — ${labels[index]}` : alt}
                  className="size-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  draggable={false}
                />
              ) : (
                <div className="grid size-full place-items-center text-sm text-stone">Photo à venir</div>
              )}
            </div>
          ))}
        </div>

        {!single && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
            <div className="flex items-center gap-1.5 rounded-full bg-ink/45 px-2.5 py-1.5 backdrop-blur-sm">
              {list.map((_, index) => (
                <span
                  key={index}
                  className={cn(
                    'block size-1.5 rounded-full transition-all duration-300',
                    index === activeIndex ? 'w-4 bg-ivory' : 'bg-ivory/55',
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {!single && (
        <>
          <p className="mt-2.5 text-center text-[12.5px] text-stone" aria-live="polite">
            {labels?.[activeIndex]
              ? `${labels[activeIndex]} — ${activeIndex + 1} sur ${list.length}`
              : `Photo ${activeIndex + 1} sur ${list.length}`}
          </p>

          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
            {list.map((image, index) => (
              <button
                key={`${image}-thumb-${index}`}
                type="button"
                onClick={() => onIndexChange(index)}
                aria-label={labels?.[index] ? `Voir ${labels[index]}` : `Voir la photo ${index + 1}`}
                aria-current={activeIndex === index}
                className={cn(
                  'press size-16 shrink-0 overflow-hidden rounded-[--radius-xs] border-2 transition-colors',
                  activeIndex === index ? 'border-mauve' : 'border-transparent',
                )}
              >
                <img src={image} alt="" className="size-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
