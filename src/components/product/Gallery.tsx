import { useState } from 'react';
import { cn } from '@/src/lib/cn';

/** Galerie produit : défilement horizontal natif sur mobile, vignettes cliquables. */
export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const list = images.length > 0 ? images : [''];

  return (
    <div>
      <div className="relative overflow-hidden rounded-[--radius-lg] bg-cream">
        <div className="aspect-[4/5] max-h-[56vh] w-full sm:max-h-none">
          {list[active] ? (
            <img
              src={list[active]}
              alt={alt}
              className="animate-fade size-full object-cover"
              decoding="async"
            />
          ) : (
            <div className="grid size-full place-items-center text-sm text-stone">Photo à venir</div>
          )}
        </div>
      </div>

      {list.length > 1 && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {list.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Voir la photo ${index + 1}`}
              aria-current={active === index}
              className={cn(
                'press size-16 shrink-0 overflow-hidden rounded-[--radius-xs] border-2',
                active === index ? 'border-ink' : 'border-transparent',
              )}
            >
              <img src={image} alt="" className="size-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
