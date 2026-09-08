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
--       robot n'est pas renseigné dans l'administration ;
--    8. fait passer la même alerte par ntfy.sh, sans robot à créer ;
--    9. permet à un produit d'avoir un prix par option (lot de 4, lot de 12…) ;
--   10. applique aux commandes de la boutique les frais de traitement déjà
--       réglés dans Administration → Tarification, la même grille que pour
--       les demandes SHEIN ;
--   11. permet de réserver une offre aux commandes qui atteignent un montant
--       minimum d'articles ;
--   12. ajoute les glosses et huiles à lèvres, disponibles tout de suite, et
--       la marque « en stock » qui les distingue du reste du catalogue ;
--   13. ajoute les gommages et les parfums, en brouillon tant que leur prix
--       n'est pas fixé ;
--   14. ouvre le rayon maquillage, en brouillon lui aussi ;
--   15. ouvre les rayons bougies, sacs et sous-vêtements — chaque sac
--       gardant sa propre fiche, puisque leurs prix diffèrent ;
--   16. complète le rayon avec trois pyjamas, un lot de shorts et un
--       bonnet de nuit ;
--   17. ouvre le rayon chaussures et celui des combinaisons, et ajoute un
--       coffret de parfums et un bonnet de douche ;
--   18. ouvre les rayons gel de douche, lait corporel et accessoires
--       beauté ;
--   19. ajoute « Pink Champagne » aux parfums du gel douche ;
--   20. ajoute quatre eaux de parfum, chacune sur sa propre fiche ;
--   21. ajoute Choco Musk, dont les trois saveurs tiennent sur une fiche
--       unique puisqu'elles sont au même prix ;
--   22. donne leur prix à sept articles, qui entrent en ligne ;
--   23. en met quinze de plus en vente, dont deux qui annoncent
--       franchement ce qui reste à préciser ;
--   24. rend « en stock » aux seuls lips gloss.
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


