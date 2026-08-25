import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DELIVERY_ZONES, type DeliveryZone } from '@/src/config/site';
import { db } from '@/src/services';
import type { StoreSettings } from '@/src/types';

interface SettingsValue {
  settings: StoreSettings | null;
  loading: boolean;
  /** Zones de livraison avec les frais réellement paramétrés. */
  zones: DeliveryZone[];
  refresh: () => Promise<void>;
  save: (next: StoreSettings) => Promise<void>;
}

const SettingsContext = createContext<SettingsValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setSettings(await db.getSettings());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

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
    () => ({ settings, loading, zones, refresh, save }),
    [settings, loading, zones, refresh, save],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings doit être utilisé dans <SettingsProvider>');
  return ctx;
}

/** Numéro WhatsApp effectif (config + surcharge admin). */
export function useWhatsappNumber(): string {
  return useSettings().settings?.whatsappNumber ?? '';
}
