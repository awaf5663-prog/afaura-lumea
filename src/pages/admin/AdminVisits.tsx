import { BarChart3, Info } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/src/lib/cn';
import { db, isSupabaseConfigured } from '@/src/services';
import type { VisitPeriod, VisitStats } from '@/src/services';

/**
 * ADMINISTRATION → VISITES
 *
 * Combien de personnes sont passées sur le site, par jour, semaine, mois et
 * année. Les chiffres sont calculés dans la base de la boutique : aucun
 * service extérieur, aucune donnée personnelle, aucun cookie de pistage.
 *
 * Ce que ces chiffres SONT : le nombre de pages ouvertes, et le nombre de
 * navigateurs différents derrière. Ce qu'ils NE SONT PAS : un décompte exact
 * de personnes. La page le dit à la boutique plutôt que de la laisser croire
 * à une précision qui n'existe pas.
 */

/** Intitulés lisibles des pages du site. */
const NOMS: Record<string, string> = {
  '/': 'Accueil',
  '/boutique': 'Boutique',
  '/panier': 'Panier',
  '/commander': 'Commander',
  '/shein': 'Groupage SHEIN',
  '/shein/demande': 'Demande SHEIN',
  '/comment-ca-marche': 'Comment ça marche',
  '/suivi': 'Suivi de commande',
  '/faq': 'Questions fréquentes',
  '/guide-des-tailles': 'Guide des tailles',
};

function nommer(path: string): string {
  if (NOMS[path]) return NOMS[path];
  if (path.startsWith('/produit/')) return `Fiche produit · ${path.slice(9)}`;
  if (path.startsWith('/confirmation/')) return 'Confirmation de commande';
  if (path.startsWith('/shein/confirmation/')) return 'Confirmation SHEIN';
  return path;
}

