import { RotateCcw, Trash2, X } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { cn } from '@/src/lib/cn';

/**
 * Barre de sélection et bascule vers la corbeille.
 *
 * Deux gestes volontairement distincts : « mettre à la corbeille » range et
 * se défait, « supprimer définitivement » efface et ne se défait pas. Le
 * second n'existe que dans la corbeille, et demande confirmation — une
 * commande porte de l'argent et un engagement pris auprès d'une cliente.
 */
export function TrashBar({
  vueCorbeille,
  onChangerVue,
  nombreCorbeille,
  selection,
  total,
  onToutSelectionner,
  onEffacerSelection,
  onMettreCorbeille,
  onRestaurer,
  onSupprimer,
  occupe,
  nom,
}: {
  vueCorbeille: boolean;
  onChangerVue: (corbeille: boolean) => void;
  nombreCorbeille: number;
  selection: string[];
  total: number;
  onToutSelectionner: () => void;
  onEffacerSelection: () => void;
  onMettreCorbeille: () => void;
  onRestaurer: () => void;
  onSupprimer: () => void;
  occupe?: boolean;
  /** « commande » / « demande », pour les phrases au singulier et au pluriel. */
  nom: string;
}) {
  const n = selection.length;

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChangerVue(false)}
          className={cn(
            'press rounded-full px-4 py-2 text-[13px]',
            vueCorbeille ? 'bg-cream text-graphite' : 'bg-ink text-ivory',
          )}
        >
          En cours
        </button>
        <button
          type="button"
          onClick={() => onChangerVue(true)}
          className={cn(
            'press inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px]',
            vueCorbeille ? 'bg-ink text-ivory' : 'bg-cream text-graphite',
          )}
        >
          <Trash2 className="size-3.5" />
          Corbeille
          {nombreCorbeille > 0 && ` (${nombreCorbeille})`}
        </button>
      </div>

      {n > 0 && (
        <div className="animate-fade mt-3 rounded-[--radius-md] border border-line bg-white p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[13.5px]">
              <strong className="font-medium">{n}</strong> {nom}
              {n > 1 ? 's' : ''} sélectionnée{n > 1 ? 's' : ''}
            </p>
            <button
              type="button"
              onClick={onEffacerSelection}
              className="press inline-flex items-center gap-1.5 text-[12.5px] text-stone"
            >
              <X className="size-3.5" /> Annuler
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {vueCorbeille ? (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<RotateCcw className="size-4" />}
                  onClick={onRestaurer}
                  disabled={occupe}
                >
                  Restaurer
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Trash2 className="size-4" />}
                  onClick={onSupprimer}
                  disabled={occupe}
                  className="text-[#8a2f2f]"
                >
                  Supprimer définitivement
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                icon={<Trash2 className="size-4" />}
                onClick={onMettreCorbeille}
                disabled={occupe}
              >
                Mettre à la corbeille
              </Button>
            )}
          </div>
        </div>
      )}

      {n === 0 && total > 0 && (
        <button
          type="button"
          onClick={onToutSelectionner}
          className="press mt-3 text-[12.5px] text-stone underline underline-offset-2"
        >
          Tout sélectionner ({total})
        </button>
      )}
    </div>
  );
}
