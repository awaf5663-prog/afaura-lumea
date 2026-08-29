-- ═══════════════════════════════════════════════════════════════════════
--  Afaura Luméa — schéma Supabase
--  À exécuter dans le SQL editor du projet Supabase.
--
--  Principe de sécurité :
--   • la clé « anon » est publique : toute la protection repose sur les RLS ;
--   • le public peut LIRE les produits en vente, et RIEN d'autre ;
--   • le public peut CRÉER une commande via la fonction create_order,
--     qui recalcule les prix depuis la table products — le navigateur
--     n'envoie jamais de montant ;
--   • la lecture des commandes est réservée aux comptes authentifiés
--     (l'admin), sauf via find_order qui exige numéro + téléphone.
-- ═══════════════════════════════════════════════════════════════════════

create extension if not exists "pgcrypto";

-- ── Produits ───────────────────────────────────────────────────────────
create table if not exists products (
  id text primary key,
  slug text unique not null,
  name text not null,
  description text default '',
  price integer not null check (price >= 0),          -- FCFA, entier
  compare_at_price integer check (compare_at_price >= 0),
  category text not null,
  images jsonb not null default '[]'::jsonb,
  variants jsonb not null default '[]'::jsonb,
  stock integer check (stock >= 0),                    -- null = non suivi
  status text not null default 'active' check (status in ('active', 'draft', 'sold_out')),
  is_new boolean not null default false,
  is_popular boolean not null default false,
  other_colors_available boolean not null default false,
  color_chart_id text,                                 -- nuancier rattaché (src/config/colorCharts.ts)
  measurements jsonb not null default '[]'::jsonb,     -- mesures réelles de la pièce, saisies par la boutique
  created_at timestamptz not null default now()
);

-- ── Commandes ──────────────────────────────────────────────────────────
create sequence if not exists order_seq;
create sequence if not exists shein_seq;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_name text not null,
  phone text not null,
  address text default '',
  city text default '',
  note text,
  delivery_zone_id text not null,
  delivery_label text not null,
  delivery_fee integer,                                -- null = à confirmer
  delivery_fee_before_promotion integer,               -- tarif avant offre, si offerte
  subtotal integer not null,
  discount integer not null default 0,
  promotion_label text,
  promo_code text not null default '',
  total integer not null,
  payment_method text not null,
  payment_method_label text not null,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'proof_sent', 'confirmed', 'refused')),
  order_status text not null default 'received'
    check (order_status in ('received','payment_confirmed','grouped','in_transit','arrived','ready','delivered','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Corbeille : la ligne existe encore, elle n'est simplement plus active.
  deleted_at timestamptz
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id text not null,
  name text not null,
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0),
  options jsonb not null default '{}'::jsonb
);

create index if not exists order_items_order_id_idx on order_items(order_id);
create index if not exists orders_lookup_idx on orders(order_number, phone);

