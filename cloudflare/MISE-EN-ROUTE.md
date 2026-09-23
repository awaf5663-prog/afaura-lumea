# Brancher la boutique sur Cloudflare

Quatre étapes. Tout se fait depuis GitHub, dans le navigateur — rien à
installer sur votre téléphone ni sur votre ordinateur.

À la fin, la boutique lit et écrit ses données chez Cloudflare, et **l'espace
administrateur redevient utilisable** : commandes, stock, réglages.

> **Pourquoi ce déménagement.** Supabase coupe *tout* quand le quota gratuit
> est dépassé — y compris la connexion à l'administration, qui interroge la
> base avant même d'accepter un mot de passe. Chez Cloudflare, ce qui était
> facturé au volume de données ne l'est plus : la gratuité tient au nombre
> d'appels, et une boutique comme la vôtre en est très loin.

---

## Ce qu'il faut avoir sous la main

Deux choses, à déposer dans **Settings → Secrets and variables → Actions**,
onglet **Secrets** → *New repository secret* :

| Nom | Ce que c'est |
|---|---|
| `CLOUDFLARE_API_TOKEN` | le jeton d'API Cloudflare, avec les permissions **Workers Scripts (Edit)** et **D1 (Edit)** |
| `ADMIN_MOT_DE_PASSE` | le mot de passe qui ouvrira votre espace administrateur |

**Ces deux valeurs ne doivent apparaître nulle part ailleurs** : ni dans une
conversation, ni dans une photo d'écran, ni dans un fichier du dépôt. Un secret
qui a été vu une fois est un secret perdu — il faut alors le remplacer.

Choisissez un mot de passe que vous n'utilisez nulle part ailleurs. C'est lui
seul qui garde vos commandes.

---

## 1. Préparer la base

Onglet **Actions** → **Cloudflare — mise en place** → **Run workflow**.

Laissez les deux cases décochées et lancez.

Cette action crée la base, y installe les tables, et **verse le catalogue** —
les 83 articles du site. Elle est sans danger à relancer : les articles déjà
présents sont mis à jour, jamais dupliqués.

> La case *remettre_a_zero* **efface tout**. Elle n'a de sens qu'avant la
> première commande. Une fois que des commandes sont en base, ne la cochez
> plus jamais.
>
> La case *activer_r2* ne sert que le jour où vous voudrez téléverser des
> photos depuis l'administration. R2 demande d'être activé une fois à la main
> dans le tableau de bord Cloudflare. Rien ne l'attend : les photos livrées
> avec le site s'affichent sans lui.

## 2. Publier le Worker

Onglet **Actions** → **Cloudflare — publier le Worker** → **Run workflow**.

Le Worker est la **seule porte** vers vos données. C'est lui qui calcule les
montants, qui vérifie le mot de passe, et qui refuse tout ce qui ne regarde pas
une visiteuse. Rien ne parle à la base directement — pas même le site.

À la fin, l'action affiche une ligne :

```
ADRESSE DU WORKER : https://afaura-lumea-api.…workers.dev
```

**Recopiez cette adresse**, vous en avez besoin à l'étape suivante.

> L'action vérifie aussi que le Worker répond vraiment, en l'appelant comme
> le ferait une visiteuse. Publier et répondre ne sont pas la même chose.

## 3. Dire au site où sont ses données

**Settings → Secrets and variables → Actions**, onglet **Variables** (pas
Secrets) → *New repository variable* :

| Nom | Valeur |
|---|---|
| `WORKER_URL` | l'adresse relevée à l'étape 2 |

Ce n'est pas un secret : cette adresse part de toute façon dans le site. Ce qui
protège vos données, c'est que le Worker exige le mot de passe pour tout ce qui
est réservé.

**Tant que cette variable est vide, rien ne change** : le site continue de lire
Supabase. La renseigner est ce qui fait la bascule ; l'effacer est ce qui fait
marche arrière. C'est volontaire — on peut revenir en un geste.

## 4. Republier le site

Onglet **Actions** → **Publier le site** → **Run workflow**.

Puis ouvrez `afauralumea.shop/admin` et connectez-vous avec le mot de passe de
l'étape « Ce qu'il faut avoir sous la main ».

