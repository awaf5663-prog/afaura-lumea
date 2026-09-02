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
--    3. remet au bon format les numéros déjà enregistrés ;
--    4. installe le comptage de la fréquentation du site ;
--    5. referme une fonction d'administration que PostgreSQL laissait
--       ouverte à tout le monde ;
--    6. ajoute la date d'OUVERTURE des inscriptions d'un groupage, à côté
--       de la date de clôture qui existait déjà ;
--    7. installe l'alerte Telegram : la base prévient elle-même dès qu'une
--       commande ou une demande SHEIN arrive. Rien ne part tant que le
--       robot n'est pas renseigné dans l'administration.
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

-- Réservée à l'administration : on retire le droit d'exécution que
-- PostgreSQL accorde à tout le monde par défaut (voir schema.sql).
revoke execute on function stats_visites() from public;
grant execute on function stats_visites() to authenticated;

-- ── 5. Fonction d'administration verrouillée ──────────────────────────
-- `transfer_shein_requests` déplace les demandes d'un groupage à l'autre :
-- elle n'appartient qu'à l'administration. PostgreSQL l'avait pourtant
-- ouverte à tout le monde — c'est son comportement par défaut pour toute
-- fonction, et le « grant … to authenticated » d'origine ne l'annulait pas.
-- On retire ce droit ici : après ce passage, seule une session connectée
-- peut l'appeler.
revoke execute on function transfer_shein_requests(uuid, uuid) from public;
grant execute on function transfer_shein_requests(uuid, uuid) to authenticated;

-- ── 6. Ouverture des inscriptions ─────────────────────────────────────
-- Un groupage avait une date de fin (clôture) mais pas de date de début.
-- La boutique annonce désormais les deux : « inscriptions du 1er au 8 ».
-- Colonne vide = date pas encore arrêtée, et le site n'affiche rien plutôt
-- qu'une date inventée.
alter table groupings add column if not exists opening_date timestamptz;
alter table settings add column if not exists next_grouping_opening timestamptz;

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
    -- Sans « Livraison » : la ligne du message le dit déjà, et l'alerte
    -- affichait « Livraison : Livraison Saint-Louis ».
    when 'city' then 'Saint-Louis'
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
      headers := '{"Content-Type": "application/json"}'::jsonb,
      -- 20 s, et non les 5 s par défaut de pg_net. Constaté en vrai : la
      -- poignée de main TLS avec Telegram a consommé 4 988 ms à elle seule,
      -- et l'envoi expirait à 5 001 ms sans même avoir posé la question.
      timeout_milliseconds := 20000
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
    headers := '{"Content-Type": "application/json"}'::jsonb,
    -- Même raison que pour le déclencheur : 5 s ne suffisent pas toujours
    -- à établir la connexion avec Telegram.
    timeout_milliseconds := 20000
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

