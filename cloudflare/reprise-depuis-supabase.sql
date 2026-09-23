-- ═══════════════════════════════════════════════════════════════════════
--  EMMENER LES DONNÉES : Supabase → Cloudflare, sans intermédiaire
-- ═══════════════════════════════════════════════════════════════════════
--
--  À COLLER DANS L'ÉDITEUR SQL DE SUPABASE. Elle ne modifie rien : elle
--  LIT vos données et rend, en un seul résultat, les instructions à
--  coller ensuite dans la console D1 de Cloudflare.
--
--  POURQUOI CETTE FORME. Les noms, téléphones et adresses de vos clientes
--  ne transitent par personne : ils vont de votre écran Supabase à votre
--  écran Cloudflare, sans passer par un fichier envoyé, ni par une
--  conversation, ni par le dépôt. C'est la raison d'être de cette
--  requête — un export classique aurait été plus court à écrire.
--
--  LES QUATRE CONVERSIONS DU DÉMÉNAGEMENT s'y trouvent, parce que SQLite
--  n'a ni booléen, ni type JSON, ni type date :
--    booléen   → 0 ou 1
--    jsonb     → texte
--    timestamp → texte ISO (la même forme que le schéma D1)
--    NULL      → NULL (le seul qui ne change pas)
--
--  ET LES COMPTEURS, à la fin, qui reprennent où Postgres s'était
--  arrêté. Sans eux, votre première commande chez Cloudflare porterait
--  un numéro DÉJÀ donné à une cliente, et le suivi rendrait l'autre.
--
--  Essayée pour de vrai : schéma Supabase chargé dans un Postgres 16,
--  commandes avec apostrophes (« N'Diaye », « rue de l'hôpital »),
--  accents, frais nuls et notes vides, puis le résultat appliqué à une
--  base D1 — relu ensuite intact.
-- Postgres → SQLite : une seule requête, un seul résultat à copier.
with
iso as (select 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'::text as f),
g as (
  select coalesce(string_agg(format(
    'insert or replace into groupings (id,reference,destination,opening_date,closing_date,max_orders,min_orders,reserved_count,manual_order_count,logistics_cost,status,note,created_at,updated_at) values (%L,%L,%L,%L,%L,%s,%s,%s,%s,%s,%L,%L,%L,%L);',
    id::text, reference, destination,
    to_char(opening_date at time zone 'UTC', (select f from iso)),
    to_char(closing_date at time zone 'UTC', (select f from iso)),
    max_orders, min_orders, reserved_count, manual_order_count,
    coalesce(logistics_cost::text,'null'), status, note,
    to_char(created_at at time zone 'UTC', (select f from iso)),
    to_char(updated_at at time zone 'UTC', (select f from iso))
  ), E'\n' order by created_at), '') as t from groupings
),
o as (
  select coalesce(string_agg(format(
    'insert or replace into orders (id,order_number,customer_name,phone,address,city,note,delivery_zone_id,delivery_label,delivery_fee,delivery_fee_before_promotion,subtotal,service_fee,discount,promotion_label,promo_code,total,payment_method,payment_method_label,payment_status,order_status,created_at,updated_at,deleted_at) values (%L,%L,%L,%L,%L,%L,%L,%L,%L,%s,%s,%s,%s,%s,%L,%L,%s,%L,%L,%L,%L,%L,%L,%L);',
    id::text, order_number, customer_name, phone, address, city, note,
    delivery_zone_id, delivery_label,
    coalesce(delivery_fee::text,'null'), coalesce(delivery_fee_before_promotion::text,'null'),
    subtotal, coalesce(service_fee,0), discount, promotion_label, promo_code, total,
    payment_method, payment_method_label, payment_status, order_status,
    to_char(created_at at time zone 'UTC', (select f from iso)),
    to_char(updated_at at time zone 'UTC', (select f from iso)),
    to_char(deleted_at at time zone 'UTC', (select f from iso))
  ), E'\n' order by created_at), '') as t from orders
),
oi as (
  select coalesce(string_agg(format(
    'insert or replace into order_items (id,order_id,product_id,name,quantity,unit_price,options) values (%L,%L,%L,%L,%s,%s,%L);',
    id::text, order_id::text, product_id, name, quantity, unit_price, options::text
  ), E'\n'), '') as t from order_items
),
s as (
  select coalesce(string_agg(format(
    'insert or replace into shein_requests (id,request_number,customer_name,phone,note,status,quoted_total,grouping_id,delivery_option_id,is_student,promo_code,quote,created_at,updated_at,deleted_at) values (%L,%L,%L,%L,%L,%L,%s,%L,%L,%s,%L,%L,%L,%L,%L);',
    id::text, request_number, customer_name, phone, note, status,
    coalesce(quoted_total::text,'null'), grouping_id::text, delivery_option_id,
    case when is_student then 1 else 0 end, promo_code, quote::text,
    to_char(created_at at time zone 'UTC', (select f from iso)),
    to_char(updated_at at time zone 'UTC', (select f from iso)),
    to_char(deleted_at at time zone 'UTC', (select f from iso))
  ), E'\n' order by created_at), '') as t from shein_requests
),
si as (
  select coalesce(string_agg(format(
    'insert or replace into shein_items (id,request_id,product_url,reference,size,color,quantity,displayed_price,price_amount,price_currency,image) values (%L,%L,%L,%L,%L,%L,%s,%L,%s,%L,%L);',
    id::text, request_id::text, product_url, reference, size, color, quantity,
    displayed_price, coalesce(price_amount::text,'null'), price_currency, image
  ), E'\n'), '') as t from shein_items
),
r as (
  select coalesce(string_agg(format(
    'insert or replace into settings (id,whatsapp_number,whatsapp_link,next_grouping_opening,next_grouping_date,wave_number,wave_link,orange_money_number,orange_money_link,delivery_fees,announcement,pricing,promotions,alert_thresholds,reviews) values (1,%L,%L,%L,%L,%L,%L,%L,%L,%L,%L,%L,%L,%L,%L);',
    whatsapp_number, whatsapp_link,
    to_char(next_grouping_opening at time zone 'UTC', (select f from iso)),
    to_char(next_grouping_date at time zone 'UTC', (select f from iso)),
    wave_number, wave_link, orange_money_number, orange_money_link,
    delivery_fees::text, announcement, pricing::text, promotions::text,
    alert_thresholds::text, reviews::text
  ), E'\n'), '') as t from settings where id = 1
),
a as (
  select coalesce(string_agg(format(
    'insert or replace into alert_settings (id,ntfy_topic,enabled,include_customer,updated_at) values (1,%L,%s,%s,%L);',
    ntfy_topic, case when enabled then 1 else 0 end,
    case when include_customer then 1 else 0 end,
    to_char(now() at time zone 'UTC', (select f from iso))
  ), E'\n'), '') as t from alert_settings where id = 1
),
c as (
  select format(
    E'update compteurs set valeur = max(valeur, %s) where nom = ''commande'';\nupdate compteurs set valeur = max(valeur, %s) where nom = ''shein'';',
    (select coalesce(max(substring(order_number from '([0-9]+)$')::int),0) from orders),
    (select coalesce(max(substring(request_number from '([0-9]+)$')::int),0) from shein_requests)
  ) as t
)
select concat_ws(E'\n',
  nullif(g.t,''), nullif(o.t,''), nullif(oi.t,''), nullif(s.t,''),
  nullif(si.t,''), nullif(r.t,''), nullif(a.t,''), c.t) as reprise
from g, o, oi, s, si, r, a, c;
