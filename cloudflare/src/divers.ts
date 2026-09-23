/**
 * Groupages, réglages, fréquentation, alertes.
 *
 *  Deux endroits de ce fichier RETIENNENT quelque chose, et c'est le
 *  point important : le coût logistique d'un groupage et les secrets
 *  d'alerte ne doivent jamais sortir vers une cliente. On ne compte pas
 *  sur le site pour ne pas les afficher — le Worker ne les envoie pas.
 */
import type { Env } from './index';
import { bit, entier, exige, identifiant, lireJson, maintenant, texte, vrai } from './outils';

// ── Groupages ──────────────────────────────────────────────────────────

const ETATS_GROUPAGE = new Set([
  'open', 'full', 'closed', 'in_transit', 'arrived', 'delivered', 'postponed', 'cancelled',
]);

export async function listGroupings(_corps: Record<string, unknown>, env: Env, boutique: boolean) {
  const lignes = await env.DB
    .prepare('select * from groupings order by created_at desc')
    .all<Record<string, unknown>>();
  return lignes.results.map((g) => {
    if (boutique) return g;
    /*
     * LE COÛT LOGISTIQUE NE SORT PAS. C'est ce que la boutique paie pour
     * acheminer un groupage — sa marge s'en déduit. Les dates et l'état
     * sont publics, ce chiffre non.
     */
    const { logistics_cost: _cache, note: _note, ...public_ } = g;
    return public_;
  });
}

export async function saveGrouping(corps: Record<string, unknown>, env: Env) {
  const g = (corps.grouping ?? corps) as Record<string, unknown>;
  const id = texte(g.id, 80) || identifiant();
  const statut = texte(g.status, 20) || 'open';
  exige(ETATS_GROUPAGE.has(statut), 'État de groupage inconnu.');
  const maxi = entier(g.max_orders, 1, 1);
  exige(maxi > 0, 'Un groupage accueille au moins une commande.');

  await env.DB.prepare(
    'insert into groupings (id, reference, destination, opening_date, closing_date,' +
    ' max_orders, min_orders, reserved_count, manual_order_count, logistics_cost,' +
    ' status, note, created_at, updated_at)' +
    ' values (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13,?13)' +
    ' on conflict (id) do update set' +
    '  reference = excluded.reference, destination = excluded.destination,' +
    '  opening_date = excluded.opening_date, closing_date = excluded.closing_date,' +
    '  max_orders = excluded.max_orders, min_orders = excluded.min_orders,' +
    '  reserved_count = excluded.reserved_count,' +
    '  manual_order_count = excluded.manual_order_count,' +
    '  logistics_cost = excluded.logistics_cost, status = excluded.status,' +
    '  note = excluded.note, updated_at = excluded.updated_at',
  ).bind(
    id,
    texte(g.reference, 80) || id,
    texte(g.destination, 120),
    texte(g.opening_date, 40) || null,
    texte(g.closing_date, 40) || null,
    maxi,
    entier(g.min_orders, 0, 0),
    entier(g.reserved_count, 0, 0),
    entier(g.manual_order_count, 0, 0),
    g.logistics_cost === null || g.logistics_cost === undefined ? null : entier(g.logistics_cost, 0, 0),
    statut,
    texte(g.note, 600) || null,
    maintenant(),
  ).run();

  return env.DB.prepare('select * from groupings where id = ?1').bind(id).first();
}

export async function deleteGrouping(corps: Record<string, unknown>, env: Env) {
  const id = texte(corps.id, 80);
  exige(id, 'Groupage non désigné.');
  await env.DB.prepare('delete from groupings where id = ?1').bind(id).run();
  return { supprime: id };
}

export async function transferRequests(corps: Record<string, unknown>, env: Env) {
  const depuis = texte(corps.fromGroupingId, 80);
  exige(depuis, 'Groupage de départ non désigné.');
  const vers = texte(corps.toGroupingId, 80) || null;
  const r = await env.DB
    .prepare('update shein_requests set grouping_id = ?2, updated_at = ?3 where grouping_id = ?1')
    .bind(depuis, vers, maintenant())
    .run();
  return r.meta.changes ?? 0;
}

// ── Réglages ───────────────────────────────────────────────────────────

const CHAMPS_JSON = ['delivery_fees', 'pricing', 'promotions', 'alert_thresholds', 'reviews'] as const;

export async function getSettings(_corps: Record<string, unknown>, env: Env) {
  const ligne = await env.DB.prepare('select * from settings where id = 1').first<Record<string, unknown>>();
  exige(ligne, 'Réglages introuvables.', 500);
  const r: Record<string, unknown> = { ...ligne };
  for (const champ of CHAMPS_JSON) {
    r[champ] = lireJson(ligne![champ], champ === 'promotions' || champ === 'reviews' ? [] : {});
  }
  return r;
}

export async function saveSettings(corps: Record<string, unknown>, env: Env) {
  const s = (corps.settings ?? corps) as Record<string, unknown>;
  await env.DB.prepare(
    'update settings set whatsapp_number = ?1, whatsapp_link = ?2,' +
    ' next_grouping_opening = ?3, next_grouping_date = ?4,' +
    ' wave_number = ?5, wave_link = ?6, orange_money_number = ?7, orange_money_link = ?8,' +
    ' delivery_fees = ?9, announcement = ?10, pricing = ?11, promotions = ?12,' +
    ' alert_thresholds = ?13, reviews = ?14 where id = 1',
  ).bind(
    texte(s.whatsapp_number, 40), texte(s.whatsapp_link, 300),
    texte(s.next_grouping_opening, 40) || null, texte(s.next_grouping_date, 40) || null,
    texte(s.wave_number, 40), texte(s.wave_link, 300),
    texte(s.orange_money_number, 40), texte(s.orange_money_link, 300),
    JSON.stringify(s.delivery_fees ?? {}), texte(s.announcement, 600),
    JSON.stringify(s.pricing ?? {}), JSON.stringify(s.promotions ?? []),
    JSON.stringify(s.alert_thresholds ?? {}), JSON.stringify(s.reviews ?? []),
  ).run();
  return getSettings({}, env);
}

