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
  subtotal integer not null,
  total integer not null,
  payment_method text not null,
  payment_method_label text not null,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'proof_sent', 'confirmed', 'refused')),
  order_status text not null default 'received'
    check (order_status in ('received','payment_confirmed','grouped','in_transit','arrived','ready','delivered','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
  quote jsonb,                                         -- estimation calculée côté serveur
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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
  next_grouping_date timestamptz,
  wave_number text default '',
  orange_money_number text default '',
  delivery_fees jsonb not null default '{}'::jsonb,
  announcement text default '',
  pricing jsonb not null default '{}'::jsonb,           -- tarification SHEIN pilotée par l'admin
  promotions jsonb not null default '[]'::jsonb,
  alert_thresholds jsonb not null default '{}'::jsonb
);

insert into settings (id) values (1) on conflict (id) do nothing;

-- ═══════════════════════════════════════════════════════════════════════
--  Fonctions serveur : les montants sont calculés ICI, jamais dans le navigateur.
-- ═══════════════════════════════════════════════════════════════════════

create or replace function create_order(
  p_customer_name text,
  p_phone text,
  p_address text,
  p_city text,
  p_note text,
  p_delivery_zone_id text,
  p_payment_method text,
  p_items jsonb
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
begin
  if jsonb_array_length(coalesce(p_items, '[]'::jsonb)) = 0 then
    raise exception 'Panier vide';
  end if;

  select (delivery_fees ->> p_delivery_zone_id)::integer into v_fee from settings where id = 1;
  v_label := p_delivery_zone_id;
  v_number := 'CMD-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('order_seq')::text, 5, '0');

  insert into orders (
    order_number, customer_name, phone, address, city, note,
    delivery_zone_id, delivery_label, delivery_fee, subtotal, total,
    payment_method, payment_method_label
  ) values (
    v_number, p_customer_name, p_phone, p_address, p_city, p_note,
    p_delivery_zone_id, v_label, v_fee, 0, 0,
    p_payment_method, p_payment_method
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

  update orders
     set subtotal = v_subtotal,
         total = v_subtotal + coalesce(v_fee, 0)
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
  p_is_student boolean default false
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
    is_student, quote
  ) values (
    v_number, p_customer_name, p_phone, p_note, v_grouping.id, p_delivery_option_id,
    coalesce(p_is_student, false), v_quote
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
    and regexp_replace(o.phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g')
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
    and regexp_replace(r.phone, '\D', '', 'g') = regexp_replace(p_phone, '\D', '', 'g')
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
grant execute on function create_order(text, text, text, text, text, text, text, jsonb) to anon, authenticated;
grant execute on function create_shein_request(text, text, text, text, jsonb, boolean) to anon, authenticated;
grant execute on function transfer_shein_requests(uuid, uuid) to authenticated;
grant execute on function find_order(text, text) to anon, authenticated;
grant execute on function find_shein_request(text, text) to anon, authenticated;