-- ── 8. L'alerte passe par ntfy.sh ─────────────────────────────────────
-- Mesuré depuis la base de la boutique : api.telegram.org ne répond jamais
-- (trois essais, 5 s, 12 s et 20 s — la connexion expire toujours au même
-- point, avant même d'avoir posé sa question), alors que github.com et
-- example.com répondent 200 depuis le même endroit. Le chemin vers
-- Telegram est fermé, ce n'est pas réglable de notre côté.
--
-- ntfy.sh a été testé depuis la même base : 200. Il ne demande ni compte
-- ni jeton — juste un nom de canal secret, que l'on tape dans une
-- application gratuite pour recevoir les notifications.

alter table alert_settings add column if not exists ntfy_topic text not null default '';
-- Par défaut, l'alerte ne dit PAS qui est la cliente : un canal ntfy est
-- lisible par quiconque devine son nom. La boutique peut l'activer en
-- connaissance de cause depuis l'administration.
alter table alert_settings add column if not exists include_customer boolean not null default false;

create or replace function texte_alerte(source text, ligne jsonb, avec_client boolean default true)
returns text
language sql
immutable
as $$
  select case when source = 'orders' then
    'N° ' || (ligne->>'order_number') || E'\n'
      || case when avec_client
              then (ligne->>'customer_name') || ' — ' || (ligne->>'phone') || E'\n'
              else '' end
      || 'Total : ' || (ligne->>'total') || E' FCFA\n'
      || 'Livraison : ' || libelle_alerte(ligne->>'delivery_zone_id')
      || case when ligne->>'delivery_fee' is null and ligne->>'delivery_zone_id' <> 'pickup'
              then ' (frais à confirmer)' else '' end
      || E'\n'
      || 'Paiement : ' || libelle_alerte(ligne->>'payment_method')
      || case when avec_client and coalesce(ligne->>'address', '') <> ''
              then E'\n' || (ligne->>'address') else '' end
  else
    'N° ' || (ligne->>'request_number') || E'\n'
      || case when avec_client
              then (ligne->>'customer_name') || ' — ' || (ligne->>'phone') || E'\n'
              else '' end
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
  if not found or not conf.enabled or coalesce(conf.ntfy_topic, '') = '' then
    return null;
  end if;

  if tg_table_name = 'orders' then
    select to_jsonb(o) into ligne from orders o where o.id = new.id;
  else
    select to_jsonb(s) into ligne from shein_requests s where s.id = new.id;
  end if;
  if ligne is null then
    return null;
  end if;

  begin
    /*
     * On publie par l'entrée JSON de ntfy, et non en texte brut sur
     * /<canal>. Raison : pg_net sérialise le corps en JSON. Un texte passé
     * tel quel serait parti entre guillemets, avec des \n littéraux au
     * lieu de retours à la ligne. En JSON, le message est un champ, et il
     * arrive correctement mis en forme — accents compris.
     */
    perform net.http_post(
      url := 'https://ntfy.sh/',
      body := jsonb_build_object(
        'topic', conf.ntfy_topic,
        'title', case when tg_table_name = 'orders'
                      then 'Nouvelle commande' else 'Nouvelle demande SHEIN' end,
        'message', texte_alerte(tg_table_name::text, ligne, conf.include_customer),
        'priority', 4,
        'tags', jsonb_build_array('shopping_cart')
      ),
      headers := '{"Content-Type": "application/json"}'::jsonb,
      timeout_milliseconds := 20000
    );
  exception when others then
    null;
  end;

  return null;
end;
$$;

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
  if not found or coalesce(conf.ntfy_topic, '') = '' then
    raise exception 'Renseignez le nom de votre canal, puis enregistrez.';
  end if;

  return net.http_post(
    url := 'https://ntfy.sh/',
    body := jsonb_build_object(
      'topic', conf.ntfy_topic,
      'title', 'Afaura Luméa',
      'message', 'L''alerte fonctionne. Vous recevrez ce genre de message à chaque nouvelle commande.',
      'priority', 4,
      'tags', jsonb_build_array('white_check_mark')
    ),
    headers := '{"Content-Type": "application/json"}'::jsonb,
    timeout_milliseconds := 20000
  );
end;
$$;

revoke execute on function tester_alerte() from public;
revoke execute on function texte_alerte(text, jsonb, boolean) from public;
grant execute on function tester_alerte() to authenticated;

-- ── 9. Un prix par option (lot de 4, lot de 12…) ──────────────────────
-- Le même article peut se vendre en plusieurs conditionnements. L'option
-- choisie porte alors son propre prix, et `price` sert de valeur par défaut.
--
-- Le navigateur n'envoie QUE le libellé de l'option. Le montant est relu
-- ici, dans la table — comme tous les autres montants du site.

alter table products add column if not exists option_prices jsonb not null default '{}'::jsonb;

create or replace function prix_option(p_product products, p_options jsonb)
returns integer
language plpgsql
immutable
as $$
declare
  v_groupe text;
  v_choix text;
  v_prix jsonb;
begin
  if jsonb_typeof(coalesce(p_product.option_prices, '{}'::jsonb)) <> 'object' then
    return p_product.price;
  end if;

  -- Groupes parcourus dans l'ordre alphabétique : si deux groupes portaient
  -- un prix, le montant ne doit pas dépendre de l'ordre de stockage du JSON.
  -- Le premier qui correspond gagne, et l'application applique la même règle.
  for v_groupe in select k from jsonb_object_keys(p_product.option_prices) k order by k loop
    v_choix := p_options ->> v_groupe;
    continue when v_choix is null;
    v_prix := p_product.option_prices -> v_groupe -> v_choix;
    if v_prix is not null and jsonb_typeof(v_prix) = 'number' then
      return greatest(0, (v_prix #>> '{}')::numeric::integer);
    end if;
  end loop;

  return p_product.price;
end;
$$;

revoke execute on function prix_option(products, jsonb) from public;

-- La fonction de commande doit appliquer ce prix : on la remplace en entier.
-- (Même corps que dans schema.sql, à la ligne du prix unitaire près.)

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
  v_unit integer;
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

    -- Prix unitaire : celui de l'option choisie s'il en a un, sinon celui de
    -- l'article. Relu dans la table, jamais reçu du navigateur.
    v_unit := prix_option(v_product, coalesce(v_item -> 'options', '{}'::jsonb));

    insert into order_items (order_id, product_id, name, quantity, unit_price, options)
    values (
      v_order_id, v_product.id, v_product.name, v_quantity, v_unit,
      coalesce(v_item -> 'options', '{}'::jsonb)
    );

    v_subtotal := v_subtotal + v_unit * v_quantity;

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

grant execute on function create_order(text, text, text, text, text, text, text, jsonb, text, boolean) to anon, authenticated;
