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
--       ouverte à tout le monde.
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
