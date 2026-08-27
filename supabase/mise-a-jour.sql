-- ═══════════════════════════════════════════════════════════════════════
--  Afaura Luméa — mise à jour de la base
--
--  À passer UNE fois : Supabase → SQL Editor → New query → coller → Run.
--  Sans risque, et sans effet s'il a déjà été passé : rien n'est supprimé,
--  chaque instruction vérifie d'abord ce qui existe déjà.
--
--  Ce qu'il fait :
--    1. ajoute la place des avis clientes, des mesures des articles et de
--       la corbeille de l'administration ;
--    2. répare la recherche par numéro de téléphone (page de suivi et
--       récapitulatif qui répondaient « introuvable ») ;
--    3. remet au bon format les numéros déjà enregistrés.
-- ═══════════════════════════════════════════════════════════════════════

-- ── 1. Colonnes ajoutées après la première mise en place ──────────────
-- En premier : les fonctions plus bas s'y réfèrent, et PostgreSQL vérifie
-- leur contenu au moment où on les crée.
alter table settings add column if not exists reviews jsonb not null default '[]'::jsonb;
alter table products add column if not exists measurements jsonb not null default '[]'::jsonb;
alter table orders add column if not exists deleted_at timestamptz;
alter table shein_requests add column if not exists deleted_at timestamptz;

-- ── 2. Recherche tolérante au préfixe pays ────────────────────────────
-- « 78 107 16 04 », « +221 78 107 16 04 » et « 221781071604 » désignent la
-- même personne : on compare les neuf derniers chiffres.
create or replace function meme_numero(a text, b text)
returns boolean
language sql
immutable
as $$
  select right(regexp_replace(coalesce(a, ''), '\D', '', 'g'), 9)
       = right(regexp_replace(coalesce(b, ''), '\D', '', 'g'), 9)
     and length(regexp_replace(coalesce(a, ''), '\D', '', 'g')) >= 6;
$$;

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

-- ── 3. Numéros déjà enregistrés remis au format international ─────────
update orders
   set phone = '221' || right(regexp_replace(phone, '\D', '', 'g'), 9)
 where length(regexp_replace(phone, '\D', '', 'g')) = 9;

update shein_requests
   set phone = '221' || right(regexp_replace(phone, '\D', '', 'g'), 9)
 where length(regexp_replace(phone, '\D', '', 'g')) = 9;
