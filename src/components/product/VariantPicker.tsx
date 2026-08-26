import { cn } from '@/src/lib/cn';
import type { ProductVariantGroup } from '@/src/types';

interface Props {
  groups: ProductVariantGroup[];
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
  size?: 'sm' | 'md';
}

export function VariantPicker({ groups, value, onChange, size = 'md' }: Props) {
  if (groups.length === 0) return null;

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <fieldset key={group.name}>
          <legend className="mb-2 text-[13px] font-medium text-graphite">
            {group.name}
            {value[group.name] ? <span className="ml-2 text-stone">{value[group.name]}</span> : null}
          </legend>
          <div className="flex flex-wrap gap-2">
            {group.options.map((option) => {
              const selected = value[group.name] === option;
              const soldOut = (group.soldOutOptions ?? []).includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={selected}
                  disabled={soldOut}
                  onClick={() => onChange({ ...value, [group.name]: option })}
                  className={cn(
                    'press rounded-full border transition-colors',
                    size === 'sm' ? 'px-3 py-1.5 text-[12.5px]' : 'px-4 py-2.5 text-[13.5px]',
                    soldOut
                      ? 'cursor-not-allowed border-line bg-cream text-stone line-through'
                      : selected
                        ? 'border-ink bg-ink text-ivory'
                        : 'border-line bg-white text-graphite hover:border-ink/40',
                  )}
                >
                  {option}
                  {soldOut && <span className="ml-1.5 no-underline">· parti</span>}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