// ── Fréquentation ──────────────────────────────────────────────────────

export async function recordVisit(corps: Record<string, unknown>, env: Env) {
  const visiteur = texte(corps.visitor, 40);
  const chemin = texte(corps.path, 120);
  /* Les bornes du schéma refuseraient la ligne ; on préfère ne rien écrire
     plutôt que renvoyer une erreur à une cliente pour un comptage. */
  if (visiteur.length < 8 || visiteur.length > 40 || !chemin) return { note: false };
  await env.DB
    .prepare('insert into visits (id, visitor, path, created_at) values (?1,?2,?3,?4)')
    .bind(identifiant(), visiteur, chemin, maintenant())
    .run();
  return { note: true };
}

export async function getVisitStats(_corps: Record<string, unknown>, env: Env) {
  const depuis = (jours: number) =>
    new Date(Date.now() - jours * 86400000).toISOString();
  const compter = async (sql: string, ...args: unknown[]) =>
    ((await env.DB.prepare(sql).bind(...args).first<{ n: number }>())?.n ?? 0);

  return {
    visites24h: await compter('select count(*) as n from visits where created_at >= ?1', depuis(1)),
    visites7j: await compter('select count(*) as n from visits where created_at >= ?1', depuis(7)),
    visites30j: await compter('select count(*) as n from visits where created_at >= ?1', depuis(30)),
    visiteurs30j: await compter(
      'select count(distinct visitor) as n from visits where created_at >= ?1', depuis(30)),
    parJour: (await env.DB.prepare(
      "select substr(created_at, 1, 10) as jour, count(*) as visites," +
      ' count(distinct visitor) as visiteurs from visits where created_at >= ?1' +
      ' group by jour order by jour',
    ).bind(depuis(30)).all()).results,
    pages: (await env.DB.prepare(
      'select path, count(*) as visites from visits where created_at >= ?1' +
      ' group by path order by visites desc limit 20',
    ).bind(depuis(30)).all()).results,
  };
}

// ── Alertes ────────────────────────────────────────────────────────────

export async function getAlertSettings(_corps: Record<string, unknown>, env: Env) {
  const ligne = await env.DB.prepare('select * from alert_settings where id = 1').first<Record<string, unknown>>();
  exige(ligne, 'Réglages d\'alerte introuvables.', 500);
  return {
    ...ligne,
    enabled: vrai(ligne!.enabled),
    include_customer: vrai(ligne!.include_customer),
  };
}

export async function saveAlertSettings(corps: Record<string, unknown>, env: Env) {
  const a = (corps.settings ?? corps) as Record<string, unknown>;
  await env.DB.prepare(
    'update alert_settings set telegram_token = ?1, telegram_chat_id = ?2,' +
    ' ntfy_topic = ?3, include_customer = ?4, enabled = ?5, updated_at = ?6 where id = 1',
  ).bind(
    texte(a.telegram_token, 200), texte(a.telegram_chat_id, 80),
    texte(a.ntfy_topic, 120), bit(a.include_customer), bit(a.enabled), maintenant(),
  ).run();
  return getAlertSettings({}, env);
}

/**
 * Envoie une alerte d'essai, pour vérifier que le canal fonctionne.
 *
 * C'est ici que ntfy est appelé : un simple POST. Chez Supabase, c'était
 * un déclencheur de la base passant par une extension, avec ses délais et
 * ses erreurs invisibles. Ici, l'erreur revient et se dit.
 */
export async function testAlert(_corps: Record<string, unknown>, env: Env) {
  const conf = await getAlertSettings({}, env) as Record<string, unknown>;
  const canal = texte(conf.ntfy_topic, 120);
  if (!canal) return { envoye: false, raison: "Aucun canal ntfy n'est réglé." };
  try {
    const r = await fetch('https://ntfy.sh/', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        topic: canal,
        title: 'Afaura Luméa',
        message: "Essai d'alerte : si vous lisez ceci, les notifications fonctionnent.",
      }),
    });
    return { envoye: r.ok, raison: r.ok ? null : `ntfy a répondu ${r.status}.` };
  } catch (e) {
    return { envoye: false, raison: `ntfy est injoignable : ${String(e).slice(0, 120)}` };
  }
}

/**
 * Prévient la boutique qu'une commande est arrivée.
 *
 * Ne fait jamais échouer la commande : une notification perdue est
 * ennuyeuse, une commande perdue est grave.
 */
export async function prevenir(env: Env, titre: string, message: string) {
  try {
    const conf = await env.DB
      .prepare('select ntfy_topic, enabled from alert_settings where id = 1')
      .first<{ ntfy_topic: string; enabled: number }>();
    if (!conf || !vrai(conf.enabled) || !conf.ntfy_topic) return;
    await fetch('https://ntfy.sh/', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ topic: conf.ntfy_topic, title: titre, message }),
    });
  } catch (e) {
    console.error('[alerte]', e);
  }
}
