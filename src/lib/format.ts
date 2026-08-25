/** Formatage des montants en FCFA — entiers, espace insécable fine comme séparateur. */
export function formatFcfa(amount: number): string {
  return `${Math.round(amount).toLocaleString('fr-FR').replace(/ | /g, ' ')} FCFA`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Normalise un numéro sénégalais en format international sans "+".
 * "77 123 45 67" → "221771234567" ; "+221 77 123 45 67" → "221771234567".
 */
export function normalizePhone(input: string): string {
  const digits = input.replace(/[^\d]/g, '');
  if (!digits) return '';
  if (digits.startsWith('221')) return digits;
  if (digits.startsWith('00221')) return digits.slice(2);
  if (digits.length === 9) return `221${digits}`;
  return digits;
}

/** Affichage lisible : 221771234567 → +221 77 123 45 67 */
export function prettyPhone(input: string): string {
  const n = normalizePhone(input);
  if (n.startsWith('221') && n.length === 12) {
    const local = n.slice(3);
    return `+221 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7)}`;
  }
  return input;
}

export function isValidSenegalPhone(input: string): boolean {
  const n = normalizePhone(input);
  return /^221(7[0-8])\d{7}$/.test(n) || (n.length >= 8 && n.length <= 15 && !n.startsWith('221'));
}
