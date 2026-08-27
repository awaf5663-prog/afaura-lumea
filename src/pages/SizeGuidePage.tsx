import { Info, Ruler } from 'lucide-react';
import { useMemo, useState } from 'react';
import { WhatsAppLink } from '@/src/components/whatsapp/WhatsAppLink';
import { FormRow, Input, Label } from '@/src/components/ui/Field';
import { cn } from '@/src/lib/cn';
import { useSeo } from '@/src/lib/seo';
import {
  HOW_TO_MEASURE,
  SIZE_CHART,
  measurementsMessage,
  suggestFromHeightWeight,
  suggestFromMeasurements,
  type Fit,
  type SizeSuggestion,
} from '@/src/config/sizeGuide';

type Methode = 'mesures' | 'taille-poids';

/** Champ numérique en centimètres/kilos. Vide = non renseigné, jamais 0. */
const nombre = (valeur: string): number | null => {
  const n = Number(valeur.replace(',', '.'));
  return valeur.trim() === '' || !Number.isFinite(n) || n <= 0 ? null : n;
};

export function SizeGuidePage() {
  const [methode, setMethode] = useState<Methode>('mesures');
  const [bust, setBust] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  useSeo({
    title: 'Guide des tailles',
    description:
      'Trouvez votre taille de haut, de pantalon et de robe à partir de vos mesures, ou de votre taille et votre poids.',
  });

  const mesures = {
    bust: nombre(bust),
    waist: nombre(waist),
    hips: nombre(hips),
    height: nombre(height),
    weight: nombre(weight),
  };

  const suggestion: SizeSuggestion | null = useMemo(() => {
    if (methode === 'mesures') {
      if (!mesures.bust && !mesures.waist && !mesures.hips) return null;
      return suggestFromMeasurements(mesures);
    }
    if (!mesures.height || !mesures.weight) return null;
    return suggestFromHeightWeight(mesures.height, mesures.weight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methode, bust, waist, hips, height, weight]);

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">Guide</p>
        <h1 className="mt-2 text-[34px] sm:text-[42px]">Trouver ma taille</h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-graphite">
          Deux façons de faire : avec un mètre ruban, c'est fiable. Sans mètre ruban, votre taille
          et votre poids donnent une première idée.
        </p>

        {/* ── Avertissement, affiché avant tout résultat ──────── */}
        <div className="mt-6 flex items-start gap-2.5 rounded-[--radius-md] bg-blush/60 px-4 py-3.5 text-[12.5px] leading-relaxed text-graphite">
          <Info className="mt-0.5 size-4 shrink-0" />
          <span>
            <strong className="font-medium">À lire avant de commander.</strong> Ce guide suit les
            tailles européennes standard. Les tailles varient d'une marque à l'autre, et beaucoup
            d'un article SHEIN à l'autre : vérifiez toujours le tableau de mesures affiché sur la
            fiche de l'article, et écrivez-nous en cas de doute. Nous ne garantissons pas qu'une
            taille conseillée ici vous ira.
          </span>
        </div>

        {/* ── Choix de la méthode ─────────────────────────────── */}
        <div className="mt-8 flex gap-2">
          {(
            [
              ['mesures', 'Je prends mes mesures'],
              ['taille-poids', 'Taille et poids'],
            ] as Array<[Methode, string]>
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMethode(id)}
              className={cn(
                'press rounded-full px-5 py-2.5 text-[13.5px]',
                methode === id ? 'bg-ink text-ivory' : 'bg-blush/60 text-graphite',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-[--radius-lg] border border-line bg-white p-6">
          {methode === 'mesures' ? (
            <>
              <h2 className="text-[20px]">Vos mesures</h2>
              <p className="mt-1.5 text-[12.5px] text-stone">
                En centimètres, par-dessus des sous-vêtements, sans serrer le mètre.
              </p>
              <div className="mt-5 grid gap-x-4 sm:grid-cols-3">
                <FormRow>
                  <Label htmlFor="g-bust">Tour de poitrine (cm)</Label>
                  <Input id="g-bust" type="number" inputMode="decimal" step="any" min={40}
                    value={bust} onChange={(e) => setBust(e.target.value)} placeholder="92" />
                </FormRow>
                <FormRow>
                  <Label htmlFor="g-waist">Tour de taille (cm)</Label>
                  <Input id="g-waist" type="number" inputMode="decimal" step="any" min={40}
                    value={waist} onChange={(e) => setWaist(e.target.value)} placeholder="74" />
                </FormRow>
                <FormRow>
                  <Label htmlFor="g-hips">Tour de hanches (cm)</Label>
                  <Input id="g-hips" type="number" inputMode="decimal" step="any" min={40}
                    value={hips} onChange={(e) => setHips(e.target.value)} placeholder="100" />
                </FormRow>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-[20px]">Taille et poids</h2>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-stone">
                Sans mètre ruban, on part de votre corpulence. Deux personnes de même taille et
                même poids n'ont pas la même silhouette : le résultat reste une indication.
              </p>
              <div className="mt-5 grid gap-x-4 sm:grid-cols-2">
                <FormRow>
                  <Label htmlFor="g-height" hint="1 m 65 = 165">
                    Votre taille (cm)
                  </Label>
                  <Input id="g-height" type="number" inputMode="decimal" step="any" min={120}
                    value={height} onChange={(e) => setHeight(e.target.value)} placeholder="165" />
                </FormRow>
                <FormRow>
                  <Label htmlFor="g-weight">Votre poids (kg)</Label>
                  <Input id="g-weight" type="number" inputMode="decimal" step="any" min={30}
                    value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="62" />
                </FormRow>
              </div>
            </>
          )}

          {suggestion && (
            <div className="animate-fade mt-6 border-t border-line pt-6">
              <p className="eyebrow">
                {suggestion.confidence === 'measured' ? 'Taille conseillée' : 'Taille estimée'}
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Resultat titre="Haut, chemise, top" fit={suggestion.top} />
                <Resultat titre="Pantalon, jupe" fit={suggestion.bottom} />
                <Resultat titre="Robe, ensemble" fit={suggestion.dress} />
              </div>

              {suggestion.confidence === 'estimated' && suggestion.used.bust && (
                <p className="mt-3 rounded-[--radius-sm] bg-cream/60 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-graphite">
                  Mesures estimées : poitrine ~{suggestion.used.bust} cm, taille ~
                  {suggestion.used.waist} cm, hanches ~{suggestion.used.hips} cm. Si vous les
                  connaissez vraiment, saisissez-les dans « Je prends mes mesures » : le résultat
                  sera juste.
                </p>
              )}

              {suggestion.notes.map((note) => (
                <p key={note} className="mt-3 flex items-start gap-2 text-[12.5px] leading-relaxed text-graphite">
                  <Info className="mt-0.5 size-3.5 shrink-0 text-mauve" />
                  {note}
                </p>
              ))}

              <div className="mt-5">
                <WhatsAppLink
                  message={measurementsMessage({
                    // Taille et poids ne partent que s'ils ont servi au calcul.
                    // Les tours du corps, eux, sont dans `suggestion.used`.
                    ...(methode === 'taille-poids'
                      ? { height: mesures.height, weight: mesures.weight }
                      : {}),
                    suggestion,
                  })}
                >
                  Envoyer mes mesures sur WhatsApp
                </WhatsAppLink>
                <p className="mt-2.5 text-center text-[12px] text-stone">
                  Nous les gardons pour vos prochaines commandes : plus besoin de les redonner.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Comment se mesurer ──────────────────────────────── */}
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-[24px]">
            <Ruler className="size-5 text-mauve" /> Comment se mesurer
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {HOW_TO_MEASURE.map((m) => (
              <div key={m.id} className="rounded-[--radius-md] border border-line bg-white p-4">
                <p className="text-[14.5px] font-medium">{m.label}</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-stone">{m.hint}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12.5px] leading-relaxed text-stone">
            Pas de mètre ruban ? Un fil ou une bande de tissu fait l'affaire : entourez, marquez au
            stylo, puis mesurez le fil contre une règle.
          </p>
        </section>

        {/* ── Le tableau complet ──────────────────────────────── */}
        <section className="mt-10">
          <h2 className="text-[24px]">Tableau des tailles</h2>
          <p className="mt-1.5 text-[12.5px] text-stone">Mesures du corps, en centimètres.</p>
          <div className="mt-4 overflow-x-auto rounded-[--radius-md] border border-line bg-white">
            <table className="w-full min-w-[520px] border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-line bg-cream/50 text-left">
                  <th className="px-4 py-3 font-medium">Taille</th>
                  <th className="px-4 py-3 font-medium">FR</th>
                  <th className="px-4 py-3 font-medium">Poitrine</th>
                  <th className="px-4 py-3 font-medium">Taille</th>
                  <th className="px-4 py-3 font-medium">Hanches</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_CHART.map((row) => (
                  <tr key={row.label} className="border-b border-line last:border-0">
                    <td className="px-4 py-3 font-medium">{row.label}</td>
                    <td className="px-4 py-3 text-stone">{row.fr}</td>
                    <td className="px-4 py-3 text-stone">{row.bust[0]}–{row.bust[1]}</td>
                    <td className="px-4 py-3 text-stone">{row.waist[0]}–{row.waist[1]}</td>
                    <td className="px-4 py-3 text-stone">{row.hips[0]}–{row.hips[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[12px] leading-relaxed text-stone">
            Entre deux tailles, prenez la plus grande : un vêtement un peu large se reprend, un
            vêtement trop juste ne se porte pas.
          </p>
        </section>
      </div>
    </div>
  );
}

/**
 * Deux tailles par vêtement plutôt qu'une.
 *
 * La même personne prend M pour une chemise près du corps et L pour la porter
 * fluide : afficher une seule taille obligerait à deviner laquelle. On donne
 * les deux, et la cliente choisit comment elle veut le porter.
 */
function Resultat({ titre, fit }: { titre: string; fit: Fit }) {
  return (
    <div className="rounded-[--radius-md] border border-line bg-cream/40 p-4 text-center">
      <p className="text-[12px] text-stone">{titre}</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[24px] leading-none">{fit.fitted ? fit.fitted.label : '—'}</p>
          <p className="mt-1 text-[11.5px] text-stone">
            {fit.fitted ? `près du corps · FR ${fit.fitted.fr}` : 'à préciser'}
          </p>
        </div>
        <div className="border-l border-line">
          <p className="text-[24px] leading-none">{fit.loose ? fit.loose.label : '—'}</p>
          <p className="mt-1 text-[11.5px] text-stone">
            {fit.loose ? `ample · FR ${fit.loose.fr}` : 'à préciser'}
          </p>
        </div>
      </div>
    </div>
  );
}