/** « 2026-08-27 » → « 27 août ». */
function jourCourt(date: string): string {
  const d = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function jourLong(date: string): string {
  const d = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

const PLOT = 148; // hauteur des barres
const AXIS = 24; // bande des dates, comprise dans la carte

export function AdminVisits({ refreshToken = 0 }: { refreshToken?: number }) {
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tableau, setTableau] = useState(false);
  const [survol, setSurvol] = useState<number | null>(null);
  const plotRef = useRef<HTMLDivElement>(null);

  const charger = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStats(await db.getVisitStats());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void charger();
    // `refreshToken` change quand la boutique appuie sur « Actualiser » en
    // haut de l'écran : un seul bouton pour toute la page.
  }, [charger, refreshToken]);

  const jours = stats?.parJour ?? [];
  const max = useMemo(() => Math.max(1, ...jours.map((j) => j.visiteurs)), [jours]);
  // Le jour le plus fréquenté : c'est la seule barre qu'on étiquette
  // directement. Un chiffre au-dessus de chacune des trente serait illisible.
  const sommet = useMemo(() => {
    let index = -1;
    jours.forEach((j, i) => {
      if (j.visiteurs > 0 && (index === -1 || j.visiteurs > jours[index].visiteurs)) index = i;
    });
    return index;
  }, [jours]);

  const pointe = (event: React.PointerEvent<HTMLDivElement>) => {
    const zone = plotRef.current;
    if (!zone || !jours.length) return;
    const { left, width } = zone.getBoundingClientRect();
    const ratio = (event.clientX - left) / width;
    const index = Math.floor(ratio * jours.length);
    setSurvol(Math.min(jours.length - 1, Math.max(0, index)));
  };

  const lu = survol !== null ? jours[survol] : sommet >= 0 ? jours[sommet] : null;

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-[20px]">Visites du site</h2>
        <p className="mt-1 text-[13px] text-stone">
          Comptées dans votre propre base, sans service extérieur.
        </p>
      </header>

      {error && (
        <div className="rounded-[--radius-md] border border-line bg-blush/60 px-4 py-3 text-[13px] leading-relaxed text-graphite">
          {error}
        </div>
      )}

      {loading && !stats && <p className="text-[13px] text-stone">Chargement…</p>}

      {stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Tuile label="Aujourd'hui" periode={stats.jour} />
            <Tuile label="7 derniers jours" periode={stats.semaine} />
            <Tuile label="30 derniers jours" periode={stats.mois} />
            <Tuile label="12 derniers mois" periode={stats.annee} />
          </div>

          <section className="rounded-[--radius-lg] border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="eyebrow">Visiteurs par jour</p>
                <p className="mt-1 text-[13px] text-stone">30 derniers jours</p>
              </div>
              <button
                type="button"
                onClick={() => setTableau((v) => !v)}
                className="press rounded-full bg-cream px-3.5 py-2 text-[12.5px] text-graphite"
              >
                {tableau ? 'Voir le graphique' : 'Voir les chiffres'}
              </button>
            </div>

            {stats.mois.visites === 0 ? (
              <p className="mt-5 text-[13.5px] text-stone">
                Aucune visite enregistrée sur les 30 derniers jours. Le comptage démarre à la
                prochaine mise en ligne du site : les passages antérieurs n'ont pas été gardés.
              </p>
            ) : tableau ? (
              <Tableau jours={jours} />
            ) : (
              <>
                {/* La lecture du jour survolé : un chiffre lisible au-dessus du
                    graphique, plutôt qu'une bulle qui déborde de l'écran d'un
                    téléphone. À défaut de survol, elle montre le jour le plus
                    fréquenté. */}
                <p className="mt-4 min-h-[36px] text-[13px] text-graphite">
                  {lu && (
                    <>
                      {survol === null && (
                        <span className="text-stone">Jour le plus fréquenté · </span>
                      )}
                      <span className="first-letter:uppercase">{jourLong(lu.date)}</span> ·{' '}
                      <strong className="font-medium">{lu.visiteurs}</strong> visiteur
                      {lu.visiteurs > 1 ? 's' : ''} · {lu.visites} page
                      {lu.visites > 1 ? 's' : ''} vue{lu.visites > 1 ? 's' : ''}
                    </>
                  )}
                </p>

                <div
                  className="mt-2 max-w-[560px]"
                  data-graphique
                  style={{ height: PLOT + AXIS }}
                >
                  <div ref={plotRef} className="relative" style={{ height: PLOT }}>
                    {/* Repères : deux filets pleins, un cran plus clairs que la carte. */}
                    <div className="absolute inset-x-0 top-0 border-t border-line" />
                    <div className="absolute inset-x-0 top-1/2 border-t border-line" />
                    <div className="absolute inset-x-0 bottom-0 border-t border-line" />
                    <div className="absolute inset-0 flex items-end gap-[2px]">
                      {jours.map((j, i) => (
                        <div
                          key={j.date}
                          data-jour={j.date}
                          className="relative flex h-full flex-1 items-end"
                        >
                          {survol === i && (
                            <span className="absolute inset-x-[-1px] inset-y-0 rounded-[3px] bg-blush" />
                          )}
                          <span
                            data-barre
                            className="relative w-full rounded-t-[4px]"
                            style={{
                              height: `${(j.visiteurs / max) * 100}%`,
                              backgroundColor: 'var(--color-chart)',
                            }}
                          />
                          {i === sommet && j.visiteurs > 0 && (
                            <span
                              className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-[11px] text-graphite tabular-nums"
                              style={{ bottom: `calc(${(j.visiteurs / max) * 100}% + 3px)` }}
                            >
                              {j.visiteurs}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Zone de survol unique : le doigt n'a pas à viser une
                        barre de neuf pixels, le jour le plus proche répond. */}
                    <div
                      className="absolute inset-0"
                      // Souris : la lecture suit le curseur et s'efface en
                      // sortant. Doigt : elle répond à l'appui et reste
                      // affichée — sur un téléphone, le doigt part aussitôt,
                      // et un chiffre qui disparaît ne se lit pas. Le
                      // glissement tactile est laissé au défilement.
                      onPointerMove={(e) => {
                        if (e.pointerType === 'mouse') pointe(e);
                      }}
                      onPointerDown={pointe}
                      onPointerLeave={(e) => {
                        if (e.pointerType === 'mouse') setSurvol(null);
                      }}
                    />
                  </div>

                  <div
                    className="flex items-center justify-between text-[11px] text-stone"
                    style={{ height: AXIS }}
                  >
                    <span>{jours.length ? jourCourt(jours[0].date) : ''}</span>
                    <span>
                      {jours.length ? jourCourt(jours[Math.floor(jours.length / 2)].date) : ''}
                    </span>
                    <span>{jours.length ? jourCourt(jours[jours.length - 1].date) : ''}</span>
                  </div>
                </div>
              </>
            )}
          </section>

          {stats.pages.length > 0 && (
            <section className="rounded-[--radius-lg] border border-line bg-white p-5">
              <p className="eyebrow">Pages les plus vues</p>
              <p className="mt-1 text-[13px] text-stone">30 derniers jours</p>
              <ul className="mt-4 space-y-3">
                {stats.pages.map((p) => (
                  <li key={p.path}>
                    <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
                      <span className="truncate text-graphite">{nommer(p.path)}</span>
                      <span className="shrink-0 text-stone tabular-nums">{p.visites}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-cream">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(p.visites / stats.pages[0].visites) * 100}%`,
                          backgroundColor: 'var(--color-chart)',
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="flex items-start gap-2.5 rounded-[--radius-md] bg-cream px-4 py-3 text-[12.5px] leading-relaxed text-graphite">
            <Info className="mt-0.5 size-4 shrink-0" />
            <span>
              <strong className="font-medium">À lire une fois.</strong> Ces chiffres comptent des
              navigateurs, pas des personnes : la même cliente sur son téléphone puis sur un
              ordinateur compte deux fois, et si elle efface les données de son navigateur elle est
              recomptée comme nouvelle. Les robots des moteurs de recherche passent aussi et
              gonflent un peu le total. Vos propres passages dans l'administration ne sont pas
              comptés. Enfin, rien n'est enregistré sur la personne : ni nom, ni téléphone, ni
              adresse IP — un numéro tiré au hasard, la page, l'heure.
              {!isSupabaseConfigured() && (
                <>
                  {' '}
                  <strong className="font-medium">
                    En mode local, seules vos propres visites sur cet appareil sont comptées.
                  </strong>
                </>
              )}
            </span>
          </div>

          <p className="flex items-center gap-2 text-[12.5px] text-stone">
            <BarChart3 className="size-4 shrink-0" />
            Depuis l'installation : {stats.total.visiteurs} visiteur
            {stats.total.visiteurs > 1 ? 's' : ''} · {stats.total.visites} page
            {stats.total.visites > 1 ? 's' : ''} vue{stats.total.visites > 1 ? 's' : ''}.
          </p>
        </>
      )}
    </div>
  );
}

function Tuile({ label, periode }: { label: string; periode: VisitPeriod }) {
  return (
    <div className="rounded-[--radius-lg] border border-line bg-white p-5">
      <p className="eyebrow">{label}</p>
      <p className="mt-2 text-[28px] leading-none">{periode.visiteurs}</p>
      <p className="mt-2 text-[12.5px] text-stone">
        visiteur{periode.visiteurs > 1 ? 's' : ''} · {periode.visites} page
        {periode.visites > 1 ? 's' : ''} vue{periode.visites > 1 ? 's' : ''}
      </p>
    </div>
  );
}

/** Les mêmes valeurs, lisibles sans le graphique. */
function Tableau({ jours }: { jours: VisitStats['parJour'] }) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-line text-left text-stone">
            <th className="py-2 font-normal">Jour</th>
            <th className="py-2 text-right font-normal">Visiteurs</th>
            <th className="py-2 text-right font-normal">Pages vues</th>
          </tr>
        </thead>
        <tbody>
          {[...jours].reverse().map((j) => (
            <tr key={j.date} className={cn('border-b border-line/60', j.visites === 0 && 'text-stone')}>
              <td className="py-2 first-letter:uppercase">{jourLong(j.date)}</td>
              <td className="py-2 text-right tabular-nums">{j.visiteurs}</td>
              <td className="py-2 text-right tabular-nums">{j.visites}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
