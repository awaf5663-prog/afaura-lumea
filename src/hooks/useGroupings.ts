import { useCallback, useEffect, useMemo, useState } from 'react';
import { db } from '@/src/services';
import type { Grouping } from '@/src/types';

/** Nombre de commandes réellement engagées sur un groupage (site + hors site). */
export function groupingCount(grouping: Grouping): number {
  return grouping.reservedCount + grouping.manualOrderCount;
}

export function groupingFillRate(grouping: Grouping): number {
  if (grouping.maxOrders <= 0) return 0;
  return Math.min(100, Math.round((groupingCount(grouping) / grouping.maxOrders) * 100));
}

export function isGroupingOpen(grouping: Grouping): boolean {
  return grouping.status === 'open' && groupingCount(grouping) < grouping.maxOrders;
}

export function useGroupings() {
  const [groupings, setGroupings] = useState<Grouping[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setGroupings(await db.listGroupings());
    } catch {
      setGroupings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Groupage qui accueille les nouvelles demandes. */
  const active = useMemo(
    () =>
      groupings
        .filter(isGroupingOpen)
        .sort((a, b) => {
          if (!a.closingDate) return 1;
          if (!b.closingDate) return -1;
          return new Date(a.closingDate).getTime() - new Date(b.closingDate).getTime();
        })[0] ?? null,
    [groupings],
  );

  /** Groupage affiché quand aucun n'accepte de demande (complet, reporté…). */
  const displayed = useMemo(
    () =>
      active ??
      groupings.find((g) => g.status === 'full') ??
      groupings.find((g) => g.status === 'open') ??
      null,
    [active, groupings],
  );

  return { groupings, active, displayed, loading, reload: load };
}
