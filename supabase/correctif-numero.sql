-- ═══════════════════════════════════════════════════════════════════════
--  Correctif à passer UNE fois dans le SQL editor de Supabase
--  (Supabase → SQL Editor → New query → coller → Run)
--
--  À quoi il sert : les commandes déjà enregistrées ont pu garder le
--  numéro tel qu'il a été tapé (« 78 107 16 04 ») alors que le site le
--  cherche au format international (« 221781071604 »). Résultat : la page
--  de suivi répondait « introuvable » sur une commande pourtant bien
--  présente. Ce fichier fait deux choses :
--    1. il apprend à la recherche à comparer les numéros intelligemment ;
--    2. il remet les numéros déjà enregistrés au même format.
--
--  Sans risque : rien n'est supprimé, seuls les numéros sont réécrits.
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Comparaison tolérante au préfixe pays.
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

-- 2. Numéros déjà enregistrés remis au format international.
update orders
   set phone = '221' || right(regexp_replace(phone, '\D', '', 'g'), 9)
 where length(regexp_replace(phone, '\D', '', 'g')) = 9;

update shein_requests
   set phone = '221' || right(regexp_replace(phone, '\D', '', 'g'), 9)
 where length(regexp_replace(phone, '\D', '', 'g')) = 9;
