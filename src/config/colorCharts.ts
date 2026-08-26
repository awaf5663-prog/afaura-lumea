import type { ColorChart } from '@/src/types';

/**
 * ─────────────────────────────────────────────────────────────
 *  NUANCIERS
 * ─────────────────────────────────────────────────────────────
 *  Les teintes sont relevées directement sur le nuancier du
 *  fournisseur : la cliente choisit un numéro, ce qui supprime
 *  les malentendus sur les noms de couleurs.
 *
 *  Un écran ne restitue jamais exactement un tissu : le site le
 *  dit, et la disponibilité reste confirmée avant l'envoi.
 *
 *  Pour ajouter un nuancier : une entrée de plus dans ce tableau.
 *  Il apparaît alors dans la liste déroulante de /admin → Produits.
 */
export const COLOR_CHARTS: ColorChart[] = [
  {
    id: 'modal36',
    label: 'Nuancier 36 teintes',
    swatches: [
      { code: '01', hex: '#181818' },
      { code: '02', hex: '#edecf0' },
      { code: '03', hex: '#ebe2d5' },
      { code: '04', hex: '#dfcebf' },
      { code: '05', hex: '#c4a089' },
      { code: '06', hex: '#b48261' },
      { code: '07', hex: '#9a6543' },
      { code: '08', hex: '#835036' },
      { code: '09', hex: '#886551' },
      { code: '10', hex: '#603b2b' },
      { code: '11', hex: '#492c22' },
      { code: '12', hex: '#37221b' },
      { code: '13', hex: '#b4b7bd' },
      { code: '14', hex: '#616162' },
      { code: '15', hex: '#a7a7af' },
      { code: '16', hex: '#8faacf' },
      { code: '17', hex: '#6a7d9d' },
      { code: '18', hex: '#13213c' },
      { code: '19', hex: '#abcfc5' },
      { code: '20', hex: '#9cc5b9' },
      { code: '21', hex: '#636044' },
      { code: '22', hex: '#57553d' },
      { code: '23', hex: '#1f3c2e' },
      { code: '24', hex: '#173c34' },
      { code: '25', hex: '#eabcbc' },
      { code: '26', hex: '#e2a7ae' },
      { code: '27', hex: '#c3838b' },
      { code: '28', hex: '#b07f8b' },
      { code: '29', hex: '#a05691' },
      { code: '30', hex: '#6a2449' },
      { code: '31', hex: '#9f8ac4' },
      { code: '32', hex: '#c28bd3' },
      { code: '33', hex: '#efb8b1' },
      { code: '34', hex: '#e16e73' },
      { code: '35', hex: '#9d2332' },
      { code: '36', hex: '#50161c' },
    ],
  },
];

export function findColorChart(id: string | undefined | null): ColorChart | null {
  if (!id) return null;
  return COLOR_CHARTS.find((chart) => chart.id === id) ?? null;
}