-- ── Groupages ──────────────────────────────────────────────────────────
create table if not exists groupings (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  destination text default '',
  opening_date timestamptz,
  closing_date timestamptz,
  max_orders integer not null check (max_orders > 0),
  min_orders integer not null default 0 check (min_orders >= 0),
  reserved_count integer not null default 0 check (reserved_count >= 0),
  manual_order_count integer not null default 0 check (manual_order_count >= 0),
  logistics_cost integer check (logistics_cost >= 0),
  status text not null default 'open'
    check (status in ('open','full','closed','in_transit','arrived','delivered','postponed','cancelled')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Demandes SHEIN ─────────────────────────────────────────────────────
create table if not exists shein_requests (
  id uuid primary key default gen_random_uuid(),
  request_number text unique not null,
  customer_name text not null,
  phone text not null,
  note text,
  status text not null default 'received'
    check (status in ('received','quoted','payment_confirmed','grouped','in_transit','arrived','ready','delivered','cancelled')),
  quoted_total integer,                                -- null tant que non chiffré
  grouping_id uuid references groupings(id) on delete set null,
  delivery_option_id text default '',
  -- Déclaration de la cliente, jamais une vérification : la boutique confirme
  -- avant d'accorder une offre réservée aux étudiantes.
  is_student boolean not null default false,
  promo_code text not null default '',
  quote jsonb,                                         -- estimation calculée côté serveur
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists shein_items (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references shein_requests(id) on delete cascade,
  product_url text default '',
  reference text default '',
  size text default '',
  color text default '',
  quantity integer not null default 1 check (quantity > 0),
  displayed_price text default '',
  price_amount numeric,                                 -- montant déclaré par la cliente
  price_currency text default 'XOF',
  image text                                            -- chemin Supabase Storage
);

create index if not exists shein_items_request_id_idx on shein_items(request_id);
create index if not exists shein_lookup_idx on shein_requests(request_number, phone);

-- ── Réglages (une seule ligne) ─────────────────────────────────────────
create table if not exists settings (
  id integer primary key default 1 check (id = 1),
  whatsapp_number text default '',
  whatsapp_link text default '',
  next_grouping_opening timestamptz,
  next_grouping_date timestamptz,
  wave_number text default '',
  orange_money_number text default '',
  delivery_fees jsonb not null default '{}'::jsonb,
  announcement text default '',
  pricing jsonb not null default '{}'::jsonb,           -- tarification SHEIN pilotée par l'admin
  promotions jsonb not null default '[]'::jsonb,
  alert_thresholds jsonb not null default '{}'::jsonb,
  reviews jsonb not null default '[]'::jsonb            -- avis recueillis et publiés par la boutique
);

-- Colonnes arrivées après la première mise en place : `create table if not
-- exists` ne les ajoute pas sur une base déjà créée.
alter table settings add column if not exists reviews jsonb not null default '[]'::jsonb;
alter table products add column if not exists measurements jsonb not null default '[]'::jsonb;
alter table orders add column if not exists deleted_at timestamptz;
alter table shein_requests add column if not exists deleted_at timestamptz;
alter table groupings add column if not exists opening_date timestamptz;
alter table settings add column if not exists next_grouping_opening timestamptz;

insert into settings (id) values (1) on conflict (id) do nothing;

-- ═══════════════════════════════════════════════════════════════════════
--  Fonctions serveur : les montants sont calculés ICI, jamais dans le navigateur.
-- ═══════════════════════════════════════════════════════════════════════

-- Les signatures ont changé au fil des évolutions (code promo, étudiante).
-- `create or replace` ne remplace que la signature IDENTIQUE : sans ces drops,
-- réexécuter ce fichier laisserait les anciennes versions en surcharge, et
-- PostgREST ne saurait plus laquelle appeler.
drop function if exists create_order(text, text, text, text, text, text, text, jsonb);
drop function if exists create_order(text, text, text, text, text, text, text, jsonb, text, boolean);
drop function if exists create_shein_request(text, text, text, text, jsonb);
drop function if exists create_shein_request(text, text, text, text, jsonb, boolean);
drop function if exists create_shein_request(text, text, text, text, jsonb, boolean, text);

create or replace function create_order(
  p_customer_name text,
  p_phone text,
  p_address text,
  p_city text,
  p_note text,
  p_delivery_zone_id text,
  p_payment_method text,
  p_items jsonb,
  p_promo_code text default '',
  p_is_student boolean default false
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_number text;
  v_subtotal integer := 0;
  v_fee integer;
  v_item jsonb;
  v_product products%rowtype;
  v_quantity integer;
  v_label text;
  v_promotions jsonb;
  v_promo jsonb;
  v_promo_label text;
  v_fee_before integer;
  v_discount integer := 0;
  v_today text := to_char(now(), 'YYYY-MM-DD');
  v_code text := upper(btrim(coalesce(p_promo_code, '')));
begin
  if jsonb_array_length(coalesce(p_items, '[]'::jsonb)) = 0 then
    raise exception 'Panier vide';
  end if;

  select (delivery_fees ->> p_delivery_zone_id)::integer, coalesce(promotions, '[]'::jsonb)
    into v_fee, v_promotions
    from settings where id = 1;
  v_label := p_delivery_zone_id;
  v_number := 'CMD-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('order_seq')::text, 5, '0');

  insert into orders (
    order_number, customer_name, phone, address, city, note,
    delivery_zone_id, delivery_label, delivery_fee, subtotal, total,
    payment_method, payment_method_label, promo_code
  ) values (
    v_number, p_customer_name, p_phone, p_address, p_city, p_note,
    p_delivery_zone_id, v_label, v_fee, 0, 0,
    p_payment_method, p_payment_method, v_code
  ) returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_product from products where id = v_item ->> 'product_id';
    if not found or v_product.status <> 'active' then
      raise exception 'Produit indisponible : %', v_item ->> 'product_id';
    end if;

    v_quantity := greatest(1, least(99, (v_item ->> 'quantity')::integer));
    if v_product.stock is not null and v_quantity > v_product.stock then
      raise exception 'Stock insuffisant pour %', v_product.name;
    end if;

    insert into order_items (order_id, product_id, name, quantity, unit_price, options)
    values (
      v_order_id, v_product.id, v_product.name, v_quantity, v_product.price,
      coalesce(v_item -> 'options', '{}'::jsonb)
    );

    v_subtotal := v_subtotal + v_product.price * v_quantity;

    if v_product.stock is not null then
      update products set stock = greatest(0, stock - v_quantity) where id = v_product.id;
    end if;
  end loop;

  -- Offres. Toutes les conditions renseignées doivent être remplies ; une liste
  -- vide ne restreint rien. Vérifiées ici, jamais d'après le navigateur, qui ne
  -- transmet qu'un code et une déclaration.
  for v_promo in select * from jsonb_array_elements(v_promotions) loop
    continue when not coalesce((v_promo ->> 'active')::boolean, false);
    continue when coalesce(v_promo ->> 'scope', 'all') not in ('all', 'store');
    continue when coalesce((v_promo ->> 'studentOnly')::boolean, false)
                  and not coalesce(p_is_student, false);
    continue when v_promo ->> 'startsAt' is not null and v_today < (v_promo ->> 'startsAt');
    continue when v_promo ->> 'endsAt' is not null and v_today > (v_promo ->> 'endsAt');
    continue when jsonb_array_length(coalesce(v_promo -> 'deliveryOptionIds', '[]'::jsonb)) > 0
                  and not (coalesce(v_promo -> 'deliveryOptionIds', '[]'::jsonb)
                           ? p_delivery_zone_id);
    -- Une offre à code ne s'applique jamais toute seule.
    continue when upper(btrim(coalesce(v_promo ->> 'code', ''))) <> v_code;

    if coalesce(v_promo -> 'effect' ->> 'type', '') = 'free_delivery'
       and v_fee is not null and v_fee > 0 then
      v_fee_before := v_fee;
      v_fee := 0;
      v_promo_label := v_promo ->> 'label';
      exit;
    elsif coalesce(v_promo -> 'effect' ->> 'type', '') = 'discount_amount' then
      -- Plafonnée au montant connu : une remise ne rend jamais d'argent.
      v_discount := least(
        greatest(0, coalesce((v_promo -> 'effect' ->> 'amount')::integer, 0)),
        v_subtotal + coalesce(v_fee, 0)
      );
      if v_discount > 0 then
        v_promo_label := v_promo ->> 'label';
        exit;
      end if;
    end if;
  end loop;

  update orders
     set subtotal = v_subtotal,
         delivery_fee = v_fee,
         delivery_fee_before_promotion = v_fee_before,
         discount = v_discount,
         promotion_label = v_promo_label,
         total = v_subtotal + coalesce(v_fee, 0) - v_discount
   where id = v_order_id;

  return (
    select to_jsonb(o) || jsonb_build_object(
      'order_items', coalesce((select jsonb_agg(to_jsonb(i)) from order_items i where i.order_id = o.id), '[]'::jsonb)
    )
    from orders o where o.id = v_order_id
  );
end;
$$;

create or replace function create_shein_request(
  p_customer_name text,
  p_phone text,
  p_note text,
  p_delivery_option_id text,
  p_items jsonb,
  p_is_student boolean default false,
  p_promo_code text default ''
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_number text;
  v_item jsonb;
  v_pricing jsonb;
  v_item_count integer := 0;
  v_subtotal numeric := 0;
  v_subtotal_known boolean := true;
  v_rate numeric;
  v_qty integer;
  v_tier jsonb;
  v_service integer;
  v_service_known boolean := false;
  v_option jsonb;
  v_delivery integer;
  v_delivery_known boolean := false;
  v_grouping groupings%rowtype;
  v_quote jsonb;
  v_promotions jsonb;
  v_promo jsonb;
  v_promo_label text;
  v_delivery_before integer;
  v_today text := to_char(now(), 'YYYY-MM-DD');
  v_code text := upper(btrim(coalesce(p_promo_code, '')));
begin
  if jsonb_array_length(coalesce(p_items, '[]'::jsonb)) = 0 then
    raise exception 'Aucun article';
  end if;

  select coalesce(pricing, '{}'::jsonb), coalesce(promotions, '[]'::jsonb)
    into v_pricing, v_promotions
    from settings where id = 1;
  -- Tant que la tarification n'a pas été enregistrée depuis l'admin, aucune ligne
  -- n'est calculée : le devis est marqué partiel plutôt que faussement précis.

  -- Prix des articles : convertis ici, jamais acceptés depuis le navigateur.
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := greatest(1, least(99, coalesce((v_item ->> 'quantity')::integer, 1)));
    v_item_count := v_item_count + v_qty;

    if v_item ->> 'price_amount' is null then
      v_subtotal_known := false;
    else
      v_rate := (coalesce(v_pricing -> 'conversionRates', '{}'::jsonb) ->> coalesce(v_item ->> 'price_currency', 'XOF'))::numeric;
      if v_rate is null then
        v_subtotal_known := false;
      else
        v_subtotal := v_subtotal + (v_item ->> 'price_amount')::numeric * v_rate * v_qty;
      end if;
    end if;
  end loop;

  -- Frais de traitement : tranche correspondant au nombre d'articles.
  for v_tier in select * from jsonb_array_elements(coalesce(v_pricing -> 'tiers', '[]'::jsonb)) loop
    if v_item_count >= (v_tier ->> 'minItems')::integer
       and (v_tier ->> 'maxItems' is null or v_item_count <= (v_tier ->> 'maxItems')::integer)
       and v_tier ->> 'fee' is not null then
      v_service := (v_tier ->> 'fee')::integer;
      v_service_known := true;
      exit;
    end if;
  end loop;

  -- Livraison.
  for v_option in select * from jsonb_array_elements(coalesce(v_pricing -> 'deliveryOptions', '[]'::jsonb)) loop
    if v_option ->> 'id' = p_delivery_option_id and v_option ->> 'fee' is not null then
      v_delivery := (v_option ->> 'fee')::integer;
      v_delivery_known := true;
      exit;
    end if;
  end loop;

  -- Rattachement au premier groupage ouvert qui a encore de la place. Choisi
  -- avant le devis : une promotion peut être réservée à un groupage précis.
  select * into v_grouping
    from groupings
   where status = 'open'
     and reserved_count + manual_order_count < max_orders
   order by closing_date nulls last
   limit 1;

  -- Promotions. Toutes les conditions renseignées doivent être remplies ; une
  -- liste vide ne restreint rien. Vérifiées ici, jamais d'après le navigateur,
  -- qui ne transmet que la déclaration « je suis étudiante ».
  if v_delivery_known and v_delivery > 0 then
    for v_promo in select * from jsonb_array_elements(v_promotions) loop
      continue when not coalesce((v_promo ->> 'active')::boolean, false);
      continue when coalesce(v_promo ->> 'scope', 'all') not in ('all', 'shein');
      continue when coalesce((v_promo ->> 'studentOnly')::boolean, false)
                    and not coalesce(p_is_student, false);
      continue when v_promo ->> 'startsAt' is not null and v_today < (v_promo ->> 'startsAt');
      continue when v_promo ->> 'endsAt' is not null and v_today > (v_promo ->> 'endsAt');
      continue when jsonb_array_length(coalesce(v_promo -> 'groupingIds', '[]'::jsonb)) > 0
                    and (v_grouping.id is null
                         or not (coalesce(v_promo -> 'groupingIds', '[]'::jsonb)
                                 ? v_grouping.id::text));
      continue when jsonb_array_length(coalesce(v_promo -> 'deliveryOptionIds', '[]'::jsonb)) > 0
                    and not (coalesce(v_promo -> 'deliveryOptionIds', '[]'::jsonb)
                             ? p_delivery_option_id);
      continue when upper(btrim(coalesce(v_promo ->> 'code', ''))) <> v_code;
      continue when coalesce(v_promo -> 'effect' ->> 'type', '') <> 'free_delivery';

      v_delivery_before := v_delivery;
      v_delivery := 0;
      v_promo_label := v_promo ->> 'label';
      exit;
    end loop;
  end if;

  v_quote := jsonb_build_object(
    'itemCount', v_item_count,
    'itemsSubtotal', case when v_subtotal_known then round(v_subtotal) else null end,
    'serviceFee', case when v_service_known then v_service else null end,
    'deliveryOptionId', p_delivery_option_id,
    'deliveryFee', case when v_delivery_known then v_delivery else null end,
    'deliveryFeeBeforePromotion', v_delivery_before,
    'promotionLabel', v_promo_label,
    'total', coalesce(case when v_subtotal_known then round(v_subtotal) else 0 end, 0)
             + coalesce(v_service, 0) + coalesce(v_delivery, 0),
    'isPartial', not (v_subtotal_known and v_service_known and v_delivery_known),
    'strategy', v_pricing ->> 'strategy',
    'computedAt', now()
  );

  v_number := 'SHEIN-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('shein_seq')::text, 5, '0');

  insert into shein_requests (
    request_number, customer_name, phone, note, grouping_id, delivery_option_id,
    is_student, promo_code, quote
  ) values (
    v_number, p_customer_name, p_phone, p_note, v_grouping.id, p_delivery_option_id,
    coalesce(p_is_student, false), v_code, v_quote
  ) returning id into v_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    insert into shein_items (
      request_id, product_url, reference, size, color, quantity,
      displayed_price, price_amount, price_currency, image
    ) values (
      v_id,
      coalesce(v_item ->> 'product_url', ''),
      coalesce(v_item ->> 'reference', ''),
      coalesce(v_item ->> 'size', ''),
      coalesce(v_item ->> 'color', ''),
      greatest(1, least(99, coalesce((v_item ->> 'quantity')::integer, 1))),
      coalesce(v_item ->> 'displayed_price', ''),
      (v_item ->> 'price_amount')::numeric,
      coalesce(v_item ->> 'price_currency', 'XOF'),
      v_item ->> 'image'
    );
  end loop;

  if v_grouping.id is not null then
    update groupings
       set reserved_count = reserved_count + 1,
           status = case
                      when reserved_count + 1 + manual_order_count >= max_orders then 'full'
                      else status
                    end,
           updated_at = now()
     where id = v_grouping.id;
  end if;

  return (
    select to_jsonb(r) || jsonb_build_object(
      'shein_items', coalesce((select jsonb_agg(to_jsonb(i)) from shein_items i where i.request_id = r.id), '[]'::jsonb)
    )
    from shein_requests r where r.id = v_id
  );
end;
$$;

-- Transfert des demandes d'un groupage vers un autre (ou vers aucun).
create or replace function transfer_shein_requests(p_from uuid, p_to uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_moved integer;
begin
  update shein_requests
     set grouping_id = p_to, updated_at = now()
   where grouping_id = p_from
     and status not in ('cancelled', 'delivered');
  get diagnostics v_moved = row_count;

  update groupings set reserved_count = greatest(0, reserved_count - v_moved), updated_at = now()
   where id = p_from;

  if p_to is not null then
    update groupings
       set reserved_count = reserved_count + v_moved,
           status = case
                      when reserved_count + v_moved + manual_order_count >= max_orders then 'full'
                      else status
                    end,
           updated_at = now()
     where id = p_to;
  end if;

  return v_moved;
end;
$$;

-- Comparaison de deux numéros sénégalais.
--
-- « 78 107 16 04 », « +221 78 107 16 04 » et « 221781071604 » désignent la
-- même personne. On ne garde que les chiffres, puis les neuf derniers : le
-- préfixe pays présent d'un côté et absent de l'autre ne doit pas empêcher
-- une cliente de retrouver sa commande.
create or replace function meme_numero(a text, b text)
returns boolean
language sql
immutable
as $$
  select right(regexp_replace(coalesce(a, ''), '\D', '', 'g'), 9)
       = right(regexp_replace(coalesce(b, ''), '\D', '', 'g'), 9)
     and length(regexp_replace(coalesce(a, ''), '\D', '', 'g')) >= 6;
$$;

-- Suivi client : exige le numéro de commande ET le téléphone.
create or replace function find_order(p_order_number text, p_phone text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select to_jsonb(o) || jsonb_build_object(
    'order_items', coalesce((select jsonb_agg(to_jsonb(i)) from order_items i where i.order_id = o.id), '[]'::jsonb)
  )
  from orders o
  where upper(o.order_number) = upper(p_order_number)
    and meme_numero(o.phone, p_phone)
    -- Une commande à la corbeille n'est plus suivie. La restaurer la rend.
    and o.deleted_at is null
  limit 1;
$$;

create or replace function find_shein_request(p_request_number text, p_phone text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select to_jsonb(r) || jsonb_build_object(
    'shein_items', coalesce((select jsonb_agg(to_jsonb(i)) from shein_items i where i.request_id = r.id), '[]'::jsonb)
  )
  from shein_requests r
  where upper(r.request_number) = upper(p_request_number)
    and meme_numero(r.phone, p_phone)
    and r.deleted_at is null
  limit 1;
$$;

-- ═══════════════════════════════════════════════════════════════════════
--  Row Level Security
-- ═══════════════════════════════════════════════════════════════════════

alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table shein_requests enable row level security;
alter table shein_items enable row level security;
alter table settings enable row level security;
alter table groupings enable row level security;

-- Catalogue : lecture publique des seuls articles publiés.
drop policy if exists "produits visibles" on products;
create policy "produits visibles" on products
  for select to anon, authenticated
  using (status <> 'draft');

-- Écriture catalogue : admin uniquement.
drop policy if exists "produits admin" on products;
create policy "produits admin" on products
  for all to authenticated using (true) with check (true);

-- Commandes et demandes : aucune lecture publique directe
-- (le public passe par find_order / find_shein_request, SECURITY DEFINER).
drop policy if exists "commandes admin" on orders;
create policy "commandes admin" on orders
  for all to authenticated using (true) with check (true);

drop policy if exists "lignes admin" on order_items;
create policy "lignes admin" on order_items
  for all to authenticated using (true) with check (true);

drop policy if exists "shein admin" on shein_requests;
create policy "shein admin" on shein_requests
  for all to authenticated using (true) with check (true);

drop policy if exists "shein lignes admin" on shein_items;
create policy "shein lignes admin" on shein_items
  for all to authenticated using (true) with check (true);

-- Groupages : lecture publique (compteur affiché sur le site), écriture admin.
-- Aucune donnée cliente ni marge n'y figure : seulement capacité et remplissage.
drop policy if exists "groupages publics" on groupings;
create policy "groupages publics" on groupings for select to anon, authenticated using (true);

drop policy if exists "groupages admin" on groupings;
create policy "groupages admin" on groupings for all to authenticated using (true) with check (true);

-- Réglages : lecture publique (numéro WhatsApp, date de groupage), écriture admin.
drop policy if exists "reglages publics" on settings;
create policy "reglages publics" on settings for select to anon, authenticated using (true);

drop policy if exists "reglages admin" on settings;
create policy "reglages admin" on settings for all to authenticated using (true) with check (true);

-- Les fonctions publiques sont exposées explicitement.
grant execute on function create_order(text, text, text, text, text, text, text, jsonb, text, boolean) to anon, authenticated;
grant execute on function create_shein_request(text, text, text, text, jsonb, boolean, text) to anon, authenticated;
grant execute on function transfer_shein_requests(uuid, uuid) to authenticated;
grant execute on function find_order(text, text) to anon, authenticated;
grant execute on function find_shein_request(text, text) to anon, authenticated;
/*
 * PostgreSQL accorde l'exécution d'une fonction à TOUT LE MONDE par défaut.
 * Un « grant … to authenticated » n'enlève pas ce droit : il s'y ajoute. Pour
 * une fonction SECURITY DEFINER réservée à l'administration, il faut donc le
 * retirer explicitement — sans quoi la clé publique du site, lisible par
 * n'importe qui, suffirait à l'appeler.
 */
revoke execute on function transfer_shein_requests(uuid, uuid) from public;


-- ── 4. Fréquentation du site ──────────────────────────────────────────
-- Une ligne par page vue. Aucune donnée personnelle : un identifiant de
-- navigateur tiré au hasard, l'adresse de la page, et l'heure. Ni adresse IP,
-- ni nom, ni cookie de pistage — de quoi compter, rien de plus.
create table if not exists visits (
  id uuid primary key default gen_random_uuid(),
  visitor text not null check (length(visitor) between 8 and 40),
  path text not null check (length(path) <= 120),
  created_at timestamptz not null default now()
);

create index if not exists visits_created_at_idx on visits(created_at);

alter table visits enable row level security;

-- Le public peut signaler sa visite, et rien d'autre : pas de lecture, pas de
-- modification. Personne ne peut consulter la fréquentation depuis le site.
drop policy if exists "visites publiques" on visits;
create policy "visites publiques" on visits
  for insert to anon, authenticated with check (true);

drop policy if exists "visites lecture admin" on visits;
create policy "visites lecture admin" on visits
  for select to authenticated using (true);

-- Statistiques agrégées, calculées côté serveur : l'administration reçoit une
-- poignée de chiffres, jamais la liste des visites.
create or replace function stats_visites()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  j date := current_date;
begin
  return jsonb_build_object(
    'jour', (select jsonb_build_object('visites', count(*), 'visiteurs', count(distinct visitor))
             from visits where created_at >= j),
    'semaine', (select jsonb_build_object('visites', count(*), 'visiteurs', count(distinct visitor))
                from visits where created_at >= j - 6),
    'mois', (select jsonb_build_object('visites', count(*), 'visiteurs', count(distinct visitor))
             from visits where created_at >= j - 29),
    'annee', (select jsonb_build_object('visites', count(*), 'visiteurs', count(distinct visitor))
              from visits where created_at >= j - 364),
    'total', (select jsonb_build_object('visites', count(*), 'visiteurs', count(distinct visitor))
              from visits),
    'parJour', (
      select coalesce(jsonb_agg(jsonb_build_object(
               'date', to_char(s.jour::date, 'YYYY-MM-DD'),
               'visites', coalesce(c.visites, 0),
               'visiteurs', coalesce(c.visiteurs, 0)) order by s.jour), '[]'::jsonb)
      from generate_series(j - 29, j, interval '1 day') as s(jour)
      left join (
        select created_at::date as jour, count(*) as visites, count(distinct visitor) as visiteurs
        from visits where created_at >= j - 29 group by 1
      ) c on c.jour = s.jour::date
    ),
    'pages', (
      select coalesce(jsonb_agg(jsonb_build_object('path', p.path, 'visites', p.n) order by p.n desc), '[]'::jsonb)
      from (
        select path, count(*) as n from visits
        where created_at >= j - 29 group by path order by n desc limit 8
      ) p
    )
  );
end;
$$;

revoke execute on function stats_visites() from public;
grant execute on function stats_visites() to authenticated;

-- ── 7. Alerte quand une commande arrive ───────────────────────────────
-- Le problème : une cliente qui commande sans cliquer sur « Continuer sur
-- WhatsApp » laisse sa commande dormir dans l'administration. Une commande
-- vue six heures trop tard est souvent une commande perdue.
--
-- La base prévient donc elle-même, par un message Telegram. Le robot est
-- créé par la boutique (@BotFather) ; ses identifiants sont rangés dans une
-- table à part, JAMAIS dans `settings` — celle-là est lisible publiquement
-- par le site, et le jeton du robot en sortirait aussitôt.

create extension if not exists pg_net with schema extensions;

create table if not exists alert_settings (
  id integer primary key default 1 check (id = 1),
  -- Jeton du robot Telegram, donné par @BotFather.
  telegram_token text not null default '',
  -- Identifiant de la conversation où le robot doit écrire.
  telegram_chat_id text not null default '',
  -- Interrupteur : rien ne part tant qu'il est à false.
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);
insert into alert_settings (id) values (1) on conflict (id) do nothing;

alter table alert_settings enable row level security;

-- Aucune politique pour `anon` : un visiteur du site ne doit jamais
-- pouvoir lire le jeton du robot, même en interrogeant l'API directement.
drop policy if exists "alertes admin" on alert_settings;
create policy "alertes admin" on alert_settings
  for all to authenticated using (true) with check (true);

-- Deuxième barrière, volontairement redondante. Supabase accorde d'office
-- les droits de table à `anon` et `authenticated` ; la sécurité ne tient
-- alors qu'à la politique ci-dessus. Pour un jeton, une seule serrure ne
-- suffit pas : on retire aussi le droit de table à `anon`, de sorte qu'une
-- politique désactivée par erreur ne suffirait pas à le laisser sortir.
revoke all on table alert_settings from anon;
grant select, insert, update on table alert_settings to authenticated;

-- Les identifiants techniques rendus lisibles. Ils doublent ceux de
-- src/config/site.ts : ici c'est un confort de lecture pour un message
-- privé, et tout code inconnu retombe sur lui-même plutôt que de
-- disparaître.
create or replace function libelle_alerte(code text)
returns text
language sql
immutable
as $$
  select case coalesce(code, '')
    when 'pickup' then 'Point de retrait'
    when 'city' then 'Livraison Saint-Louis'
    when 'around' then 'Environs de Saint-Louis'
    when 'regions' then 'Louga, Thiès, Dakar'
    when 'wave' then 'Wave'
    when 'orange_money' then 'Orange Money'
    when 'cash' then 'Paiement à la livraison'
    else coalesce(nullif(code, ''), '—')
  end;
$$;

-- Le texte du message, à partir de la ligne RELUE en fin de transaction.
create or replace function texte_alerte(source text, ligne jsonb)
returns text
language sql
immutable
as $$
  select case when source = 'orders' then
    E'\U0001F6CD️ Nouvelle commande\n'
      || 'N° ' || (ligne->>'order_number') || E'\n'
      || (ligne->>'customer_name') || ' — ' || (ligne->>'phone') || E'\n'
      || 'Total : ' || (ligne->>'total') || E' FCFA\n'
      || 'Livraison : ' || libelle_alerte(ligne->>'delivery_zone_id')
      -- Frais non encore paramétrés : on l'annonce, on n'invente pas 0.
      -- Sauf pour un retrait en main propre, qui n'a pas de frais du tout.
      || case when ligne->>'delivery_fee' is null and ligne->>'delivery_zone_id' <> 'pickup'
              then ' (frais à confirmer)' else '' end
      || E'\n'
      || 'Paiement : ' || libelle_alerte(ligne->>'payment_method')
      || case when coalesce(ligne->>'address', '') <> ''
              then E'\n' || (ligne->>'address') else '' end
  else
    E'\U0001F4E6 Nouvelle demande SHEIN\n'
      || 'N° ' || (ligne->>'request_number') || E'\n'
      || (ligne->>'customer_name') || ' — ' || (ligne->>'phone') || E'\n'
      || 'À chiffrer, puis à confirmer à la cliente.'
  end;
$$;

create or replace function alerter_nouvelle_demande()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  conf alert_settings%rowtype;
  ligne jsonb;
begin
  select * into conf from alert_settings where id = 1;

  -- Rien de configuré, ou interrupteur fermé : on ne fait rien, en silence.
  if not found or not conf.enabled
     or conf.telegram_token = '' or conf.telegram_chat_id = '' then
    return null;
  end if;

  -- `new` est la ligne telle qu'elle vient d'être insérée : à cet instant
  -- `create_order` n'a pas encore calculé le sous-total ni le total, et
  -- l'alerte annonçait « Total : 0 FCFA ». Le déclencheur est différé en
  -- fin de transaction (voir plus bas) et on RELIT la ligne ici, pour
  -- annoncer le montant réellement enregistré.
  if tg_table_name = 'orders' then
    select to_jsonb(o) into ligne from orders o where o.id = new.id;
  else
    select to_jsonb(s) into ligne from shein_requests s where s.id = new.id;
  end if;
  if ligne is null then
    return null;
  end if;

  -- Une alerte qui échoue ne doit JAMAIS faire perdre une commande :
  -- l'envoi est enfermé dans son propre bloc, et l'insertion continue
  -- quoi qu'il arrive.
  begin
    perform net.http_post(
      url := 'https://api.telegram.org/bot' || conf.telegram_token || '/sendMessage',
      body := jsonb_build_object(
        'chat_id', conf.telegram_chat_id,
        'text', texte_alerte(tg_table_name::text, ligne)
      ),
      headers := '{"Content-Type": "application/json"}'::jsonb
    );
  exception when others then
    null;
  end;

  return null;
end;
$$;

-- Déclencheurs DIFFÉRÉS : ils s'exécutent à la validation de la
-- transaction, une fois les montants calculés. Deuxième bénéfice, non
-- négligeable : une commande qui échoue en cours de route n'envoie aucune
-- alerte, puisque la transaction n'est jamais validée.
drop trigger if exists alerte_commande on orders;
create constraint trigger alerte_commande
  after insert on orders
  deferrable initially deferred
  for each row execute function alerter_nouvelle_demande();

drop trigger if exists alerte_shein on shein_requests;
create constraint trigger alerte_shein
  after insert on shein_requests
  deferrable initially deferred
  for each row execute function alerter_nouvelle_demande();

-- Bouton « Envoyer un test » de l'administration. Renvoie le numéro de la
-- requête, pour pouvoir aller lire ce que Telegram a répondu.
create or replace function tester_alerte()
returns bigint
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  conf alert_settings%rowtype;
begin
  select * into conf from alert_settings where id = 1;
  if not found or conf.telegram_token = '' or conf.telegram_chat_id = '' then
    raise exception 'Renseignez le jeton du robot et l''identifiant de conversation, puis enregistrez.';
  end if;

  return net.http_post(
    url := 'https://api.telegram.org/bot' || conf.telegram_token || '/sendMessage',
    body := jsonb_build_object(
      'chat_id', conf.telegram_chat_id,
      'text', E'✅ Afaura Luméa : l''alerte fonctionne. '
              || 'Vous recevrez ce genre de message à chaque nouvelle commande.'
    ),
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
end;
$$;

-- Ce que Telegram a répondu. `null` = la réponse n'est pas encore arrivée.
create or replace function resultat_alerte(requete bigint)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  r record;
begin
  select status_code, content, error_msg, timed_out
    into r from net._http_response where id = requete;
  if not found then return null; end if;

  return jsonb_build_object(
    'statut', r.status_code,
    'ok', coalesce(r.status_code, 0) between 200 and 299,
    -- Message d'erreur de Telegram, utile pour distinguer un mauvais jeton
    -- d'un mauvais identifiant de conversation.
    'detail', coalesce(r.error_msg, case when coalesce(r.status_code, 0) between 200 and 299
                                         then '' else left(coalesce(r.content, ''), 300) end),
    'expire', coalesce(r.timed_out, false)
  );
end;
$$;

-- Réservées à l'administration : PostgreSQL ouvre toute fonction à tout le
-- monde par défaut, et un « grant … to authenticated » ne l'annule pas.
revoke execute on function tester_alerte() from public;
revoke execute on function resultat_alerte(bigint) from public;
revoke execute on function texte_alerte(text, jsonb) from public;
revoke execute on function libelle_alerte(text) from public;
grant execute on function tester_alerte() to authenticated;
grant execute on function resultat_alerte(bigint) to authenticated;
