import { useCallback, useMemo, useState } from 'react';
import { useToast } from '@/src/hooks/useToast';

interface Ligne {
  id: string;
  deletedAt?: string | null;
}

/**
 * Sélection multiple et corbeille, partagées par les écrans Commandes et SHEIN.
 *
 * La sélection est vidée après chaque action : garder cochées des lignes qui
 * viennent de changer de liste laisserait la boutique agir à l'aveugle sur le
 * coup suivant.
 */
export function useTrash<T extends Ligne>({
  lignes,
  nom,
  mettreCorbeille,
  supprimer,
  reload,
}: {
  lignes: T[];
  /** « commande » / « demande ». */
  nom: string;
  mettreCorbeille: (ids: string[], trashed: boolean) => Promise<void>;
  supprimer: (ids: string[]) => Promise<void>;
  reload: () => Promise<void>;
}) {
  const { notify } = useToast();
  const [vueCorbeille, setVueCorbeille] = useState(false);
  const [selection, setSelection] = useState<string[]>([]);
  const [occupe, setOccupe] = useState(false);

  const actives = useMemo(() => lignes.filter((l) => !l.deletedAt), [lignes]);
  const corbeille = useMemo(() => lignes.filter((l) => l.deletedAt), [lignes]);
  const visibles = vueCorbeille ? corbeille : actives;

  const basculer = useCallback((id: string) => {
    setSelection((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  }, []);

  const changerVue = useCallback((corbeille: boolean) => {
    setVueCorbeille(corbeille);
    setSelection([]);
  }, []);

  const agir = useCallback(
    async (action: () => Promise<void>, message: string) => {
      setOccupe(true);
      try {
        await action();
        setSelection([]);
        await reload();
        notify(message);
      } catch (error) {
        notify(error instanceof Error ? error.message : 'Action impossible.', 'error');
      } finally {
        setOccupe(false);
      }
    },
    [notify, reload],
  );

  const pluriel = (n: number) => `${n} ${nom}${n > 1 ? 's' : ''}`;

  return {
    vueCorbeille,
    changerVue,
    selection,
    basculer,
    effacerSelection: () => setSelection([]),
    toutSelectionner: () => setSelection(visibles.map((l) => l.id)),
    visibles,
    nombreCorbeille: corbeille.length,
    occupe,
    mettreALaCorbeille: () =>
      agir(() => mettreCorbeille(selection, true), `${pluriel(selection.length)} à la corbeille`),
    restaurer: () =>
      agir(() => mettreCorbeille(selection, false), `${pluriel(selection.length)} restaurée${selection.length > 1 ? 's' : ''}`),
    supprimerDefinitivement: () => {
      const n = selection.length;
      const confirme = window.confirm(
        `Supprimer définitivement ${pluriel(n)} ? Cette action est irréversible : le récapitulatif et le suivi de ${n > 1 ? 'ces clientes' : 'cette cliente'} disparaîtront aussi.`,
      );
      if (!confirme) return Promise.resolve();
      return agir(() => supprimer(selection), `${pluriel(n)} supprimée${n > 1 ? 's' : ''}`);
    },
  };
}
