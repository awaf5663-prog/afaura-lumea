import type { Order, SheinRequest } from '@/src/types';
import { formatFcfa, prettyPhone } from './format';

/**
 * Construction des liens WhatsApp.
 * Le numéro n'est JAMAIS écrit en dur ici : il vient toujours de la configuration
 * (src/config/site.ts → WHATSAPP_NUMBER, surchargeable dans /admin → Réglages).
 */
export function whatsappLink(number: string, message: string): string {
  const clean = number.replace(/[^\d]/g, '');
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function isWhatsappConfigured(number: string): boolean {
  return /^\d{8,15}$/.test(number.replace(/[^\d]/g, ''));
}

export function buildOrderMessage(order: Order): string {
  const lines: string[] = [];
  lines.push(`Bonjour, je souhaite confirmer la commande ${order.orderNumber}.`);
  lines.push('');
  lines.push(`Nom : ${order.customerName}`);
  lines.push(`Téléphone : ${prettyPhone(order.phone)}`);
  lines.push('');
  lines.push('Produits :');
  order.items.forEach((item) => {
    const opts = Object.entries(item.options)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    lines.push(
      `• ${item.name}${opts ? ` (${opts})` : ''} × ${item.quantity} — ${formatFcfa(
        item.unitPrice * item.quantity,
      )}`,
    );
  });
  lines.push('');
  lines.push(`Sous-total : ${formatFcfa(order.subtotal)}`);
  lines.push(
    `Livraison : ${order.deliveryLabel}${
      order.deliveryFee === null ? ' (frais à confirmer)' : ` — ${formatFcfa(order.deliveryFee)}`
    }`,
  );
  if (order.address) lines.push(`Adresse : ${order.address}, ${order.city}`);
  lines.push(
    `Total : ${formatFcfa(order.total)}${order.deliveryFee === null ? ' + livraison' : ''}`,
  );
  lines.push(`Paiement : ${order.paymentMethodLabel}`);
  if (order.note) {
    lines.push('');
    lines.push(`Commentaire : ${order.note}`);
  }
  lines.push('');
  lines.push('Merci.');
  return lines.join('\n');
}

export function buildSheinMessage(request: SheinRequest): string {
  const lines: string[] = [];
  lines.push(`Bonjour, voici ma demande SHEIN ${request.requestNumber}.`);
  lines.push('');
  lines.push(`Nom : ${request.customerName}`);
  lines.push(`Téléphone : ${prettyPhone(request.phone)}`);
  lines.push('');
  lines.push(`Articles (${request.items.length}) :`);
  request.items.forEach((item, index) => {
    lines.push('');
    lines.push(`${index + 1}. ${item.reference || 'Article'}`);
    if (item.productUrl) lines.push(`   Lien : ${item.productUrl}`);
    const details = [
      item.size && `Taille ${item.size}`,
      item.color && `Couleur ${item.color}`,
      `Qté ${item.quantity}`,
    ]
      .filter(Boolean)
      .join(' · ');
    lines.push(`   ${details}`);
    if (item.displayedPrice) lines.push(`   Prix affiché sur SHEIN : ${item.displayedPrice}`);
    if (item.screenshotName) lines.push(`   Capture : ${item.screenshotName} (je l'envoie ici)`);
  });
  if (request.note) {
    lines.push('');
    lines.push(`Commentaire : ${request.note}`);
  }
  lines.push('');
  lines.push('Merci de me confirmer le montant total en FCFA.');
  return lines.join('\n');
}

export function buildProductMessage(productName: string, price: string, url: string): string {
  return `Bonjour, je suis intéressée par « ${productName} » (${price}).\n${url}\nEst-il disponible ?`;
}

export function buildTrackingMessage(orderNumber: string): string {
  return `Bonjour, je souhaite avoir des nouvelles de ma commande ${orderNumber}.`;
}