Le bandeau en haut de l'administration doit dire **« Connecté à Cloudflare »**
avec le nombre d'articles. S'il dit autre chose, il dit aussi quoi faire.

---

## Reprendre les commandes déjà passées

Le catalogue vient du code : l'étape 1 le remet en place toute seule. Vos
**commandes, demandes SHEIN, groupages et réglages**, eux, ne sont nulle part
ailleurs que dans Supabase.

> Faisable seulement tant que l'éditeur SQL de Supabase répond. Le quota
> bloque les lectures du site ; l'éditeur du tableau de bord passe souvent
> quand même. Si c'est le cas, **faites cette partie en premier** — c'est la
> seule chose qui ne se refabrique pas.

**Vos clientes ne passent par personne.** Leurs noms, téléphones et adresses
vont de votre écran Supabase à votre écran Cloudflare, directement. Ils ne
partent ni dans un fichier envoyé, ni dans une conversation, ni dans le dépôt.

### a) Dans Supabase

**SQL Editor** → coller tout le contenu de
`cloudflare/reprise-depuis-supabase.sql` → **Run**.

Cette requête ne modifie rien : elle lit, et rend **un seul résultat** — une
longue suite d'instructions. Copiez-la et gardez-la (Notes, un e-mail à
vous-même, peu importe, du moment que c'est à vous).

### b) Dans Cloudflare, une fois l'étape 1 faite

**Workers & Pages → D1 → afaura-lumea → Console** → coller ce que vous avez
gardé → exécuter.

### c) Vérifier

Dans l'administration, onglet **Commandes** : vos anciennes commandes sont là,
avec leurs montants et leur avancement.

> **Ce que la requête fait et qui ne se voit pas.** Elle remet les compteurs de
> numérotation là où Postgres s'était arrêté. Sans cela, votre première
> commande chez Cloudflare porterait un numéro **déjà donné à une cliente**, et
> le suivi rendrait l'autre commande. C'est la partie la plus facile à oublier,
> et la plus ennuyeuse à réparer après coup.

> **Si vous préférez passer par des fichiers** (export JSON table par table),
> `scripts/reprendre-supabase.mjs` fait la même conversion à partir d'un
> dossier de `.json`. Le résultat contient alors vos clientes : il reste sur
> votre machine, et le dépôt est réglé pour le refuser.

---

## Rouvrir la boutique

Le site est actuellement **en pause** aux yeux des visiteuses. C'est un réglage
à part, volontairement : on met la boutique en pause précisément les jours où
la base ne répond pas, et il ne faut pas que ce réglage dépende de la base.

Pour rouvrir : dans `.github/workflows/pages.yml`, remplacer

```yaml
VITE_BOUTIQUE_EN_PAUSE: oui
```

par `non`, puis republier le site. L'espace administrateur, lui, n'a jamais été
fermé.

---

## Les notifications de commande

**ntfy continue de fonctionner**, et à l'identique. Ce n'est pas Supabase qui
envoyait l'alerte : c'est un appel à ntfy.sh au moment où la commande est
enregistrée. Le Worker fait le même appel, avec le même canal. Vous n'avez rien
à changer dans l'application sur votre téléphone.

Le canal reste dans une table que seule l'administration connectée peut lire —
qui connaît le nom du canal reçoit vos notifications.

---

## Si quelque chose ne va pas

- **« Cloudflare ne répond pas comme prévu »** dans l'administration : le
  bandeau indique le remède. Le plus souvent, relancer l'action *mise en place*
  suffit — elle recrée ce qui manque sans toucher aux données existantes.
- **« Code incorrect »** alors que le mot de passe est le bon : le Worker n'a
  peut-être pas encore reçu le secret. Relancez l'action *publier le Worker*.
- **Le site montre un catalogue vide** : l'étape 1 n'a pas versé le catalogue.
  Relancez-la et regardez la dernière ligne du journal, qui compte les
  articles.
- **Vous avez changé le mot de passe** dans les secrets : relancez l'action
  *publier le Worker*, sans quoi le Worker garde l'ancien.
