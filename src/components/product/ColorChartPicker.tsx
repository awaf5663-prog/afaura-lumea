import { Check, Info } from 'lucide-react';
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

  return (
    <fieldset>
      <legend className="mb-2 text-[13px] font-medium text-graphite">
        Couleur
        {selected ? (
          <span className="ml-2 text-stone">n° {selected.code}</span>
        ) : (
          <span className="ml-2 text-mauve">à choisir</span>
        )}
      </legend>

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
              aria-label={`Couleur numéro ${swatch.code}`}
              className="press flex flex-col items-center gap-1"
            >
              <span
                className={cn(
                  'grid size-9 place-items-center rounded-full ring-1 ring-inset ring-ink/15 transition-all',
                  active && 'ring-2 ring-mauve ring-offset-2 ring-offset-white',
                )}
                style={{ backgroundColor: swatch.hex }}
              >
                {active && <Check className="size-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,.7)]" />}
              </span>
              <span className={cn('text-[10.5px] tabular-nums', active ? 'text-ink' : 'text-stone')}>
                {swatch.code}
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-2.5 flex gap-2 text-[12px] leading-relaxed text-stone">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        Les teintes affichées sont indicatives : un écran ne rend jamais exactement la couleur du
        tissu. Nous confirmons la disponibilité de votre numéro avant l'envoi.
      </p>
    </fieldset>
  );
}
