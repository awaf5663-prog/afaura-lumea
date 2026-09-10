import type { StoreSettings } from '@/src/types';

/**
 * ─────────────────────────────────────────────────────────────
 *  LIENS DE PAIEMENT
 * ─────────────────────────────────────────────────────────────
 *  Wave et Orange Money donnent chacun un lien de paiement à la
 *  boutique. Ouvert depuis le téléphone, il lance l'application avec le
 *  destinataire déjà rempli : la cliente n'a plus qu'à saisir le montant
 *  et à valider.
 *
 *  Le lien est renseigné depuis l'administration, jamais écrit en dur
 *  ici : ni le numéro ni le lien n'appartiennent au code.
 *
 *  Seul `https://` est accepté. Un lien mal collé — ou n'importe quoi
 *  d'autre glissé dans le champ — ne devient pas un bouton sur lequel
 *  une cliente cliquerait.
 */
export function lienPaiement(
  settings: StoreSettings | null | undefined,
  methodId: string,
): string | null {
  const brut =
    methodId === 'wave'
      ? settings?.waveLink
      : methodId === 'orange_money'
        ? settings?.orangeMoneyLink
        : '';
  return lienSur(brut);
}

/** Renvoie le lien s'il est en https, `null` sinon. */
export function lienSur(brut: string | null | undefined): string | null {
  const valeur = (brut ?? '').trim();
  if (!valeur) return null;
  try {
    return new URL(valeur).protocol === 'https:' ? valeur : null;
  } catch {
    return null;
  }
}
