import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DELIVERY_ZONES, type DeliveryZone } from '@/src/config/site';
import { db, onDataChanged } from '@/src/services';
import { buildChatUrl, canPrefill } from '@/src/lib/whatsapp';
import type { StoreSettings } from '@/src/types';

interface SettingsValue {
  settings: StoreSettings | null;
  loading: boolean;
  /** Dernière erreur de chargement. null = tout va bien. */
  error: string | null;
  /** Zones de livraison avec les frais réellement paramétrés. */
  zones: DeliveryZone[];
  refresh: () => Promise<void>;
  save: (next: StoreSettings) => Promise<void>;
}

const SettingsContext = createContext<SettingsValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /*
   * Le try/finally d'origine n'attrapait rien : une base injoignable
   * remontait en rejet non géré et faisait apparaître une erreur dans la
   * console de la cliente. Le site sait fonctionner sans ces réglages — il
   * retombe sur les valeurs par défaut — mais l'erreur est conservée pour que
   * l'espace admin puisse la montrer au lieu de la cacher.
   */
  const refresh = useCallback(async () => {
    try {
      setSettings(await db.getSettings());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Réglages indisponibles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Un réglage enregistré — ici, dans un autre onglet, ou pendant que cet
  // onglet était en arrière-plan — se propage sans recharger la page.
  useEffect(() => onDataChanged(() => void refresh()), [refresh]);

  const save = useCallback(async (next: StoreSettings) => {
    setSettings(await db.saveSettings(next));
  }, []);

  const zones = useMemo(
    () =>
      DELIVERY_ZONES.map((zone) => ({
        ...zone,
        fee: settings?.deliveryFees?.[zone.id] ?? zone.fee,
      })),
    [settings],
  );

  const value = useMemo(
    () => ({ settings, loading, error, zones, refresh, save }),
    [settings, loading, error, zones, refresh, save],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings doit être utilisé dans <SettingsProvider>');
  return ctx;
}


/**
 * Accès WhatsApp unifié : numéro (messages pré-remplis) ou lien court
 * WhatsApp Business (ouverture simple de la conversation).
 *
 * `url(message)` renvoie l'adresse à mettre dans un <a href>. On ne passe
 * jamais par window.open : les navigateurs mobiles la bloquent hors geste
 * direct, et le bouton semble alors ne rien faire.
 */
export function useWhatsapp() {
  const { settings } = useSettings();
  const target = {
    number: settings?.whatsappNumber ?? '',
    link: settings?.whatsappLink ?? '',
  };
  const prefill = canPrefill(target);
  const url = (message?: string) => buildChatUrl(target, message);

  return {
    ...target,
    prefill,
    available: Boolean(url()),
    url,
  };
}