-- ── 10. Frais de traitement des commandes de la boutique ─────────────
-- Préparer et acheminer une commande demande un travail que le prix des
-- pièces ne couvre pas. Les commandes de la boutique portent donc les mêmes
-- frais que les demandes SHEIN, d'après LA GRILLE DÉJÀ RÉGLÉE dans
-- Administration → Tarification (« Tranches par nombre d'articles »).
--
-- Une seule grille pour les deux services : rien de nouveau à saisir.
-- Comme tous les montants du site : calculé ICI, jamais reçu du navigateur.

alter table orders add column if not exists service_fee integer not null default 0;

create or replace function frais_boutique(p_articles integer, p_tiers jsonb)
returns integer
language plpgsql
immutable
as $$
declare
  v_tranche jsonb;
  v_min integer;
  v_max jsonb;
  v_frais jsonb;
begin
  if p_articles is null or p_articles <= 0 then return 0; end if;
  if jsonb_typeof(coalesce(p_tiers, '[]'::jsonb)) <> 'array' then return 0; end if;

  -- Première tranche qui contient ce nombre d'articles, dans l'ordre de la
  -- grille : c'est aussi la règle appliquée à l'affichage (lib/pricing/storeFee).
  -- La grille est celle de Tarification, partagée avec le devis SHEIN.
  for v_tranche in select * from jsonb_array_elements(p_tiers) loop
    v_min := coalesce((v_tranche ->> 'minItems')::integer, 1);
    v_max := v_tranche -> 'maxItems';
    continue when p_articles < v_min;
    continue when v_max is not null and jsonb_typeof(v_max) = 'number'
                  and p_articles > (v_max #>> '{}')::integer;
    v_frais := v_tranche -> 'fee';
    if v_frais is not null and jsonb_typeof(v_frais) = 'number' then
      return greatest(0, (v_frais #>> '{}')::numeric::integer);
    end if;
    -- Tranche « devis manuel » : rien de facturé automatiquement.
    return 0;
  end loop;

  return 0;
end;
$$;

revoke execute on function frais_boutique(integer, jsonb) from public;

-- La fonction de commande doit appliquer ces frais : on la remplace en entier.

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
  v_articles integer := 0;
  v_service integer := 0;
  v_tiers jsonb;
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

  select (delivery_fees ->> p_delivery_zone_id)::integer,
         coalesce(promotions, '[]'::jsonb),
         coalesce(pricing -> 'tiers', '[]'::jsonb)
    into v_fee, v_promotions, v_tiers
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
    -- Les unités, pas les lignes : douze cahiers font douze articles.
    v_articles := v_articles + v_quantity;

    if v_product.stock is not null then
      update products set stock = greatest(0, stock - v_quantity) where id = v_product.id;
    end if;
  end loop;

  -- Frais de traitement, d'après la grille des réglages et le nombre
  -- d'articles. Grille vide = aucun frais.
  v_service := frais_boutique(v_articles, v_tiers);

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
        v_subtotal + v_service + coalesce(v_fee, 0)
      );
      if v_discount > 0 then
        v_promo_label := v_promo ->> 'label';
        exit;
      end if;
    end if;
  end loop;

  update orders
     set subtotal = v_subtotal,
         service_fee = v_service,
         delivery_fee = v_fee,
         delivery_fee_before_promotion = v_fee_before,
         discount = v_discount,
         promotion_label = v_promo_label,
         total = v_subtotal + v_service + coalesce(v_fee, 0) - v_discount
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

-- ── 11. Montant minimum d'une offre ──────────────────────────────────
-- Une remise sort de la poche de la boutique. Une offre peut désormais porter
-- un seuil : « valable à partir de X FCFA d'articles ». Le seuil se règle dans
-- Administration → Tarification → Offres, et se compte sur le PRIX DES
-- ARTICLES seuls — ni les frais de traitement, ni la livraison, ni le
-- transport ne comptent pour l'atteindre.
--
-- Une offre sans seuil garde exactement le comportement qu'elle avait :
-- « minSubtotal » absent veut dire « aucun minimum ».
--
-- Les conditions sont vérifiées ICI, jamais d'après le navigateur : on remplace
-- donc les deux fonctions de commande en entier.

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
  v_articles integer := 0;
  v_service integer := 0;
  v_tiers jsonb;
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

  select (delivery_fees ->> p_delivery_zone_id)::integer,
         coalesce(promotions, '[]'::jsonb),
         coalesce(pricing -> 'tiers', '[]'::jsonb)
    into v_fee, v_promotions, v_tiers
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
    -- Les articles se comptent en unités, pas en lignes : douze cahiers font
    -- douze articles. Même règle que pour les demandes SHEIN.
    v_articles := v_articles + v_quantity;

    if v_product.stock is not null then
      update products set stock = greatest(0, stock - v_quantity) where id = v_product.id;
    end if;
  end loop;

  -- Frais de traitement, d'après la grille des réglages. Grille vide : aucun
  -- frais. Calculé ici, jamais reçu du navigateur.
  v_service := frais_boutique(v_articles, v_tiers);

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
    -- Montant minimum d'articles : le seuil porte sur le prix des articles
    -- seuls, jamais sur les frais ni la livraison. Absent = aucun minimum.
    continue when jsonb_typeof(v_promo -> 'minSubtotal') = 'number'
                  and v_subtotal < (v_promo ->> 'minSubtotal')::numeric;
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
        v_subtotal + v_service + coalesce(v_fee, 0)
      );
      if v_discount > 0 then
        v_promo_label := v_promo ->> 'label';
        exit;
      end if;
    end if;
  end loop;

  update orders
     set subtotal = v_subtotal,
         service_fee = v_service,
         delivery_fee = v_fee,
         delivery_fee_before_promotion = v_fee_before,
         discount = v_discount,
         promotion_label = v_promo_label,
         total = v_subtotal + v_service + coalesce(v_fee, 0) - v_discount
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
      -- Montant minimum d'articles. Tant que le sous-total n'est pas chiffré
      -- (prix non déclarés), une offre à seuil ne s'applique pas : mieux vaut
      -- l'annoncer plus tard que promettre une remise qu'il faudra retirer.
      continue when jsonb_typeof(v_promo -> 'minSubtotal') = 'number'
                    and (not v_subtotal_known
                         or v_subtotal < (v_promo ->> 'minSubtotal')::numeric);
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

grant execute on function create_shein_request(text, text, text, text, jsonb, boolean, text) to anon, authenticated;

-- ── 12. Glosses et huiles à lèvres, disponibles tout de suite ────────
-- Ces articles ne sont pas commandés pièce par pièce : ils sont achetés en
-- lot et gardés en boutique. Le site le dit sur leur fiche, et ne fait donc
-- plus attendre un groupage pour une commande qui peut être remise le jour
-- même.
--
-- `ready_to_ship` vaut false partout ailleurs : le reste du catalogue garde
-- exactement le comportement qu'il avait.

alter table products add column if not exists ready_to_ship boolean not null default false;


insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'gloss-romantic', 'gloss-romantic', 'Gloss Romantic',
  'Gloss à lèvres brillant, texture légère et confortable. Applicateur mousse, flacon transparent à capuchon doré. Disponible tout de suite en boutique.',
  1000, null, 'lips',
  '[]'::jsonb, '[{"name": "Teinte", "options": ["Rose subtil", "Transparent", "Nude naturel", "Marron élégant"]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  status = excluded.status,
  is_new = excluded.is_new,
  ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'gloss-nyx', 'gloss-nyx', 'Gloss NYX Lip',
  'Gloss à lèvres NYX, effet brillance naturelle et hydratation intense. Teintes subtiles qui se portent tous les jours. Disponible tout de suite en boutique.',
  1000, null, 'lips',
  '[]'::jsonb, '[{"name": "Teinte", "options": ["Transparent", "Rose subtil", "Marron élégant"]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  status = excluded.status,
  is_new = excluded.is_new,
  ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'gloss-olibolla', 'gloss-olibolla', 'Glossy Lip Balm Olibolla',
  'Baume à lèvres brillant Olibolla : hydrate, nourrit et repulpe. Neuf teintes, du transparent au brun profond. Disponible tout de suite en boutique.',
  1000, null, 'lips',
  '[]'::jsonb, '[{"name": "Teinte", "options": ["01 Clear", "02 Milky", "03 Pink", "04 Rose", "05 Mauve", "06 Nude", "07 Red", "08 Berry", "09 Brown"]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  status = excluded.status,
  is_new = excluded.is_new,
  ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'gloss-lip-oil', 'gloss-lip-oil', 'Huile à lèvres teintée',
  'Huile à lèvres teintée, enrichie en vitamines : hydratation intense et brillance naturelle. Six couleurs, de la plus discrète à la plus vive. Disponible tout de suite en boutique.',
  1000, null, 'lips',
  '[]'::jsonb, '[{"name": "Teinte", "options": ["01 Nude rosé", "02 Lilas", "03 Pêche", "04 Corail", "05 Rose bonbon", "06 Violet"]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  status = excluded.status,
  is_new = excluded.is_new,
  ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'gloss-victoria', 'gloss-victoria', 'Lip Oil soin',
  'Huile à lèvres traitante Victoria''s Spirit : répare, protège et fait briller. Trois soins au choix, aux extraits naturels. Disponible tout de suite en boutique.',
  1000, null, 'lips',
  '[]'::jsonb, '[{"name": "Soin", "options": ["Cannabis Sativa Seed Oil", "Cocoa Butter", "Hydratant"]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  status = excluded.status,
  is_new = excluded.is_new,
  ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'box-gloss', 'box-gloss', 'Box gloss lips',
  'Coffret de trois glosses, choisis un par un dans toute la gamme : baumes brillants, huiles teintées ou soins. 2 500 FCFA les trois, au lieu de 3 000 FCFA à l''unité. Disponible tout de suite en boutique.',
  2500, 3000, 'lips',
  '[]'::jsonb, '[{"name": "Gloss 1", "options": ["Romantic — Rose subtil", "Romantic — Transparent", "Romantic — Nude naturel", "Romantic — Marron élégant", "NYX — Transparent", "NYX — Rose subtil", "NYX — Marron élégant", "Olibolla — 01 Clear", "Olibolla — 02 Milky", "Olibolla — 03 Pink", "Olibolla — 04 Rose", "Olibolla — 05 Mauve", "Olibolla — 06 Nude", "Olibolla — 07 Red", "Olibolla — 08 Berry", "Olibolla — 09 Brown", "Huile teintée — 01 Nude rosé", "Huile teintée — 02 Lilas", "Huile teintée — 03 Pêche", "Huile teintée — 04 Corail", "Huile teintée — 05 Rose bonbon", "Huile teintée — 06 Violet", "Lip Oil soin — Cannabis Sativa Seed Oil", "Lip Oil soin — Cocoa Butter", "Lip Oil soin — Hydratant"]}, {"name": "Gloss 2", "options": ["Romantic — Rose subtil", "Romantic — Transparent", "Romantic — Nude naturel", "Romantic — Marron élégant", "NYX — Transparent", "NYX — Rose subtil", "NYX — Marron élégant", "Olibolla — 01 Clear", "Olibolla — 02 Milky", "Olibolla — 03 Pink", "Olibolla — 04 Rose", "Olibolla — 05 Mauve", "Olibolla — 06 Nude", "Olibolla — 07 Red", "Olibolla — 08 Berry", "Olibolla — 09 Brown", "Huile teintée — 01 Nude rosé", "Huile teintée — 02 Lilas", "Huile teintée — 03 Pêche", "Huile teintée — 04 Corail", "Huile teintée — 05 Rose bonbon", "Huile teintée — 06 Violet", "Lip Oil soin — Cannabis Sativa Seed Oil", "Lip Oil soin — Cocoa Butter", "Lip Oil soin — Hydratant"]}, {"name": "Gloss 3", "options": ["Romantic — Rose subtil", "Romantic — Transparent", "Romantic — Nude naturel", "Romantic — Marron élégant", "NYX — Transparent", "NYX — Rose subtil", "NYX — Marron élégant", "Olibolla — 01 Clear", "Olibolla — 02 Milky", "Olibolla — 03 Pink", "Olibolla — 04 Rose", "Olibolla — 05 Mauve", "Olibolla — 06 Nude", "Olibolla — 07 Red", "Olibolla — 08 Berry", "Olibolla — 09 Brown", "Huile teintée — 01 Nude rosé", "Huile teintée — 02 Lilas", "Huile teintée — 03 Pêche", "Huile teintée — 04 Corail", "Huile teintée — 05 Rose bonbon", "Huile teintée — 06 Violet", "Lip Oil soin — Cannabis Sativa Seed Oil", "Lip Oil soin — Cocoa Butter", "Lip Oil soin — Hydratant"]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  compare_at_price = excluded.compare_at_price,
  category = excluded.category,
  variants = excluded.variants,
  status = excluded.status,
  is_new = excluded.is_new,
  ready_to_ship = excluded.ready_to_ship;

-- ── 13. Soins du corps : gommages et parfums ─────────────────────────
-- Comme les glosses, ces articles sont gardés en boutique et se remettent
-- tout de suite.
--
-- Ils arrivent en BROUILLON (`status = 'draft'`) : leur prix n'est pas encore
-- fixé, et un article à 0 FCFA n'a rien à faire devant une cliente. Ils
-- apparaîtront le jour où la boutique saisira leur prix depuis
-- Administration → Produits, ou par une mise à jour de ce fichier.


insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'gommage-tree-hut', 'gommage-tree-hut', 'Gommage Tree Hut',
  'Gommage au sucre et au karité, pot de 510 g. Exfolie en douceur et laisse la peau nourrie. Quatre parfums au choix.',
  0, null, 'gommage',
  '[]'::jsonb, '[{"name": "Parfum", "options": ["Cotton Candy", "Moroccan Rose", "Pink Champagne", "Watermelon"]}]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  variants = excluded.variants,
  is_new = excluded.is_new,
  ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'gommage-bosuya', 'gommage-bosuya', 'Gommage Bosuya',
  'Gommage au sucre et sel de bain, pot de 350 g. Exfoliation délicate, extraits naturels hydratants. Six parfums au choix.',
  0, null, 'gommage',
  '[]'::jsonb, '[{"name": "Parfum", "options": ["Pastèque", "Riz", "Rose", "Café", "Coco", "Orange"]}]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  variants = excluded.variants,
  is_new = excluded.is_new,
  ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'parfum-victoria-key', 'parfum-victoria-key', 'Coffret brumes Victoria’s Key',
  'Coffret de quatre brumes parfumées Victoria’s Key, en flacons vaporisateurs.',
  0, null, 'parfum',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  variants = excluded.variants,
  is_new = excluded.is_new,
  ready_to_ship = excluded.ready_to_ship;

-- ── 14. Maquillage : la catégorie et son premier article ─────────────
-- La boutique ouvre un rayon maquillage. Comme les soins, l'article arrive
-- en BROUILLON : ni son prix ni la liste de ses quatorze teintes ne sont
-- connus, et une teinte choisie à l'aveugle se paie au retrait.

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'anticernes-sheglam', 'anticernes-sheglam', 'Anti-cernes Hideaway',
  'Anti-cernes fluide à applicateur mousse : couvre les cernes et unifie sans marquer. Quatorze teintes, du plus clair au plus foncé.',
  0, null, 'maquillage',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  is_new = excluded.is_new,
  ready_to_ship = excluded.ready_to_ship;

-- ── 15. Bougies, sacs et sous-vêtements ──────────────────────────────
-- Trois rayons de plus. Les sacs valent une remarque : chaque modèle est un
-- article distinct, parce que la boutique les achète à des prix différents.
-- Les réunir sous une seule fiche obligerait à afficher un prix unique, faux
-- pour tous les autres.
--
-- Les coloris des sacs ne sont pas listés : la boutique en montre beaucoup,
-- mais aucun nom n'est lisible sur ses visuels. `other_colors_available` le
-- dit honnêtement plutôt que d'en inventer.
--
-- Tout arrive en BROUILLON : aucun prix n'est fixé.

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'bougies-latte', 'bougies-latte', 'Bougie parfumée Latte',
  'Bougie parfumée en verre, coulée en deux couches comme un café glacé. Huit parfums au choix.',
  0, null, 'bougie',
  '[]'::jsonb,
  '[{"name": "Parfum", "options": ["Pink Coconut Matcha Latte", "Matcha Latte", "Lemon Matcha Latte", "Sakura Latte", "Lavender Latte", "Taro Latte", "Caramel Latte", "The Iced Coffee"]}]'::jsonb,
  '{}'::jsonb, null, 'draft',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  category = excluded.category, variants = excluded.variants,
  is_new = excluded.is_new, ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'sac-leopard-brun', 'sac-leopard-brun', 'Sac cabas léopard',
  'Grand cabas souple en suédine imprimée léopard, ceinturé d''une lanière rose à boucle dorée. Anses longues, porté à l''épaule.',
  0, null, 'sac',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  true, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  category = excluded.category, is_new = excluded.is_new,
  other_colors_available = excluded.other_colors_available,
  ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'sac-bordeaux', 'sac-bordeaux', 'Sac épaule bordeaux',
  'Petit sac d''épaule arrondi, cuir grainé, fermeture zippée et bandoulière réglable.',
  0, null, 'sac',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  true, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  category = excluded.category, is_new = excluded.is_new,
  other_colors_available = excluded.other_colors_available,
  ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'sac-cabas-brun', 'sac-cabas-brun', 'Sac cabas brun',
  'Cabas en cuir grainé souple, plis latéraux et anses longues. Se porte à la main comme à l''épaule.',
  0, null, 'sac',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  true, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  category = excluded.category, is_new = excluded.is_new,
  other_colors_available = excluded.other_colors_available,
  ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'short-nuit', 'short-nuit', 'Short taille repliée',
  'Short court en coton doux, ceinture large à revers. Se porte pour dormir ou à la maison.',
  0, null, 'lingerie',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  true, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  category = excluded.category, is_new = excluded.is_new,
  other_colors_available = excluded.other_colors_available,
  ready_to_ship = excluded.ready_to_ship;

-- ── 16. Pyjamas, shorts et bonnets de nuit ───────────────────────────
-- Trois ensembles de pyjama, chacun sa fiche : un imprimé n'a pas forcément
-- le prix d'un autre, et une fiche unique en afficherait un seul.
--
-- Le bonnet de nuit est rangé ici plutôt qu'avec les accessoires : il se
-- porte pour dormir, comme le reste du rayon.
--
-- Tout en BROUILLON. Les coloris des ensembles ne sont pas listés — la
-- boutique enverra ses photos.

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'pyjama-noir-rose', 'pyjama-noir-rose', 'Ensemble pyjama noir liseré rose',
  'Haut cache-cœur manches longues à nouer, liseré rose, et pantalon large à taille élastique et cordon. Deux pièces.',
  0, null, 'lingerie',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  true, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  category = excluded.category, is_new = excluded.is_new,
  other_colors_available = excluded.other_colors_available,
  ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'pyjama-pois', 'pyjama-pois', 'Ensemble pyjama à pois',
  'Haut cache-cœur manches longues à pois blancs, taille froncée, et pantalon large assorti à ceinture rose. Deux pièces.',
  0, null, 'lingerie',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  true, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  category = excluded.category, is_new = excluded.is_new,
  other_colors_available = excluded.other_colors_available,
  ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'pyjama-raye-rose', 'pyjama-raye-rose', 'Ensemble pyjama rayé rose',
  'Haut manches longues à rayures roses, noué devant sur un débardeur blanc, et pantalon évasé assorti. Deux pièces.',
  0, null, 'lingerie',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  true, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  category = excluded.category, is_new = excluded.is_new,
  other_colors_available = excluded.other_colors_available,
  ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'shorts-lot-trois', 'shorts-lot-trois', 'Lot de trois shorts',
  'Trois shorts courts à taille haute large : noir uni, gris chiné et imprimé léopard rose.',
  0, null, 'lingerie',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  true, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  category = excluded.category, is_new = excluded.is_new,
  other_colors_available = excluded.other_colors_available,
  ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'bonnet-satin', 'bonnet-satin', 'Bonnet de nuit en satin',
  'Bonnet doublé satin à bord élastique, pour protéger les cheveux pendant la nuit. Trois motifs au choix.',
  0, null, 'lingerie',
  '[]'::jsonb,
  '[{"name": "Motif", "options": ["Noir à nœuds roses", "Rose à pois blancs", "Marine à pois roses"]}]'::jsonb,
  '{}'::jsonb, null, 'draft',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  category = excluded.category, variants = excluded.variants,
  is_new = excluded.is_new, ready_to_ship = excluded.ready_to_ship;

-- ── 17. Chaussures, combinaison, coffret et bonnet de douche ─────────
-- Le rayon chaussures s'ouvre enfin, avec sa première paire. Aucune pointure
-- n'est proposée : la boutique n'a pas dit lesquelles elle prend, et une
-- chaussure vendue sans pointure se retourne.
--
-- La combinaison a son propre rayon plutôt que d'aller chez les robes : une
-- combinaison-pantalon n'est pas une robe.
--
-- Tout en BROUILLON.

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'sandales-leopard', 'sandales-leopard', 'Sandales plates à boucle',
  'Sandales plates à bride croisée et boucle dorée, semelle rembourrée. Se portent en ville comme à la maison.',
  0, null, 'chaussure',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  true, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  category = excluded.category, is_new = excluded.is_new,
  other_colors_available = excluded.other_colors_available,
  ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'combinaison-rayee', 'combinaison-rayee', 'Combinaison rayée bretelle nouée',
  'Combinaison longue à rayures, bustier droit et fine bretelle à nouer derrière la nuque, jambes évasées. Maille imprimée effet crochet.',
  0, null, 'combinaison',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  true, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  category = excluded.category, is_new = excluded.is_new,
  other_colors_available = excluded.other_colors_available,
  ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'shorts-lot-quatre', 'shorts-lot-quatre', 'Lot de quatre shorts',
  'Quatre shorts courts à ceinture repliée : rayé rose, imprimé cerises, noir uni et rose à pois.',
  0, null, 'lingerie',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  true, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  category = excluded.category, is_new = excluded.is_new,
  other_colors_available = excluded.other_colors_available,
  ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'coffret-parfums-dignife', 'coffret-parfums-dignife', 'Coffret trois parfums',
  'Coffret de trois eaux de parfum de 30 mL, présentées dans un écrin noir. Trois flacons, trois senteurs.',
  0, null, 'parfum',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  category = excluded.category, is_new = excluded.is_new,
  ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'bonnet-douche', 'bonnet-douche', 'Bonnet de douche satin',
  'Bonnet de douche doublé, bord élastique froncé, imprimé de petits nœuds. Garde les cheveux au sec.',
  0, null, 'lingerie',
  '[]'::jsonb,
  '[{"name": "Coloris", "options": ["Blanc à nœuds bruns", "Rose poudré", "Beige", "Blanc bord brun"]}]'::jsonb,
  '{}'::jsonb, null, 'draft',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  category = excluded.category, variants = excluded.variants,
  is_new = excluded.is_new, ready_to_ship = excluded.ready_to_ship;

-- ── 18. Gel douche, lait corporel et bandeau spa ─────────────────────
-- Le gel de douche que la boutique attendait, et le lait corporel de la même
-- gamme. Deux rayons plutôt qu'un « soins du corps » fourre-tout : on ne
-- cherche pas un gel douche et un lait le même jour.
--
-- Les senteurs du lait viennent toutes des visuels de la boutique — les neuf
-- de son affiche plus « Beach Waves ». Le gel n'en annonce que trois : celles
-- dont la photo est arrivée. Un parfum ajouté de mémoire est un parfum qu'on
-- ne pourra pas remettre.
--
-- Tout en BROUILLON.

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'gel-douche-eos', 'gel-douche-eos', 'Gel douche Cashmere',
  'Gel douche au beurre de karité, 473 mL. Nettoie en douceur, pH équilibré, pensé pour les peaux sensibles.',
  0, null, 'gel_douche',
  '[]'::jsonb,
  '[{"name": "Parfum", "options": ["Crème de pistache", "Grenade & framboise", "Fresh & Cozy"]}]'::jsonb,
  '{}'::jsonb, null, 'draft',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  category = excluded.category, variants = excluded.variants,
  is_new = excluded.is_new, ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'lait-corps-eos', 'lait-corps-eos', 'Lait corporel 24H',
  'Lait hydratant au beurre de karité, 473 mL. Sept huiles et beurres nourrissants, hydratation 24 heures.',
  0, null, 'lait_corps',
  '[]'::jsonb,
  '[{"name": "Senteur", "options": ["Vanilla Cashmere", "Pomegranate Raspberry", "Pink Champagne", "Jasmine Peach", "Strawberry Dream", "Crème Pistachio", "Fresh & Cozy", "Coconut Waters", "Beach Waves", "Sans parfum"]}]'::jsonb,
  '{}'::jsonb, null, 'draft',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  category = excluded.category, variants = excluded.variants,
  is_new = excluded.is_new, ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'bandeau-spa', 'bandeau-spa', 'Bandeau spa et manchettes',
  'Bandeau matelassé et paire de manchettes en éponge, pour dégager le visage et garder les poignets au sec pendant le soin.',
  0, null, 'accessoire_beaute',
  '[]'::jsonb,
  '[{"name": "Coloris", "options": ["Vache noir et blanc", "Léopard", "Chocolat", "Taupe", "Rose vif", "Beige"]}]'::jsonb,
  '{}'::jsonb, null, 'draft',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  category = excluded.category, variants = excluded.variants,
  is_new = excluded.is_new, ready_to_ship = excluded.ready_to_ship;

-- ── 19. Un quatrième parfum pour le gel douche ───────────────────────
-- « Pink Champagne » : la boutique en a envoyé la photo. Le prix ne change
-- pas ici — l'article reste en brouillon jusqu'à ce qu'elle le fixe.

update products
   set variants = '[{"name": "Parfum", "options": ["Crème de pistache", "Grenade & framboise", "Fresh & Cozy", "Pink Champagne"]}]'::jsonb
 where id = 'gel-douche-eos';

-- ── 20. Quatre eaux de parfum ────────────────────────────────────────
-- Quatre flacons de 30 mL, quatre fiches. La boutique fixe le prix de
-- chacune séparément : une fiche commune n'en afficherait qu'un seul,
-- faux pour les trois autres.
--
-- En BROUILLON, comme le reste, jusqu'à ce que ces prix arrivent.

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'parfum-miel-bebe', 'parfum-miel-bebe', 'Eau de parfum Miel Bébé',
  'Eau de parfum 30 mL. Un sillage de miel et d''agrumes, réchauffé de cannelle.',
  0, null, 'parfum',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  category = excluded.category, is_new = excluded.is_new,
  ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'parfum-cherry-blossom', 'parfum-cherry-blossom', 'Eau de parfum Cherry Blossom',
  'Eau de parfum 30 mL. Un floral léger de fleur de cerisier, livré dans son étui.',
  0, null, 'parfum',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  category = excluded.category, is_new = excluded.is_new,
  ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'parfum-lait-de-coco', 'parfum-lait-de-coco', 'Eau de parfum Lait de Coco',
  'Eau de parfum 30 mL. Coco crémeuse et cacao, adoucis de bois et de zeste de citron vert.',
  0, null, 'parfum',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  category = excluded.category, is_new = excluded.is_new,
  ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'parfum-creme-vanille', 'parfum-creme-vanille', 'Eau de parfum Crème Vanille',
  'Eau de parfum 30 mL. Vanille gourmande sur un fond de beurre de karité.',
  0, null, 'parfum',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  category = excluded.category, is_new = excluded.is_new,
  ready_to_ship = excluded.ready_to_ship;

-- ── 21. Choco Musk, trois saveurs sur une seule fiche ────────────────
-- Contrairement aux quatre eaux de parfum de l'étape 20, celui-ci tient sur
-- une fiche unique : ses trois saveurs sont au même prix. C'est le prix qui
-- décide, pas le nombre de photos — une fiche par article dès que les prix
-- diffèrent, une seule quand ils sont égaux.
--
-- En BROUILLON, comme le reste.

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'choco-musk', 'choco-musk', 'Choco Musk',
  'Eau de parfum vaporisateur 50 mL, 80 % vol. Un musc chocolaté et vanillé, tenace et enveloppant. Trois saveurs au choix, au même prix.',
  0, null, 'parfum',
  '[]'::jsonb,
  '[{"name": "Saveur", "options": ["Original", "Marshmallow", "Pistache"]}]'::jsonb,
  '{}'::jsonb, null, 'draft',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  category = excluded.category, variants = excluded.variants,
  is_new = excluded.is_new, ready_to_ship = excluded.ready_to_ship;

-- ── 22. Premiers prix : sept articles entrent en ligne ───────────────
-- La boutique a donné ses premiers prix. Ces sept articles cessent d'être en
-- brouillon et deviennent visibles pour les clientes.
--
-- Deux existaient déjà et reçoivent leur prix ; cinq sont créés ici, à partir
-- de visuels qui attendaient. Le gommage Dove et le Body Splash n'ont qu'une
-- fiche chacun : leurs parfums sont au même prix.
--
-- Le reste du catalogue reste en brouillon : un prix manquant vaut mieux
-- qu'un prix inventé.

update products set price = 7500,  status = 'active' where id = 'gommage-bosuya';
update products set price = 12500, status = 'active' where id = 'coffret-parfums-dignife';

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'gommage-dove', 'gommage-dove', 'Gommage Dove',
  'Gommage hydratant pour le corps, pot de 280 g. Exfolie en douceur et nourrit la peau. Trois parfums au choix, au même prix.',
  11500, null, 'gommage',
  '[]'::jsonb,
  '[{"name": "Parfum", "options": ["Grenade & lait", "Coco & sucre brun", "Citron vert & baies"]}]'::jsonb,
  '{}'::jsonb, null, 'active',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, category = excluded.category, variants = excluded.variants,
  status = excluded.status, is_new = excluded.is_new,
  ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'brume-vanilla', 'brume-vanilla', 'Brume parfumée Vanilla',
  'Brume parfumée vaporisateur, 50 mL. Une vanille ambrée, douce et persistante.',
  7500, null, 'parfum',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, category = excluded.category,
  status = excluded.status, is_new = excluded.is_new,
  ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'brume-heritage', 'brume-heritage', 'Heritage Fragrance Mist',
  'Brume parfumée pour le corps, 90 mL. Amber Rose : une rose ambrée, portée par un flacon noué de satin.',
  3500, null, 'parfum',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, category = excluded.category,
  status = excluded.status, is_new = excluded.is_new,
  ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'brume-vanilla-blackberry', 'brume-vanilla-blackberry', 'Brume parfumée Vanilla Blackberry',
  'Brume parfumée vaporisateur, 50 mL. Mûre et vanille, sur un fond de fleur blanche.',
  5000, null, 'parfum',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, category = excluded.category,
  status = excluded.status, is_new = excluded.is_new,
  ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'body-splash', 'body-splash', 'Body Splash',
  'Brume corporelle vaporisateur, 250 mL. Deux senteurs au choix, au même prix.',
  8000, null, 'parfum',
  '[]'::jsonb,
  '[{"name": "Senteur", "options": ["Bare Vanilla", "Lovely Sunny"]}]'::jsonb,
  '{}'::jsonb, null, 'active',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, category = excluded.category, variants = excluded.variants,
  status = excluded.status, is_new = excluded.is_new,
  ready_to_ship = excluded.ready_to_ship;

-- ── 23. Deuxième vague de prix : quinze articles de plus ─────────────
-- Douze fiches qui attendaient reçoivent leur prix, trois sont créées à
-- partir de visuels mis de côté.
--
-- Deux articles partent en vente sans que tout soit connu, et la fiche le dit
-- plutôt que de faire semblant :
--   • l'anti-cernes n'a toujours pas la liste de ses quatorze teintes, donc
--     aucune n'est proposée au choix — le champ « coloris souhaité » prend le
--     relais et la boutique confirme ;
--   • les sandales n'ont pas de pointures connues, et leur description
--     demande à la cliente d'indiquer la sienne.
-- Une teinte ou une pointure inventée se paierait au moment de la remise.

update products set price = 6000,  status = 'active', other_colors_available = true
 where id = 'anticernes-sheglam';
update products set price = 1500,  status = 'active' where id = 'bougies-latte';
update products set price = 14000, status = 'active' where id = 'sac-leopard-brun';
update products set price = 16000, status = 'active' where id = 'sac-bordeaux';
update products set price = 15500, status = 'active' where id = 'sac-cabas-brun';
update products set price = 11500, status = 'active' where id = 'shorts-lot-trois';
update products set price = 16000, status = 'active' where id = 'pyjama-noir-rose';
update products set price = 16000, status = 'active' where id = 'pyjama-raye-rose';
update products set price = 16000, status = 'active' where id = 'pyjama-pois';
update products set price = 5000,  status = 'active' where id = 'bandeau-spa';

update products
   set price = 14000, status = 'active',
       description = 'Sandales plates à bride croisée et boucle dorée, semelle rembourrée. Précisez votre pointure à la commande : nous confirmons sa disponibilité avant tout paiement.'
 where id = 'sandales-leopard';

update products
   set price = 3000, status = 'active',
       name = 'Bonnets de douche satin — lot de deux',
       description = 'Deux bonnets de douche doublés, bord élastique froncé, imprimés de petits nœuds. Gardent les cheveux au sec.'
 where id = 'bonnet-douche';

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'parfum-miss-milk', 'parfum-miss-milk', 'Parfum Miss Milk',
  'Eau de parfum 50 mL. Un lacté vanillé, doux et poudré, dans un flacon à bouchon ciselé.',
  6000, null, 'parfum',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, category = excluded.category,
  status = excluded.status, is_new = excluded.is_new,
  ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'coffret-mini-parfums', 'coffret-mini-parfums', 'Coffret mini parfums',
  'Trois flacons vaporisateurs dans un écrin noué, chacun sa senteur. Prêt à offrir.',
  12000, null, 'parfum',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, category = excluded.category,
  status = excluded.status, is_new = excluded.is_new,
  ready_to_ship = excluded.ready_to_ship;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, ready_to_ship, color_chart_id
) values (
  'bougie-fruitee', 'bougie-fruitee', 'Petite bougie fruitée',
  'Bougie parfumée coulée en forme de fruit, dans sa boîte dorée à couvercle. Quatre parfums au choix, au même prix.',
  1500, null, 'bougie',
  '[]'::jsonb,
  '[{"name": "Parfum", "options": ["Framboise", "Mandarine", "Myrtille", "Fleur violette"]}]'::jsonb,
  '{}'::jsonb, null, 'active',
  true, false,
  false, true, null
)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, description = excluded.description,
  price = excluded.price, category = excluded.category, variants = excluded.variants,
  status = excluded.status, is_new = excluded.is_new,
  ready_to_ship = excluded.ready_to_ship;

-- ── 24. « En stock » : les lips gloss, et eux seuls ──────────────────
-- Les articles arrivés depuis les gommages avaient été marqués disponibles
-- tout de suite. C'est faux : la boutique ne garde sur place que les lips
-- gloss. Tout le reste part avec un groupage, et l'annoncer disponible se
-- paierait au moment de la remise — une cliente qui vient chercher son
-- gommage le jour même repartirait les mains vides.

update products
   set ready_to_ship = false
 where category <> 'lips'
   and ready_to_ship = true;
