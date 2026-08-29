# Brancher la boutique sur Supabase

Cinq étapes, dans cet ordre. Comptez un quart d'heure.

Tant que ce n'est pas fait, le site fonctionne en **mode local** : tout est
enregistré dans le navigateur qui l'affiche. Une commande envoyée depuis le
téléphone d'une cliente reste sur son téléphone. C'est ce que Supabase répare.

---

## 1. Créer les tables

Dans le projet Supabase : **SQL Editor** → *New query* → coller tout le contenu
de `supabase/schema.sql` → **Run**.

Ce fichier crée les tables, les règles d'accès (RLS) et les fonctions qui
recalculent les montants côté serveur. Il est réexécutable sans risque.

## 2. Verser le catalogue

Même endroit, nouvelle requête : coller `supabase/seed-catalogue.sql` → **Run**.

Les 11 articles arrivent en base. Réexécutable aussi : les articles déjà
présents sont mis à jour, et les photos téléversées depuis l'admin ne sont
jamais écrasées.

> Les photos ne sont pas copiées en base : ce sont des fichiers du site, dont
> l'adresse change à chaque publication. Le site affiche donc celles livrées
> avec lui, jusqu'à ce que vous téléversiez les vôtres depuis l'admin.

## 3. Créer votre compte administrateur

**Authentication** → *Users* → **Add user** → *Create new user*.

Mettez votre e-mail et un mot de passe solide, et cochez « Auto Confirm User »
pour ne pas avoir à valider un e-mail.

C'est ce compte qui ouvrira l'espace admin. Le code `lumea-admin` ne sert plus
dès que Supabase est branché : l'admin demande alors un e-mail et un mot de
passe, vérifiés par Supabase.

## 4. Renseigner les deux valeurs dans le site

Dans le fichier `.env` à la racine du projet :

```
VITE_SUPABASE_URL=https://VOTRE-PROJET.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

Les deux se trouvent dans **Settings → API**. La clé attendue est la clé
**publique** — « publishable » dans les projets récents, « anon public » dans
les anciens.

> Ne mettez **jamais** ici la clé `service_role` / `secret` : elle contourne
> toutes les règles de sécurité. La clé publique, elle, est faite pour partir
> dans le site — ce qui protège les données, ce sont les règles RLS.

Sur un hébergeur (Vercel, Netlify), ces deux variables se renseignent dans les
réglages du projet, pas dans un fichier.

## 5. Vérifier

Ouvrez l'espace admin. En haut, un bandeau annonce l'état **réel** de la
connexion :

- **Connecté à Supabase — 11 articles en base** : tout est en place.
- **0 article en base** : l'étape 2 n'a pas été faite.
- **Les tables n'existent pas encore** : l'étape 1 n'a pas été faite.
- **La clé publique semble incorrecte** : reprenez-la dans Settings → API.

Le vrai test, ensuite : envoyez une commande depuis un téléphone, et regardez
si elle apparaît dans l'admin depuis un **autre** appareil. C'est exactement ce
qui ne marchait pas avant.

---

## Après coup

- **Changer le catalogue** se fait depuis l'admin, plus par SQL.
- Si vous modifiez `src/data/seed.ts`, régénérez le fichier avec
  `node scripts/generate-supabase-seed.mjs`.
- Les réglages (tarifs, offres, groupages) sont stockés dans la table
  `settings`, ligne 1. Ils suivent automatiquement.

---

## Recevoir une alerte à chaque commande (facultatif)

Sans cela, une commande dont la cliente n'envoie pas le message WhatsApp
attend sans prévenir personne dans l'administration.

1. Passez `supabase/mise-a-jour.sql` (SQL Editor → New query → coller → Run).
   L'étape 7 installe le nécessaire ; rien ne part tant que le robot n'est
   pas renseigné.
2. Sur Telegram, écrivez à **@BotFather**, envoyez `/newbot`, choisissez un
   nom. Il répond avec un **jeton** de la forme `123456789:AA…`.
3. Toujours sur Telegram, écrivez à **@userinfobot** : il répond avec votre
   **identifiant**, un nombre.
4. Ouvrez votre robot et envoyez-lui n'importe quel message — sans ce
   premier contact, Telegram lui interdit de vous écrire.
5. Administration → Réglages → **Alerte nouvelle commande** : collez les
   deux valeurs, cochez « Envoyer les alertes », enregistrez, puis
   « Envoyer un test ».

Le jeton est rangé dans une table à laquelle le site public n'a aucun accès
— jamais dans les réglages, qui sont lisibles par tout visiteur.
