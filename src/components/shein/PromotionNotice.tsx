import { GraduationCap, Sparkles } from 'lucide-react';
import { visiblePromotions } from '@/src/lib/pricing/promotions';
import { useSettings } from '@/src/hooks/useSettings';

/**
 * Offres en cours, annoncées à la cliente.
 *
 * N'affiche que ce qui est réellement configuré : ni date inventée, ni « offre
 * limitée » quand aucune fin n'est fixée. Une offre réservée aux étudiantes le
 * dit, et dit aussi qu'une carte sera demandée — la déclaration seule ne suffit
 * pas, et mieux vaut l'annoncer que de refuser après coup.
 */
export function PromotionNotice({ kind }: { kind: 'shein' | 'store' }) {
  const { settings } = useSettings();
  const offers = visiblePromotions(settings?.promotions ?? [], kind);
  if (offers.length === 0) return null;

  const endLabel = (endsAt: string | null) => {
    if (!endsAt) return null;
    const date = new Date(`${endsAt}T12:00:00`);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  };

  return (
    <div className="space-y-3">
      {offers.map((offer) => {
        const end = endLabel(offer.endsAt);
        return (
          <div
            key={offer.id}
            className="flex gap-3 rounded-[--radius-md] border border-mauve/25 bg-blush/45 px-4 py-3.5"
          >
            {offer.studentOnly ? (
              <GraduationCap className="mt-0.5 size-4 shrink-0 text-mauve" />
            ) : (
              <Sparkles className="mt-0.5 size-4 shrink-0 text-mauve" />
            )}
            <div className="text-[13px] leading-relaxed text-graphite">
              <p className="font-medium text-rosedark">{offer.label}</p>
              <p className="mt-0.5">{offer.description}</p>
              <p className="mt-1 text-[12px] text-stone">
                {end ? `Jusqu'au ${end}.` : 'Offre en cours.'}
                {offer.studentOnly && ' Carte d’étudiante demandée sur WhatsApp avant validation.'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
