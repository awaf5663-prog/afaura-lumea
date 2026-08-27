-- ═══════════════════════════════════════════════════════════════════════
--  Afaura Luméa — mise à jour de la base
--
--  À passer UNE fois : Supabase → SQL Editor → New query → coller → Run.
--  Sans risque, et sans effet s'il a déjà été passé : rien n'est supprimé,
--  chaque instruction vérifie d'abord ce qui existe déjà.
--
--  Ce qu'il fait :
--    1. répare la recherche par numéro de téléphone (page de suivi et
--       récapitulatif qui répondaient « introuvable ») ;
--    2. remet au bon format les numéros déjà enregistrés ;
--    3. ajoute la place des avis clientes et des mesures des articles.
-- ═══════════════════════════════════════════════════════════════════════

-- ── 1. Recherche tolérante au préfixe pays ────────────────────────────
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
  limit 1;
$$;

-- ── 2. Numéros déjà enregistrés remis au format international ─────────
update orders
   set phone = '221' || right(regexp_replace(phone, '\D', '', 'g'), 9)
 where length(regexp_replace(phone, '\D', '', 'g')) = 9;

update shein_requests
   set phone = '221' || right(regexp_replace(phone, '\D', '', 'g'), 9)
 where length(regexp_replace(phone, '\D', '', 'g')) = 9;

-- ── 3. Avis clientes et mesures des articles ──────────────────────────
alter table settings add column if not exists reviews jsonb not null default '[]'::jsonb;
alter table products add column if not exists measurements jsonb not null default '[]'::jsonb;
