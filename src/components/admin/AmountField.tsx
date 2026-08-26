import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/src/lib/cn';

/**
 * Montant saisi dans l'espace admin.
 *
 * Volontairement enregistré par un bouton, jamais en quittant le champ :
 * la version précédente sauvegardait sur `blur`, et taper un montant puis
 * toucher aussitôt la liste des étapes le faisait disparaître sans rien dire.
 * Un montant annoncé à une cliente ne peut pas se perdre en silence.
 *
 * Le bouton n'apparaît que si la valeur a changé, et la touche Entrée
 * enregistre aussi.
 */
export function AmountField({
  label,
  value,
  placeholder,
  disabled,
  onSave,
  hint,
}: {
  label: string;
  value: number | null;
  placeholder: string;
  disabled?: boolean;
  onSave: (next: number | null) => void;
  hint?: string;
}) {
  const [draft, setDraft] = useState(value === null ? '' : String(value));

  // La valeur enregistrée a changé ailleurs : on se réaligne.
  useEffect(() => {
    setDraft(value === null ? '' : String(value));
  }, [value]);

  const parsed = draft.trim() === '' ? null : Number(draft);
  const invalid = parsed !== null && (!Number.isFinite(parsed) || parsed < 0);
  const dirty = !invalid && parsed !== value;

  const save = () => {
    if (!dirty) return;
    onSave(parsed);
  };

  return (
    <div className="text-[12.5px] text-stone">
      <label className="block">
        {label}
        <input
          type="number"
          min={0}
          step={100}
          inputMode="numeric"
          value={draft}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              save();
            }
          }}
          className={cn(
            'mt-1 w-full rounded-[--radius-sm] border bg-white px-4 py-3 text-[15px] focus:outline-none',
            invalid ? 'border-[#8a2f2f]' : 'border-line focus:border-ink',
          )}
        />
      </label>

      {invalid && <p className="mt-1.5 text-[#8a2f2f]">Entrez un montant positif.</p>}

      {dirty && !invalid && (
        <button
          type="button"
          onClick={save}
          disabled={disabled}
          className="press mt-2 inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[12.5px] font-medium text-ivory disabled:opacity-60"
        >
          <Check className="size-3.5" />
          Enregistrer
        </button>
      )}

      {!dirty && hint && <p className="mt-1.5">{hint}</p>}
    </div>
  );
}
