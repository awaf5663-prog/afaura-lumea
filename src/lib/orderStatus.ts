import type { OrderStatus, PaymentStatus, SheinStatus } from '@/src/types';

/** Étapes visibles par la cliente, dans l'ordre. */
export const ORDER_STEPS: Array<{ id: OrderStatus; label: string; hint: string }> = [
  { id: 'received', label: 'Commande reçue', hint: 'Nous avons votre demande.' },
  { id: 'payment_confirmed', label: 'Paiement confirmé', hint: 'Le règlement est vérifié.' },
  { id: 'grouped', label: 'Commande groupée', hint: 'Intégrée au groupage en cours.' },
  { id: 'in_transit', label: 'En acheminement', hint: 'Le colis a quitté le fournisseur.' },
  { id: 'arrived', label: 'Arrivée au Sénégal', hint: 'Réception et tri en cours.' },
  { id: 'ready', label: 'Prête à être livrée', hint: 'Nous convenons du créneau avec vous.' },
  { id: 'delivered', label: 'Livrée', hint: 'Commande remise. Merci !' },
];

export const SHEIN_STEPS: Array<{ id: SheinStatus; label: string; hint: string }> = [
  { id: 'received', label: 'Demande reçue', hint: 'Nous vérifions vos articles.' },
  { id: 'quoted', label: 'Montant confirmé', hint: 'Le total en FCFA vous a été communiqué.' },
  { id: 'payment_confirmed', label: 'Paiement confirmé', hint: 'Le règlement est vérifié.' },
  { id: 'grouped', label: 'Commande passée et groupée', hint: 'Vos articles partent avec le groupage.' },
  { id: 'in_transit', label: 'En acheminement', hint: 'Le colis est en route.' },
  { id: 'arrived', label: 'Arrivée au Sénégal', hint: 'Réception et tri en cours.' },
  { id: 'ready', label: 'Prête à être livrée', hint: 'Nous convenons du créneau avec vous.' },
  { id: 'delivered', label: 'Livrée', hint: 'Commande remise. Merci !' },
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  received: 'Commande reçue',
  payment_confirmed: 'Paiement confirmé',
  grouped: 'Commande groupée',
  in_transit: 'En acheminement',
  arrived: 'Arrivée au Sénégal',
  ready: 'Prête à être livrée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

export const SHEIN_STATUS_LABEL: Record<SheinStatus, string> = {
  received: 'Demande reçue',
  quoted: 'Montant confirmé',
  payment_confirmed: 'Paiement confirmé',
  grouped: 'Commande groupée',
  in_transit: 'En acheminement',
  arrived: 'Arrivée au Sénégal',
  ready: 'Prête à être livrée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  pending: 'En attente de paiement',
  proof_sent: 'Preuve reçue, en vérification',
  confirmed: 'Paiement confirmé',
  refused: 'Paiement non validé',
};
