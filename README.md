# Afaura Luméa

Mini-site e-commerce mobile-first pour une activité de vente de hijabs à Dakar **et** de
commandes groupées SHEIN. Deux parcours dans un seul produit :

| Parcours | Étapes |
| --- | --- |
| **Boutique** | Découverte → panier → coordonnées → livraison → paiement → confirmation → suivi |
| **SHEIN** | Sélection sur SHEIN → transmission → vérification → montant confirmé en FCFA → paiement → groupage → suivi |

---

## Démarrer

```bash
npm install
cp .env.example .env.local   # renseigner au minimum VITE_WHATSAPP_NUMBER
npm run dev                  # http://localhost:3000
```

Autres commandes : `npm run build` (génère aussi `sitemap.xml` / `robots.txt`),
`npm run preview`, `npm run typecheck`.

### WhatsApp : numéro ou lien court

Deux façons de brancher WhatsApp, et elles ne se valent pas :

| Réglage | Ce que ça donne |
| --- | --- |
| `VITE_WHATSAPP_NUMBER` (ex. `221771234567`) | WhatsApp s'ouvre avec le **message déjà rédigé** : nom, numéro de commande, produits, quantités, total, livraison, commentaire. La cliente n'a qu'à appuyer sur Envoyer. |
| `VITE_WHATSAPP_LINK` (ex. `https://wa.me/message/A4C6VTCHWW4QH1`) | La conversation s'ouvre, mais **vide** : le format `wa.me/message/…` ne transporte pas de texte. Le site copie donc le message dans le presse-papier et affiche « collez-le dans la conversation ». |

Le lien court est configuré par défaut, le site est donc fonctionnel tout de suite. **Renseignez
le numéro dès que possible** : c'est la différence entre une cliente qui appuie sur Envoyer et une
cliente qui doit penser à coller. Les deux peuvent aussi se régler dans /admin → Réglages.

Si les deux sont vides, aucun bouton WhatsApp n'est affiché — le site propose le message à copier
plutôt qu'un lien mort.

---

## Espace admin

`/admin` — code d'accès `VITE_ADMIN_PASSCODE` (défaut : `lumea-admin`).

