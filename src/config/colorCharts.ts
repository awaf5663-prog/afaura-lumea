import dentelle01 from '@/src/assets/swatches/dentelle-01.webp';
import dentelle02 from '@/src/assets/swatches/dentelle-02.webp';
import dentelle03 from '@/src/assets/swatches/dentelle-03.webp';
import dentelle04 from '@/src/assets/swatches/dentelle-04.webp';
import dentelle05 from '@/src/assets/swatches/dentelle-05.webp';
import dentelle06 from '@/src/assets/swatches/dentelle-06.webp';
import dentelle07 from '@/src/assets/swatches/dentelle-07.webp';
import dentelle08 from '@/src/assets/swatches/dentelle-08.webp';
import dentelle09 from '@/src/assets/swatches/dentelle-09.webp';
import dentelle10 from '@/src/assets/swatches/dentelle-10.webp';
import dentelle11 from '@/src/assets/swatches/dentelle-11.webp';
import dentelle12 from '@/src/assets/swatches/dentelle-12.webp';
import frise01 from '@/src/assets/swatches/frise-01.webp';
import frise02 from '@/src/assets/swatches/frise-02.webp';
import frise03 from '@/src/assets/swatches/frise-03.webp';
import frise04 from '@/src/assets/swatches/frise-04.webp';
import frise05 from '@/src/assets/swatches/frise-05.webp';
import frise06 from '@/src/assets/swatches/frise-06.webp';
import frise07 from '@/src/assets/swatches/frise-07.webp';
import frise08 from '@/src/assets/swatches/frise-08.webp';
import frise09 from '@/src/assets/swatches/frise-09.webp';
import frise10 from '@/src/assets/swatches/frise-10.webp';
import frise11 from '@/src/assets/swatches/frise-11.webp';
import frise12 from '@/src/assets/swatches/frise-12.webp';
import frise13 from '@/src/assets/swatches/frise-13.webp';
import frise14 from '@/src/assets/swatches/frise-14.webp';
import frise15 from '@/src/assets/swatches/frise-15.webp';
import frise16 from '@/src/assets/swatches/frise-16.webp';
import frise17 from '@/src/assets/swatches/frise-17.webp';
import frise18 from '@/src/assets/swatches/frise-18.webp';
import frise19 from '@/src/assets/swatches/frise-19.webp';
import frise20 from '@/src/assets/swatches/frise-20.webp';
import frise21 from '@/src/assets/swatches/frise-21.webp';
import frise22 from '@/src/assets/swatches/frise-22.webp';
import frise23 from '@/src/assets/swatches/frise-23.webp';
import frise24 from '@/src/assets/swatches/frise-24.webp';
import frise25 from '@/src/assets/swatches/frise-25.webp';
import frise26 from '@/src/assets/swatches/frise-26.webp';
import frise27 from '@/src/assets/swatches/frise-27.webp';
import frise28 from '@/src/assets/swatches/frise-28.webp';
import frise29 from '@/src/assets/swatches/frise-29.webp';
import frise30 from '@/src/assets/swatches/frise-30.webp';
import frise31 from '@/src/assets/swatches/frise-31.webp';
import frise32 from '@/src/assets/swatches/frise-32.webp';
import frise33 from '@/src/assets/swatches/frise-33.webp';
import frise34 from '@/src/assets/swatches/frise-34.webp';
import frise35 from '@/src/assets/swatches/frise-35.webp';
import frise36 from '@/src/assets/swatches/frise-36.webp';
import jersey01 from '@/src/assets/swatches/jersey-01.webp';
import jersey02 from '@/src/assets/swatches/jersey-02.webp';
import jersey03 from '@/src/assets/swatches/jersey-03.webp';
import jersey04 from '@/src/assets/swatches/jersey-04.webp';
import jersey05 from '@/src/assets/swatches/jersey-05.webp';
import jersey06 from '@/src/assets/swatches/jersey-06.webp';
import jersey07 from '@/src/assets/swatches/jersey-07.webp';
import jersey08 from '@/src/assets/swatches/jersey-08.webp';
import jersey09 from '@/src/assets/swatches/jersey-09.webp';
import jersey10 from '@/src/assets/swatches/jersey-10.webp';
import jersey11 from '@/src/assets/swatches/jersey-11.webp';
import jersey12 from '@/src/assets/swatches/jersey-12.webp';
import jersey13 from '@/src/assets/swatches/jersey-13.webp';
import jersey14 from '@/src/assets/swatches/jersey-14.webp';
import jersey15 from '@/src/assets/swatches/jersey-15.webp';
import jersey16 from '@/src/assets/swatches/jersey-16.webp';
import jersey17 from '@/src/assets/swatches/jersey-17.webp';
import jersey18 from '@/src/assets/swatches/jersey-18.webp';
import jersey19 from '@/src/assets/swatches/jersey-19.webp';
import jersey20 from '@/src/assets/swatches/jersey-20.webp';
import jersey21 from '@/src/assets/swatches/jersey-21.webp';
import jersey22 from '@/src/assets/swatches/jersey-22.webp';
import jersey23 from '@/src/assets/swatches/jersey-23.webp';
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
    id: 'jersey23',
    label: 'Nuancier jersey liquide — 23 teintes',
    note:
      "Chaque pastille est une photo du tissu, découpée dans le nuancier du fournisseur : c'est la vraie matière, pas un aplat. Quatre teintes seulement portent un nom chez lui — les autres se commandent par leur numéro.",
    /*
     * Les teintes sont relevées sur la photo du nuancier, pastille par
     * pastille : la couleur affichée est celle des pixels, jamais une
     * approximation choisie à l'œil. La photo reste la référence ; le code
     * hexadécimal ne sert que si elle ne charge pas.
     */
    swatches: [
      { code: '01', hex: '#dfe2e6', name: 'White', image: jersey01 },
      { code: '02', hex: '#eaebe5', name: 'Cream', image: jersey02 },
      { code: '03', hex: '#101010', name: 'Black', image: jersey03 },
      { code: '04', hex: '#ab9d8d', image: jersey04 },
      { code: '05', hex: '#b5a397', image: jersey05 },
      { code: '06', hex: '#a99386', image: jersey06 },
      { code: '07', hex: '#957a6d', image: jersey07 },
      { code: '08', hex: '#7d7d64', image: jersey08 },
      { code: '09', hex: '#aba6a1', image: jersey09 },
      { code: '10', hex: '#ede3d0', image: jersey10 },
      { code: '11', hex: '#d4c8af', image: jersey11 },
      { code: '12', hex: '#d2c5af', image: jersey12 },
      { code: '13', hex: '#bdb49a', image: jersey13 },
      { code: '14', hex: '#c1a889', image: jersey14 },
      { code: '15', hex: '#6c4d2a', image: jersey15 },
      { code: '16', hex: '#3c3c23', image: jersey16 },
      { code: '17', hex: '#827560', image: jersey17 },
      { code: '18', hex: '#6c5b47', image: jersey18 },
      { code: '19', hex: '#786462', image: jersey19 },
      { code: '20', hex: '#3c2c28', image: jersey20 },
      { code: '21', hex: '#391527', image: jersey21 },
      { code: '22', hex: '#47151f', image: jersey22 },
      { code: '23', hex: '#13182e', name: 'Navy', image: jersey23 },
    ],
  },
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
  {
    id: 'dentelle12',
    label: 'Nuancier dentelle 12 teintes',
    swatches: [
      { code: '01', hex: '#171717', image: dentelle01 },
      { code: '02', hex: '#e3e1e7', image: dentelle02 },
      { code: '03', hex: '#ddcac0', image: dentelle03 },
      { code: '04', hex: '#dac6bd', image: dentelle04 },
      { code: '05', hex: '#c6a39b', image: dentelle05 },
      { code: '06', hex: '#e6becb', image: dentelle06 },
      { code: '07', hex: '#b6b4bd', image: dentelle07 },
      { code: '08', hex: '#172549', image: dentelle08 },
      { code: '09', hex: '#b07289', image: dentelle09 },
      { code: '10', hex: '#a582c7', image: dentelle10 },
      { code: '11', hex: '#d6b8a4', image: dentelle11 },
      { code: '12', hex: '#e0c4bd', image: dentelle12 },
    ],
  },
  {
    id: 'frise36',
    label: 'Nuancier 36 teintes — jersey frisé',
    note:
      "Le frisé visible sur les pastilles est photographié sur nos voiles ; la teinte, elle, est appliquée dessus pour vous montrer le rendu de chaque numéro.",
    /**
     * Mêmes 36 numéros que le nuancier modal : le relief des volants
     * provient d'une vraie photo de la boutique, la teinte est appliquée
     * dessus. Le motif frisé est donc réel, la couleur reste indicative.
     */
    swatches: [
      { code: '01', hex: '#181818', image: frise01 },
      { code: '02', hex: '#edecf0', image: frise02 },
      { code: '03', hex: '#ebe2d5', image: frise03 },
      { code: '04', hex: '#dfcebf', image: frise04 },
      { code: '05', hex: '#c4a089', image: frise05 },
      { code: '06', hex: '#b48261', image: frise06 },
      { code: '07', hex: '#9a6543', image: frise07 },
      { code: '08', hex: '#835036', image: frise08 },
      { code: '09', hex: '#886551', image: frise09 },
      { code: '10', hex: '#603b2b', image: frise10 },
      { code: '11', hex: '#492c22', image: frise11 },
      { code: '12', hex: '#37221b', image: frise12 },
      { code: '13', hex: '#b4b7bd', image: frise13 },
      { code: '14', hex: '#616162', image: frise14 },
      { code: '15', hex: '#a7a7af', image: frise15 },
      { code: '16', hex: '#8faacf', image: frise16 },
      { code: '17', hex: '#6a7d9d', image: frise17 },
      { code: '18', hex: '#13213c', image: frise18 },
      { code: '19', hex: '#abcfc5', image: frise19 },
      { code: '20', hex: '#9cc5b9', image: frise20 },
      { code: '21', hex: '#636044', image: frise21 },
      { code: '22', hex: '#57553d', image: frise22 },
      { code: '23', hex: '#1f3c2e', image: frise23 },
      { code: '24', hex: '#173c34', image: frise24 },
      { code: '25', hex: '#eabcbc', image: frise25 },
      { code: '26', hex: '#e2a7ae', image: frise26 },
      { code: '27', hex: '#c3838b', image: frise27 },
      { code: '28', hex: '#b07f8b', image: frise28 },
      { code: '29', hex: '#a05691', image: frise29 },
      { code: '30', hex: '#6a2449', image: frise30 },
      { code: '31', hex: '#9f8ac4', image: frise31 },
      { code: '32', hex: '#c28bd3', image: frise32 },
      { code: '33', hex: '#efb8b1', image: frise33 },
      { code: '34', hex: '#e16e73', image: frise34 },
      { code: '35', hex: '#9d2332', image: frise35 },
      { code: '36', hex: '#50161c', image: frise36 },
    ],
  },
];

export function findColorChart(id: string | undefined | null): ColorChart | null {
  if (!id) return null;
  return COLOR_CHARTS.find((chart) => chart.id === id) ?? null;
}
