import type { Order, SheinRequest } from '@/src/types';
import { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL, SHEIN_STATUS_LABEL } from './orderStatus';

/**
 * Export CSV des commandes et des demandes.
 *
 * Le fichier s'ouvre directement dans Excel ou Google Sheets : c'est là que
 * se tient la comptabilité, pas dans le site. À sens unique volontairement —
 * le site reste la source de vérité, le tableur sert à compter, archiver,
 * imprimer.
 *
 * Deux détails qui font qu'Excel ouvre le fichier correctement :
 * le BOM UTF-8 (sans lui, « é » et « FCFA » ressortent illisibles) et le
 * point-virgule comme séparateur (Excel en français attend celui-là).
 */
const SEPARATOR = ';';

function cell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const text = String(value).replace(/\r?\n/g, ' ');
  // Une valeur contenant le séparateur ou un guillemet doit être entourée.
  return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(cell).join(SEPARATOR));
  return '﻿' + lines.join('\r\n');
}

const day = () => new Date().toISOString().slice(0, 10);

export function ordersCsv(orders: Order[]): { filename: string; content: string } {
  const content = toCsv(
    [
      'Numéro', 'Date', 'Cliente', 'Téléphone', 'Ville', 'Adresse',
      'Articles', 'Sous-total FCFA', 'Livraison', 'Frais livraison FCFA',
      'Total FCFA', 'Paiement', 'État paiement', 'Étape', 'Commentaire',
    ],
    orders.map((order) => [
      order.orderNumber,
      new Date(order.createdAt).toLocaleString('fr-FR'),
      order.customerName,
      order.phone,
      order.city,
      order.address,
      order.items
        .map((item) => {
          const options = Object.entries(item.options)
            .map(([key, value]) => `${key} : ${value}`)
            .join(', ');
          return `${item.quantity} × ${item.name}${options ? ` (${options})` : ''}`;
        })
        .join(' | '),
      order.subtotal,
      order.deliveryLabel,
      order.deliveryFee ?? 'à confirmer',
      order.total,
      order.paymentMethodLabel,
      PAYMENT_STATUS_LABEL[order.paymentStatus],
      ORDER_STATUS_LABEL[order.orderStatus],
      order.note ?? '',
    ]),
  );
  return { filename: `commandes-${day()}.csv`, content };
}

export function sheinCsv(requests: SheinRequest[]): { filename: string; content: string } {
  // Une ligne par article : c'est la maille utile pour vérifier une commande
  // groupée, article par article, au moment de la passer sur SHEIN.
  const rows: unknown[][] = [];
  for (const request of requests) {
    request.items.forEach((item, index) => {
      rows.push([
        request.requestNumber,
        new Date(request.createdAt).toLocaleString('fr-FR'),
        request.customerName,
        request.phone,
        index + 1,
        item.reference ?? '',
        item.productUrl ?? '',
        item.size ?? '',
        item.color ?? '',
        item.quantity,
        item.priceAmount ?? '',
        item.priceCurrency ?? '',
        request.quote?.itemsSubtotal ?? '',
        request.quote?.serviceFee ?? '',
        request.quote?.deliveryFee ?? 'à confirmer',
        request.quote?.total ?? '',
        request.quotedTotal ?? 'non communiqué',
        SHEIN_STATUS_LABEL[request.status],
        request.note ?? '',
      ]);
    });
  }
  const content = toCsv(
    [
      'Demande', 'Date', 'Cliente', 'Téléphone', 'N° article', 'Référence', 'Lien',
      'Taille', 'Couleur', 'Qté', 'Prix affiché', 'Devise',
      'Articles FCFA (est.)', 'Frais de traitement', 'Livraison', 'Total estimé',
      'Montant confirmé', 'Étape', 'Commentaire',
    ],
    rows,
  );
  return { filename: `demandes-shein-${day()}.csv`, content };
}
