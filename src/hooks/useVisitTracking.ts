import { useEffect } from 'react';
import { db } from '@/src/services';
import { shouldRecord, visitorId } from '@/src/lib/visitor';

/**
 * Compte les pages vues.
 *
 * L'administration est exclue : les passages de la boutique dans son propre
 * back-office gonfleraient le compte sans rien dire de sa fréquentation.
 * Le comptage n'attend rien et n'affiche rien — s'il échoue, la page continue.
 */
export function useVisitTracking(path: string): void {
  useEffect(() => {
    if (path.startsWith('/admin')) return;
    if (!shouldRecord(path)) return;
    void db.recordVisit(path, visitorId()).catch(() => {
      /* une visite non comptée ne doit jamais gêner la navigation */
    });
  }, [path]);
}
