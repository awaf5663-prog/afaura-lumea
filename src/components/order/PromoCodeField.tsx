import { useMemo, useState } from 'react';
import { BadgePercent, Check, X } from 'lucide-react';
import { describeEffect, explainCode, type PromotionContext } from '@/src/lib/pricing/promotions';
import { useSettings } from '@/src/hooks/useSettings';
import { cn } from '@/src/lib/cn';

/**
 * Saisie d'un code promo.
 *
 * La vérification faite ici sert à répondre tout de suite — « code appliqué »,
 * « réservé aux étudiantes », « pas en cours ». Elle ne décide de rien : le
 * montant définitif est recalculé au moment d'enregistrer la commande, à partir
 * des règles enregistrées. Une cliente qui trafiquerait cette page verrait un
 * message flatteur et paierait quand même le tarif normal.
 */
export function PromoCodeField({
  value,
  onChange,
  context,
}: {
  value: string;
  onChange: (next: string) => void;
  /** Le contexte de la commande, sans le code : il est ajouté ici. */
  context: Omit<PromotionContext, 'code'>;
}) {
  const { settings } = useSettings();
  const [touched, setTouched] = useState(false);

  const result = useMemo(
    () => explainCode(settings?.promotions ?? [], { ...context, code: value }),
    [settings?.promotions, context, value],
  );

  const applied = result && 'promotion' in result ? result.promotion : null;
  const problem = touched && result && 'reason' in result ? result.reason : null;

  return (
    <div>
      <label htmlFor="promo-code" className="block text-[13px] font-medium text-graphite">
        Code promo
        <span className="ml-1.5 font-normal text-stone">(facultatif)</span>
      </label>

      <div className="relative mt-1.5">
        <BadgePercent className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone" />
        <input
          id="promo-code"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="Ex. RENTREE"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          className={cn(
            'w-full rounded-[--radius-sm] border bg-white py-3 pl-10 pr-10 text-[15px] uppercase tracking-[0.08em] focus:outline-none',
            applied ? 'border-[#17803f]' : problem ? 'border-[#8a2f2f]' : 'border-line focus:border-ink',
          )}
        />
        {value.trim() !== '' && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {applied ? (
              <Check className="size-4 text-[#17803f]" />
            ) : touched ? (
              <X className="size-4 text-[#8a2f2f]" />
            ) : null}
          </span>
        )}
      </div>

      {applied && (
        <p className="mt-1.5 text-[12.5px] text-[#17803f]">
          <span className="font-medium">{applied.label}</span> — {describeEffect(applied.effect)}.
        </p>
      )}
      {problem && <p className="mt-1.5 text-[12.5px] text-[#8a2f2f]">{problem}</p>}
    </div>
  );
}
