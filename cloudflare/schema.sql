-- ═══════════════════════════════════════════════════════════════════════
--  LE SCHÉMA, PORTÉ DE POSTGRES (SUPABASE) VERS SQLITE (CLOUDFLARE D1)
-- ═══════════════════════════════════════════════════════════════════════
--
--  Ce que ce fichier change par rapport à supabase/schema.sql, et pourquoi.
--
--  1. LES PHOTOS NE SONT PLUS DANS LA BASE.
--
--     C'est le changement qui compte. Les photos téléversées depuis
--     l'administration étaient enregistrées EN CLAIR dans la ligne du
--     produit — 170 à 300 Ko chacune. Une base de données n'est pas faite
--     pour transporter des images : c'est ce qui a épuisé le quota de
--     transfert du fournisseur précédent, et ça aurait suivi la boutique
--     partout ailleurs.
--
--     `images` ne contient donc plus que des ADRESSES : celles du dépôt
--     pour les photos livrées avec le site, celles de R2 pour celles que
--     la boutique téléverse. Quelques dizaines d'octets au lieu d'un
--     mégaoctet.
--
--     Par voie de conséquence, `thumbnails`, `thumbnail` et `images_count`
--     n'ont plus de raison d'être : ils n'existaient que pour éviter de
--     télécharger les grandes photos. La liste d'adresses est assez légère
--     pour voyager entière.
--
--  2. AUCUNE RÈGLE D'ACCÈS DANS LA BASE.
--
--     Postgres portait treize politiques RLS. SQLite n'en a pas. La porte
--     est désormais le Worker, et LUI SEUL : rien ne parle à la base sans
--     passer par lui. Ce qui était garanti par la base devient donc une
--     responsabilité du code — c'est dit ici pour que personne ne
--     l'oublie, et les recettes le vérifient.
--
--  3. LES MONTANTS SE CALCULENT TOUJOURS CÔTÉ SERVEUR.
--
--     `create_order` était une fonction Postgres ; c'est maintenant du
--     code dans le Worker. La règle ne bouge pas : on ne fait jamais
--     confiance à un montant envoyé par le navigateur.
--
--  4. Correspondances de types : uuid → text (le Worker tire l'identifiant),
--     jsonb → text contenant du JSON, timestamptz → text ISO 8601,
--     boolean → integer 0/1, numeric → real, séquences → table `compteurs`.

pragma foreign_keys = on;

-- ── Articles ───────────────────────────────────────────────────────────
create table if not exists products (
  id                     text primary key,
  slug                   text unique not null,
  name                   text not null,
  description            text not null default '',
  price                  integer not null check (price >= 0),        -- FCFA, entier
  compare_at_price       integer check (compare_at_price >= 0),
  category               text not null,
  -- Des ADRESSES de photos, jamais les photos. Voir l'en-tête, point 1.
  images                 text not null default '[]' check (json_valid(images)),
  variants               text not null default '[]' check (json_valid(variants)),
  option_prices          text not null default '{}' check (json_valid(option_prices)),
  stock                  integer check (stock >= 0),                 -- null = non suivi
  status                 text not null default 'active'
                           check (status in ('active', 'draft', 'sold_out')),
  is_new                 integer not null default 0 check (is_new in (0, 1)),
  is_popular             integer not null default 0 check (is_popular in (0, 1)),
  other_colors_available integer not null default 0 check (other_colors_available in (0, 1)),
  ready_to_ship          integer not null default 0 check (ready_to_ship in (0, 1)),
  color_chart_id         text,
  measurements           text not null default '[]' check (json_valid(measurements)),
  created_at             text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

create index if not exists products_created_at_idx on products(created_at desc);

-- ── Compteurs de numéros ───────────────────────────────────────────────
--  Postgres avait des séquences. SQLite n'en a pas : une ligne par
--  compteur, incrémentée dans la même transaction que la commande. Le
--  Worker s'en sert pour AFA-0001, SHE-0001, etc.
create table if not exists compteurs (
  nom     text primary key,
  valeur  integer not null default 0
);
insert into compteurs (nom, valeur) values ('commande', 0) on conflict (nom) do nothing;
insert into compteurs (nom, valeur) values ('shein', 0)    on conflict (nom) do nothing;

-- ── Commandes ──────────────────────────────────────────────────────────
create table if not exists orders (
  id                            text primary key,
  order_number                  text unique not null,
  customer_name                 text not null,
  phone                         text not null,
  address                       text not null default '',
  city                          text not null default '',
  note                          text,
  delivery_zone_id              text not null,
  delivery_label                text not null,
  delivery_fee                  integer,          -- null = à confirmer
  delivery_fee_before_promotion integer,          -- tarif avant offre, si offerte
  subtotal                      integer not null,
  discount                      integer not null default 0,
  promotion_label               text,
  promo_code                    text not null default '',
  total                         integer not null,
  payment_method                text not null,
  payment_method_label          text not null,
  payment_status                text not null default 'pending'
    check (payment_status in ('pending', 'proof_sent', 'confirmed', 'refused')),
  order_status                  text not null default 'received'
    check (order_status in ('received','payment_confirmed','grouped','in_transit',
                            'arrived','ready','delivered','cancelled')),
  created_at                    text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at                    text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  -- Corbeille : la ligne existe encore, elle n'est simplement plus active.
  deleted_at                    text
);

create table if not exists order_items (
  id         text primary key,
  order_id   text not null references orders(id) on delete cascade,
  product_id text not null,
  name       text not null,
  quantity   integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0),
  options    text not null default '{}' check (json_valid(options))
);

create index if not exists order_items_order_id_idx on order_items(order_id);
create index if not exists orders_lookup_idx        on orders(order_number, phone);
create index if not exists orders_created_at_idx    on orders(created_at desc);

-- ── Groupages ──────────────────────────────────────────────────────────
create table if not exists groupings (
  id                 text primary key,
  reference          text unique not null,
  destination        text not null default '',
  opening_date       text,
  closing_date       text,
  max_orders         integer not null check (max_orders > 0),
  min_orders         integer not null default 0 check (min_orders >= 0),
  reserved_count     integer not null default 0 check (reserved_count >= 0),
  manual_order_count integer not null default 0 check (manual_order_count >= 0),
  logistics_cost     integer check (logistics_cost >= 0),
  status             text not null default 'open'
    check (status in ('open','full','closed','in_transit','arrived',
                      'delivered','postponed','cancelled')),
  note               text,
  created_at         text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at         text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- ── Demandes SHEIN ─────────────────────────────────────────────────────
create table if not exists shein_requests (
  id                  text primary key,
  request_number      text unique not null,
  customer_name       text not null,
  phone               text not null,
  note                text,
  status              text not null default 'received'
    check (status in ('received','quoted','payment_confirmed','grouped','in_transit',
                      'arrived','ready','delivered','cancelled')),
  quoted_total        integer,                       -- null tant que non chiffré
  grouping_id         text references groupings(id) on delete set null,
  delivery_option_id  text not null default '',
  -- Déclaration de la cliente, jamais une vérification : la boutique confirme
  -- avant d'accorder une offre réservée aux étudiantes.
  is_student          integer not null default 0 check (is_student in (0, 1)),
  promo_code          text not null default '',
  quote               text check (quote is null or json_valid(quote)),
  created_at          text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at          text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  deleted_at          text
);

create table if not exists shein_items (
  id              text primary key,
  request_id      text not null references shein_requests(id) on delete cascade,
  product_url     text not null default '',
  reference       text not null default '',
  size            text not null default '',
  color           text not null default '',
  quantity        integer not null default 1 check (quantity > 0),
  displayed_price text not null default '',
  price_amount    real,                              -- montant déclaré par la cliente
  price_currency  text not null default 'XOF',
  image           text                               -- adresse R2, jamais l'image
);

create index if not exists shein_items_request_id_idx on shein_items(request_id);
create index if not exists shein_lookup_idx           on shein_requests(request_number, phone);

-- ── Réglages (une seule ligne) ─────────────────────────────────────────
create table if not exists settings (
  id                    integer primary key check (id = 1),
  whatsapp_number       text not null default '',
  whatsapp_link         text not null default '',
  next_grouping_opening text,
  next_grouping_date    text,
  wave_number           text not null default '',
  wave_link             text not null default '',
  orange_money_number   text not null default '',
  orange_money_link     text not null default '',
  delivery_fees         text not null default '{}' check (json_valid(delivery_fees)),
  announcement          text not null default '',
  pricing               text not null default '{}' check (json_valid(pricing)),
  promotions            text not null default '[]' check (json_valid(promotions)),
  alert_thresholds      text not null default '{}' check (json_valid(alert_thresholds)),
  reviews               text not null default '[]' check (json_valid(reviews))
);
insert into settings (id) values (1) on conflict (id) do nothing;

-- ── Fréquentation ──────────────────────────────────────────────────────
create table if not exists visits (
  id         text primary key,
  visitor    text not null check (length(visitor) between 8 and 40),
  path       text not null check (length(path) <= 120),
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

create index if not exists visits_created_at_idx on visits(created_at);

-- ── Réglages d'alerte ──────────────────────────────────────────────────
--  ATTENTION : cette table porte des SECRETS — le jeton du robot Telegram
--  et le canal ntfy. Dans Postgres, deux serrures les protégeaient : une
--  politique RLS, et le retrait du droit de table à `anon`. Ici il n'y en
--  a aucune : c'est au Worker de ne JAMAIS servir cette table à quelqu'un
--  qui n'est pas la boutique. Une recette le vérifie en interrogeant le
--  Worker sans être connecté.
create table if not exists alert_settings (
  id                integer primary key check (id = 1),
  telegram_token    text not null default '',
  telegram_chat_id  text not null default '',
  ntfy_topic        text not null default '',
  enabled           integer not null default 0 check (enabled in (0, 1)),
  updated_at        text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
insert into alert_settings (id) values (1) on conflict (id) do nothing;
