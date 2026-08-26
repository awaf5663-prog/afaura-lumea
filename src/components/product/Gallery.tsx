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
  /** Évite que le défilement programmé ne soit réinterprété comme un geste. */
  const programmatic = useRef(false);

  // Le parent change de modèle : on amène la photo correspondante.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const target = activeIndex * scroller.clientWidth;
    if (Math.abs(scroller.scrollLeft - target) < 8) return;
    programmatic.current = true;
    scroller.scrollTo({ left: target, behavior: 'smooth' });
    const timer = window.setTimeout(() => {
      programmatic.current = false;
    }, 450);
    return () => window.clearTimeout(timer);
  }, [activeIndex]);

  // La cliente fait défiler : on remonte le modèle atteint.
  const handleScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller || programmatic.current || scroller.clientWidth === 0) return;
    const index = Math.round(scroller.scrollLeft / scroller.clientWidth);
    if (index !== activeIndex && index >= 0 && index < list.length) onIndexChange(index);
  };

  const single = list.length === 1;

  return (
    <div>
      <div className="relative overflow-hidden rounded-[--radius-lg] bg-blush">
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
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
