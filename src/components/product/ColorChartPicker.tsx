import { Check, Info } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { cn } from '@/src/lib/cn';
import type { ColorChart } from '@/src/types';

/**
 * Choix de la teinte par numéro.
 *
 * Le nuancier du fournisseur est numéroté : la cliente désigne un numéro
 * plutôt qu'un nom de couleur, ce qui évite les « beige » qui ne sont pas
 * le même beige. Les pastilles sont un repère visuel, pas une promesse :
 * un écran ne rend pas exactement un tissu, et le site l'écrit.
 */
export function ColorChartPicker({
  chart,
  value,
  onChange,
  error,
}: {
  chart: ColorChart;
  value: string | undefined;
  onChange: (code: string) => void;
  error?: boolean;
}) {
  const selected = chart.swatches.find((swatch) => swatch.code === value);
  const cadre = useRef<HTMLElement>(null);

  /*
   * Amener le foulard à l'œil quand il n'y est pas.
   *
   * Le nuancier fait soixante-cinq pastilles : sur un téléphone, onze rangées
   * peuvent séparer le doigt de la photo. `block: 'nearest'` ne bouge la page
   * QUE si la photo est hors de vue — choisir une teinte déjà visible ne
   * déplace rien, et personne ne se fait voler son défilement.
   */
  useEffect(() => {
    const el = cadre.current;
    if (!el) return;
    const doux = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ block: 'nearest', behavior: doux ? 'smooth' : 'auto' });
  }, [value]);

  return (
    <fieldset>
      <legend className="mb-2 text-[13px] font-medium text-graphite">
        Couleur
        {selected ? (
          <span className="ml-2 text-stone">
            n° {selected.code}
            {selected.name ? ` — ${selected.name}` : ''}
          </span>
        ) : (
          <span className="ml-2 text-mauve">à choisir</span>
        )}
      </legend>

      {/*
        L'article entier dans la teinte choisie, AU-DESSUS du nuancier.
        
        Sous la grille, il aurait été relégué à onze rangées de pastilles du
        doigt qui vient d'appuyer : personne ne l'aurait vu.
        
        Il n'apparaît que pour les teintes dont la photo est arrivée. Les
        autres se choisissent comme avant, sans cadre vide ni « photo à
        venir » — une absence annoncée attire l'œil sur ce qui manque.
      */}
      {selected?.photo && (
        <figure ref={cadre} className="mb-3 scroll-mt-[76px]">{/* 76 px : les 64 de l'entête collant, plus une marge — sinon le
              haut du foulard se range dessous en arrivant. */}
          <img
            src={selected.photo}
            alt={`Le voile en teinte numéro ${selected.code}${selected.name ? ` — ${selected.name}` : ''}`}
            loading="lazy"
            decoding="async"
            className="w-full rounded-[--radius-md] border border-line bg-white"
          />
          <figcaption className="mt-1.5 text-[12px] text-stone">
            Teinte n° {selected.code}
            {selected.name ? ` — ${selected.name}` : ''}
          </figcaption>
        </figure>
      )}

      <div
        className={cn(
          'grid grid-cols-6 gap-2 rounded-[--radius-md] border p-3 sm:grid-cols-9',
          error ? 'border-[#8a2f2f] bg-[#f6e9e9]/40' : 'border-line bg-white',
        )}
      >
        {chart.swatches.map((swatch) => {
          const active = swatch.code === value;
          return (
            <button
              key={swatch.code}
              type="button"
              onClick={() => onChange(swatch.code)}
              aria-pressed={active}
              aria-label={
                swatch.name
                  ? `Couleur numéro ${swatch.code} — ${swatch.name}`
                  : `Couleur numéro ${swatch.code}`
              }
              className="press flex flex-col items-center gap-1"
            >
              <span
                className={cn(
                  'relative grid size-9 place-items-center overflow-hidden rounded-full ring-1 ring-inset ring-ink/15 transition-all',
                  active && 'ring-2 ring-mauve ring-offset-2 ring-offset-white',
                )}
                style={{ backgroundColor: swatch.hex }}
              >
                {swatch.image && (
                  <img
                    src={swatch.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 size-full object-cover"
                  />
                )}
                {active && (
                  <Check className="relative size-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,.85)]" />
                )}
              </span>
              <span className={cn('text-[10.5px] tabular-nums', active ? 'text-ink' : 'text-stone')}>
                {swatch.code}
              </span>
              {/* Le nom du fournisseur, quand il en donne un. La plupart des
                  teintes n'ont qu'un numéro : rien ne s'affiche alors, et la
                  grille garde son alignement. */}
              {swatch.name && (
                <span
                  className={cn(
                    'max-w-[56px] truncate text-[9.5px] leading-tight',
                    active ? 'text-mauve' : 'text-stone',
                  )}
                >
                  {swatch.name}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-2.5 flex gap-2 text-[12px] leading-relaxed text-stone">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        Les teintes affichées sont indicatives : un écran ne rend jamais exactement la couleur du
        tissu. Nous confirmons la disponibilité de votre numéro avant l'envoi.
      </p>

      {chart.note && (
        <p className="mt-1.5 pl-[22px] text-[12px] leading-relaxed text-stone">{chart.note}</p>
      )}
    </fieldset>
  );
}