On y gère : produits (créer, modifier, supprimer, prix, stock, photos, variantes, badges),
commandes (statut, paiement, frais de livraison), demandes SHEIN (étape, montant confirmé),
et les réglages (numéro WhatsApp, date du prochain groupage, frais par zone, numéros Wave /
Orange Money, bandeau d'annonce).

> **Sécurité.** En mode local, ce code protège l'accès depuis un navigateur mais n'est pas une
> authentification serveur : le site est un front statique, tout ce qu'il contient est lisible.
> Pour un admin réellement protégé, activez Supabase (ci-dessous) : la connexion passe alors par
> Supabase Auth et les écritures sont contrôlées par les politiques RLS.

---

## Deux modes de données

Le code ne parle qu'à une seule interface (`src/services/types.ts`). Deux implémentations :

**1. Mode local (par défaut, zéro configuration)**
`localStorage`. Le site est immédiatement fonctionnel : commandes réelles, numéros de commande,
suivi, admin. Les données vivent dans le navigateur — donc une commande passée sur le téléphone
d'une cliente n'est pas visible depuis l'ordinateur du commerçant. Parfait pour tester et
démarrer, insuffisant pour exploiter à plusieurs.

**2. Mode Supabase (recommandé en production)**
Renseignez `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY`, puis exécutez
[`supabase/schema.sql`](supabase/schema.sql) dans le SQL editor du projet. L'application bascule
automatiquement : plus aucun changement de code. Créez ensuite le compte admin dans
Supabase → Authentication → Users.

Le schéma fournit les tables demandées (`products`, `orders`, `order_items`, `shein_requests`,
`shein_items`, `settings`), les séquences de numérotation, les politiques RLS, et surtout les
fonctions serveur `create_order` / `create_shein_request` / `find_order` / `find_shein_request`.

---

## Ce qui est volontairement honnête

Le site ne simule rien. Concrètement :

- **Pas de faux paiement.** Aucun montant n'est prélevé sur le site. On affiche les instructions
  Wave / Orange Money / paiement à la livraison, et le statut reste « en attente de vérification »
  tant que l'équipe n'a pas confirmé dans l'admin. Aucune fausse confirmation n'est jamais montrée.
- **Pas de récupération automatique du panier SHEIN.** Aucune API publique ne le permet. Le site
  propose à la place un formulaire multi-articles (lien, référence, taille, couleur, quantité,
  prix affiché, capture d'écran) qui génère un message WhatsApp structuré.
- **Pas de prix inventés.** Les frais de livraison non paramétrés s'affichent « à confirmer », et
  le total indique « + livraison » au lieu d'un montant approximatif.
- **Pas de compte à rebours fictif.** Sans `NEXT_GROUPING_DATE`, le site écrit que la date sera
  annoncée sur WhatsApp. Le compteur n'apparaît que si une vraie date est saisie.
- **Pas de faux avis, faux stocks ni fausses statistiques.** Les badges « Nouveau » et
  « Populaire » existent dans le modèle et se règlent dans l'admin ; ils ne sont activés sur
  aucun produit par défaut.
- **Les montants ne sont pas calculés par le navigateur.** Le checkout n'envoie que des
  identifiants produits et des quantités : les prix sont relus dans le catalogue (mode local) ou
  recalculés par une fonction Postgres `SECURITY DEFINER` (mode Supabase).

---

## Catalogue

Les 8 articles pré-chargés (`src/data/seed.ts`) reprennent le catalogue WhatsApp existant, aux
prix réels en FCFA : Jersey 1 500, Jersey frisé 2 000, Satin imprimé 3 500, Modal simple 4 500,
Modal imprimé 5 500, Dentelle 5 000, Pièce unique 6 000, Hijab tape 1 000.

Les visuels sont recadrés depuis les vignettes du catalogue : ils sont donc de définition
modeste. Remplacez-les par des photos haute définition depuis **/admin → Produits** (les images
sont redimensionnées et compressées automatiquement à l'import). Même chose pour les variantes :
seule « Dentelle » a des couleurs déclarées (noir / blanc, visibles sur la photo) ; pour les
autres, la cliente indique une couleur souhaitée qui remonte dans le message WhatsApp, et vous
pouvez déclarer de vraies variantes en une ligne dans l'admin (`Couleur: Noir, Beige`).

---

## Architecture

```
src/
  config/site.ts        Toute la configuration (WHATSAPP_NUMBER, zones, paiements…)
  types/                Types partagés
  lib/                  Routeur, formatage FCFA, WhatsApp, SEO, images, statuts
  services/             Contrat DataSource + adaptateurs local et Supabase
  hooks/                Panier, réglages, auth admin, toasts, reveal, compte à rebours
  components/  ui/ layout/ home/ product/ cart/ order/
  pages/                Une page par route, admin/ pour l'espace administrateur
  data/seed.ts          Catalogue de départ
supabase/schema.sql     Tables, RLS, fonctions serveur
scripts/                Génération du sitemap
```

**Stack** : React 19 + TypeScript strict + Tailwind CSS v4 + Vite. Le routeur est un micro-routeur
maison (~90 lignes, `src/lib/router.tsx`) : sur une connexion mobile sénégalaise, chaque kilo-octet
compte. Bundle : ~105 Ko gzip.

Next.js serait le choix naturel pour du rendu serveur (SEO produit indexé sans JavaScript). Ici
l'environnement est une SPA Vite : le SEO est traité côté client (titres, descriptions, Open Graph,
JSON-LD `Product` / `Store` / `FAQPage`, sitemap, URLs propres), ce qui suffit à Google mais reste
en deçà d'un rendu serveur. La couche `services/` est justement isolée pour rendre une migration
Next.js indolore.

**Déploiement** : hébergement statique classique (`npm run build` → `dist/`). Une seule règle
requise : rediriger toutes les routes inconnues vers `index.html` (fallback SPA), sans quoi
`/boutique` renverrait un 404 au rafraîchissement.

---

## Ce qui reste à faire pour aller plus loin

- Uploader les captures SHEIN vers Supabase Storage plutôt que de les compresser en base64
  (le champ `shein_items.image` est déjà prévu pour un chemin Storage).
- Brancher une vraie API de paiement (Wave Business, PayDunya, Intouch) : l'interface de
  sélection et les statuts de paiement sont déjà en place, il ne manque que l'appel serveur.
- Notifications automatiques (WhatsApp Business API) au changement de statut d'une commande.
