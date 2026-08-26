import { useCallback, useEffect, useRef, useState } from 'react';
import { useSettings } from '@/src/hooks/useSettings';
import { readJson, removeKey, writeJson } from '@/src/lib/storage';
import { normalizeSettings } from '@/src/services/settingsShape';
import type { StoreSettings } from '@/src/types';

/**
 * Brouillon d'un écran de réglages.
 *
 * Ce que ça règle, et pourquoi ça mérite un fichier :
 *
 *  1. Une saisie en cours n'est JAMAIS écrasée. Chaque enregistrement fait
 *     relire les réglages ; l'écran se recalait alors sur ce qui venait de la
 *     base et effaçait ce qui était tapé. Si l'enregistrement échouait, tout
 *     le travail disparaissait avec l'erreur.
 *  2. La saisie survit à tout le reste : téléphone verrouillé, onglet fermé,
 *     coupure de réseau. Elle est écrite dans le navigateur à chaque frappe et
 *     reproposée au retour.
 *  3. L'erreur d'enregistrement est conservée telle quelle, avec son nom
 *     technique, au lieu d'un message qui s'efface au bout de trois secondes.
 */

/** Message lisible, sans perdre le nom technique — c'est lui qui identifie la panne. */
export function describeSaveError(error: unknown): string {
  if (error instanceof Error) {
    const name = error.name && error.name !== 'Error' ? `${error.name} : ` : '';
    return `${name}${error.message}`;
  }
  return String(error);
}

export function useSettingsDraft(storageKey: string) {
  const { settings, save } = useSettings();
  const [draft, setDraftState] = useState<StoreSettings | null>(null);
  const [dirty, setDirty] = useState(false);
  const [restored, setRestored] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // `dirty` est lu dans un effet qui ne doit pas se relancer quand il change.
  const dirtyRef = useRef(false);
  dirtyRef.current = dirty;

  useEffect(() => {
    if (!settings) return;
    // Une saisie en cours prime sur ce qui arrive de la base.
    if (dirtyRef.current) return;
    const pending = readJson<StoreSettings | null>(storageKey, null);
    if (pending) {
      setDraftState(normalizeSettings(pending, settings));
      setDirty(true);
      setRestored(true);
      return;
    }
    setDraftState(settings);
  }, [settings, storageKey]);

  const setDraft = useCallback(
    (next: StoreSettings) => {
      setDraftState(next);
      setDirty(true);
      setRestored(false);
      // Écrit à chaque frappe : c'est ce qui rend la saisie increvable.
      writeJson(storageKey, next);
    },
    [storageKey],
  );

  /** Repartir des valeurs réellement enregistrées, en jetant le brouillon. */
  const discard = useCallback(() => {
    removeKey(storageKey);
    setDraftState(settings);
    setDirty(false);
    setRestored(false);
    setError(null);
  }, [settings, storageKey]);

  /** `override` sert aux écrans qui nettoient une valeur juste avant d'envoyer. */
  const commit = useCallback(async (override?: StoreSettings): Promise<boolean> => {
    const payload = override ?? draft;
    if (!payload) return false;
    setSaving(true);
    setError(null);
    try {
      await save(payload);
      removeKey(storageKey);
      setDraftState(payload);
      setDirty(false);
      setRestored(false);
      return true;
    } catch (e) {
      // On garde le brouillon : c'est précisément quand ça échoue qu'il sert.
      setError(describeSaveError(e));
      return false;
    } finally {
      setSaving(false);
    }
  }, [draft, save, storageKey]);

  return { draft, setDraft, dirty, restored, saving, error, setError, commit, discard };
}
