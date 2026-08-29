/**
 * ─────────────────────────────────────────────────────────────
 *  CONFIGURATION UNIQUE DU SITE
 * ─────────────────────────────────────────────────────────────
 *  Tout ce qui change d'une boutique à l'autre est ici.
 *  Rien de tout cela n'est codé en dur ailleurs dans le projet.
 *
 *  Les valeurs peuvent être surchargées :
 *    1. par les variables d'environnement (fichier .env.local)
 *    2. puis par l'espace admin (/admin → Réglages), qui écrit
 *       dans la couche `settings` de la base de données.
 */

const env = import.meta.env;

/**
 * Numéro WhatsApp au format international SANS "+" ni espaces. Ex : 221771234567
 *
 * C'est LA valeur qui permet de pré-remplir automatiquement les messages
 * (récapitulatif de commande, demande SHEIN). Sans elle, le site bascule sur
 * WHATSAPP_LINK ci-dessous et propose à la cliente de copier le message.
 */
export const WHATSAPP_NUMBER: string = env.VITE_WHATSAPP_NUMBER ?? '221781071604';

/**
 * Lien court WhatsApp Business (wa.me/message/XXXX) — solution de repli.
 * Il ouvre bien la conversation, mais ne peut PAS transporter de message
 * pré-rempli : ce format ne le prévoit pas. Le site copie alors le message
 * dans le presse-papier avant d'ouvrir WhatsApp.
 */
export const WHATSAPP_LINK: string =
  env.VITE_WHATSAPP_LINK ?? 'https://wa.me/message/A4C6VTCHWW4QH1';

/** Date/heure de clôture du prochain groupage (ISO 8601). Vide = aucun groupage annoncé. */
export const NEXT_GROUPING_DATE: string = env.VITE_NEXT_GROUPING_DATE ?? '';

/** Numéros marchands pour le paiement mobile. Vides = instructions envoyées sur WhatsApp. */
export const WAVE_NUMBER: string = env.VITE_WAVE_NUMBER ?? '221765614578';
export const ORANGE_MONEY_NUMBER: string = env.VITE_ORANGE_MONEY_NUMBER ?? '221781071604';

/** Adresse e-mail de contact (facultative). */
export const CONTACT_EMAIL: string = env.VITE_CONTACT_EMAIL ?? '';

/** Compte Instagram (sans @). Vide = le lien n'est pas affiché. */
export const INSTAGRAM_HANDLE: string = env.VITE_INSTAGRAM_HANDLE ?? 'afau.ra';

/**
 * Compte TikTok (sans @). Vide tant que la boutique ne l'a pas communiqué :
 * le lien n'apparaît pas, plutôt que de pointer vers un compte inventé.
 */
export const TIKTOK_HANDLE: string = env.VITE_TIKTOK_HANDLE ?? 'mrs_shiinee';

/**
 * Tableau Pinterest de la boutique. Adresse complète : Pinterest ne se déduit
 * pas d'un identifiant comme Instagram ou TikTok.
 */
export const PINTEREST_URL: string = env.VITE_PINTEREST_URL ?? 'https://pin.it/1PkUIqPuv';

/** URL publique du site, utilisée pour les balises SEO / Open Graph. */
export const SITE_URL: string =
  env.VITE_SITE_URL ?? (typeof window !== 'undefined' ? window.location.origin : '');

export const BRAND = {
  name: 'Afaura Luméa',
  shortName: 'Luméa',
  tagline: 'Tes envies, notre organisation.',
  /** Une phrase = tout le concept. Affichée dans le hero. */
  pitch:
    "Voiles, abayas et commandes SHEIN, commandés pour toi et regroupés jusqu'à Saint-Louis. Un prix clair en FCFA, confirmé avant que tu paies.",
  city: 'Saint-Louis, Sénégal',
  currency: 'FCFA',
} as const;

/** Frais de service SHEIN. `null` = calculé au cas par cas et confirmé avant paiement. */
export const SHEIN_SERVICE_FEE: number | null = null;

/**
 * Zones de livraison.
 * `fee: null` ⇒ le montant n'est pas encore paramétré : le site affiche
 * honnêtement « frais confirmés sur WhatsApp » au lieu d'inventer un prix.
 * Modifiable dans /admin → Réglages.
 */
export interface DeliveryZone {
  id: string;
  label: string;
  hint?: string;
  fee: number | null;
  type: 'delivery' | 'pickup';
}

export const DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'pickup',
    label: 'Point de retrait',
    hint: 'Adresse et horaires communiqués sur WhatsApp après confirmation.',
    fee: 0,
    type: 'pickup',
  },
  {
    // Les identifiants restent neutres : changer de ville ne modifie que le libellé,
    // et les commandes déjà enregistrées gardent une zone valide.
    id: 'city',
    label: 'Livraison Saint-Louis',
    hint: "Île, Sor et quartiers de la ville.",
    fee: null,
    type: 'delivery',
  },
  {
    id: 'around',
    label: 'Environs de Saint-Louis',
    hint: 'Communes voisines et périphérie.',
    fee: null,
    type: 'delivery',
  },
  {
    /*
     * L'identifiant reste `regions` : les commandes déjà enregistrées le
     * portent, et les frais configurés dans l'administration sont rangés
     * sous cette clé. Seul le libellé change quand la boutique dessert de
     * nouvelles villes — on ne nomme que celles où elle livre vraiment.
     */
    id: 'regions',
    label: 'Louga, Thiès, Dakar',
    hint: 'Expédition par transporteur. Frais selon la ville, confirmés sur WhatsApp.',
    fee: null,
    type: 'delivery',
  },
];

export interface PaymentMethod {
  id: string;
  label: string;
  description: string;
  /** true = la cliente paie avant l'expédition et transmet une preuve */
  requiresProof: boolean;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'wave',
    label: 'Wave',
    description: 'Transfert Wave, puis envoi de la capture de confirmation sur WhatsApp.',
    requiresProof: true,
  },
  {
    id: 'orange_money',
    label: 'Orange Money',
    description: 'Transfert Orange Money, puis envoi de la capture sur WhatsApp.',
    requiresProof: true,
  },
  {
    id: 'cash',
    label: 'Paiement à la livraison',
    description: 'Vous réglez en espèces au moment de la remise, à Saint-Louis et ses environs.',
    requiresProof: false,
  },
];

/** Passe d'accès à l'espace admin en mode local (voir README : sécurité réelle = Supabase Auth). */
export const ADMIN_PASSCODE: string = env.VITE_ADMIN_PASSCODE ?? 'lumea-admin';
