import { AlertTriangle, Calculator, Info, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/src/components/ui/Button';
import { Input, Label, Select } from '@/src/components/ui/Field';
import { useSettings } from '@/src/hooks/useSettings';
import { formatFcfa } from '@/src/lib/format';
import { uid } from '@/src/lib/orderNumber';
import {
  coutSeule,
  repartir,
  type CommandeShein,
  type LigneCliente,
  type MethodeRepartition,
} from '@/src/lib/pricing/repartition';
import { STORAGE_KEYS, readJson, writeJson } from '@/src/lib/storage';
import type { Grouping } from '@/src/types';

/**
 * RÉPARTITION D'UN COLIS GROUPÉ — outil d'administration.
 *
 * Le transport SHEIN se paie par colis. Facturé à une seule cliente il coûte
 * plus cher que les articles ; partagé entre toutes les clientes du groupage,
 * il devient supportable. Cet écran fait ce partage à partir des chiffres
 * recopiés de l'écran « PAYER » de SHEIN — le seul endroit où le transport
 * apparaît.
 *
 * STRICTEMENT ADMINISTRATIF : bénéfice, marge et coûts ne sortent jamais d'ici.
 */

interface Brouillon {
  devise: string;
  taux: string;
  commande: { articles: string; promotions: string; livraison: string; garantie: string };
  methode: MethodeRepartition;
  marge: string;
  lignes: Array<{ id: string; nom: string; valeur: string; articles: string }>;
}

const VIDE: Brouillon = {
  devise: 'USD',
  taux: '',
  commande: { articles: '', promotions: '', livraison: '', garantie: '' },
  methode: 'valeur',
  marge: '0',
  lignes: [{ id: 'l1', nom: '', valeur: '', articles: '1' }],
};

/** Champ numérique : vide ou illisible = 0, jamais NaN dans un montant. */
const nombre = (valeur: string): number => {
  const n = Number(String(valeur).replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export function RepartitionColis({
  groupings,
  onSaveCost,
}: {
  groupings: Grouping[];
  /** Enregistre le coût du colis sur un groupage, pour les indicateurs. */
  onSaveCost?: (groupingId: string, cost: number) => void | Promise<void>;
}) {
  const { settings } = useSettings();
  const [b, setB] = useState<Brouillon>(() => readJson<Brouillon>(STORAGE_KEYS.repartition, VIDE));
  const [groupageId, setGroupageId] = useState('');

  // La saisie survit à un changement d'onglet et à la fermeture du navigateur :
  // un colis se remplit rarement d'un seul coup.
  useEffect(() => {
    writeJson(STORAGE_KEYS.repartition, b);
  }, [b]);

  const tauxConfigure = settings?.pricing?.conversionRates?.[b.devise] ?? null;
  const taux = b.taux.trim() === '' ? (tauxConfigure ?? 0) : nombre(b.taux);

  const commande: CommandeShein = {
    articles: nombre(b.commande.articles),
    promotions: nombre(b.commande.promotions),
    livraison: nombre(b.commande.livraison),
    garantie: nombre(b.commande.garantie),
  };

  const lignes: LigneCliente[] = b.lignes.map((l) => ({
    id: l.id,
    nom: l.nom.trim() || 'Sans nom',
    valeur: nombre(l.valeur),
    articles: Math.max(0, Math.round(nombre(l.articles))),
  }));

  const resultat = useMemo(
    () =>
      repartir({
        commande,
        lignes,
        taux,
        methode: b.methode,
        tiers: settings?.pricing?.tiers ?? [],
        marge: nombre(b.marge),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(b), taux, JSON.stringify(settings?.pricing?.tiers)],
  );

  const set = (patch: Partial<Brouillon>) => setB((prev) => ({ ...prev, ...patch }));
  const setCommande = (patch: Partial<Brouillon['commande']>) =>
    setB((prev) => ({ ...prev, commande: { ...prev.commande, ...patch } }));
  const setLigne = (index: number, patch: Partial<Brouillon['lignes'][number]>) =>
    setB((prev) => ({
      ...prev,
      lignes: prev.lignes.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    }));

  const devise = b.devise === 'EUR' ? '€' : b.devise === 'USD' ? '$' : b.devise;
  const montantDevise = (n: number) =>
    `${n.toFixed(2).replace('.', ',')} ${devise}`;

  const seule = coutSeule(commande, taux);
  const tauxManquant = taux <= 0;

  return (
    <section className="rounded-[--radius-lg] border border-line bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-[18px]">
            <Calculator className="size-4 text-mauve" strokeWidth={1.8} /> Répartition d'un colis
            groupé
          </h3>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-stone">
            Recopiez les quatre lignes de l'écran « PAYER » de SHEIN, puis ce que chaque cliente a
            commandé. Le transport se paie par colis : il se partage entre elles.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setB({ ...VIDE, devise: b.devise, taux: b.taux, lignes: [{ id: uid(), nom: '', valeur: '', articles: '1' }] })}
          className="press shrink-0 rounded-full border border-line px-3.5 py-1.5 text-[12px] text-stone"
        >
          Vider
        </button>
      </div>

      {/* ── L'écran de paiement SHEIN ─────────────────────────── */}
      <h4 className="mt-5 text-[13px] font-medium">1. La commande SHEIN</h4>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-[11.5px] text-stone">
          Prix des articles ({devise})
          <Input
            className="mt-1"
            type="number"
            inputMode="decimal"
            step="any"
            min={0}
            placeholder="9.30"
            value={b.commande.articles}
            id="rep-articles"
            onChange={(e) => setCommande({ articles: e.target.value })}
          />
        </label>
        <label className="text-[11.5px] text-stone">
          Promotions ({devise})
          <Input
            className="mt-1"
            type="number"
            inputMode="decimal"
            step="any"
            min={0}
            placeholder="1.60"
            value={b.commande.promotions}
            id="rep-promotions"
            onChange={(e) => setCommande({ promotions: e.target.value })}
          />
        </label>
        <label className="text-[11.5px] text-stone">
          Livraison SHEIN ({devise})
          <Input
            className="mt-1"
            type="number"
            inputMode="decimal"
            step="any"
            min={0}
            placeholder="29.90"
            value={b.commande.livraison}
            id="rep-livraison"
            onChange={(e) => setCommande({ livraison: e.target.value })}
          />
        </label>
        <label className="text-[11.5px] text-stone">
          Garantie livraison ({devise})
          <Input
            className="mt-1"
            type="number"
            inputMode="decimal"
            step="any"
            min={0}
            placeholder="0.99"
            value={b.commande.garantie}
            id="rep-garantie"
            onChange={(e) => setCommande({ garantie: e.target.value })}
          />
        </label>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <label className="text-[11.5px] text-stone">
          Devise
          <Select className="mt-1" value={b.devise} onChange={(e) => set({ devise: e.target.value })}>
            <option value="USD">Dollar ($)</option>
            <option value="EUR">Euro (€)</option>
          </Select>
        </label>
        <label className="text-[11.5px] text-stone">
          Taux (FCFA pour 1 {devise})
          <Input
            id="rep-taux"
            className="mt-1"
            type="number"
            inputMode="decimal"
            step="any"
            min={0}
            placeholder={tauxConfigure ? String(tauxConfigure) : 'à saisir'}
            value={b.taux}
            onChange={(e) => set({ taux: e.target.value })}
          />
        </label>
        <label className="text-[11.5px] text-stone">
          Marge de sécurité sur le transport (%)
          <Input
            className="mt-1"
            type="number"
            inputMode="decimal"
            step="any"
            min={0}
            id="rep-marge"
            value={b.marge}
            onChange={(e) => set({ marge: e.target.value })}
          />
        </label>
      </div>

      {tauxManquant ? (
        <p className="mt-3 flex gap-2 rounded-[--radius-sm] bg-[#f6e9e9] px-3.5 py-2.5 text-[12px] leading-relaxed text-[#8a2f2f]">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          Sans taux, seuls les frais de traitement s'affichent : les articles et le transport ne
          sont pas convertis. Saisissez le taux ici, ou une fois pour toutes dans Tarification →
          Conversion vers le FCFA.
        </p>
      ) : (
        <p className="mt-3 flex gap-2 rounded-[--radius-sm] bg-cream/70 px-3.5 py-2.5 text-[12px] leading-relaxed text-graphite">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          Total payé à SHEIN : <strong>{montantDevise(resultat.totalDevise)}</strong> ={' '}
          <strong>{formatFcfa(resultat.totalFcfa)}</strong>. Dont transport{' '}
          {montantDevise(resultat.transport)}
          {resultat.totalDevise > 0 &&
            ` — ${Math.round((resultat.transport / resultat.totalDevise) * 100)} % du colis`}
          .
        </p>
      )}

      {/* ── Les clientes ──────────────────────────────────────── */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <h4 className="text-[13px] font-medium">2. Les clientes du colis</h4>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() =>
            set({ lignes: [...b.lignes, { id: uid(), nom: '', valeur: '', articles: '1' }] })
          }
        >
          <Plus className="size-4" /> Cliente
        </Button>
      </div>

      <ul className="mt-3 space-y-2.5">
        {b.lignes.map((ligne, index) => (
          <li key={ligne.id} className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[2fr_1fr_1fr_auto]">
            <label className="col-span-2 text-[11.5px] text-stone sm:col-span-1">
              Nom
              <Input
                className="mt-1"
                aria-label={`Nom de la cliente ${index + 1}`}
                value={ligne.nom}
                placeholder="Aïcha"
                onChange={(e) => setLigne(index, { nom: e.target.value })}
              />
            </label>
            <label className="text-[11.5px] text-stone">
              Ses articles ({devise})
              <Input
                className="mt-1"
                type="number"
                inputMode="decimal"
                step="any"
                min={0}
                aria-label={`Valeur des articles de la cliente ${index + 1}`}
                value={ligne.valeur}
                onChange={(e) => setLigne(index, { valeur: e.target.value })}
              />
            </label>
            <label className="text-[11.5px] text-stone">
              Nombre
              <Input
                className="mt-1"
                type="number"
                inputMode="numeric"
                min={0}
                aria-label={`Nombre d'articles de la cliente ${index + 1}`}
                value={ligne.articles}
                onChange={(e) => setLigne(index, { articles: e.target.value })}
              />
            </label>
            <button
              type="button"
              aria-label={`Retirer la ligne ${index + 1}`}
              onClick={() => set({ lignes: b.lignes.filter((_, i) => i !== index) })}
              className="press mb-1 col-span-2 grid size-10 justify-self-end place-items-center rounded-full bg-cream text-[#8a2f2f] sm:col-span-1"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>

      <label className="mt-4 block text-[11.5px] text-stone sm:max-w-xs">
        Partager le transport
        <Select
          className="mt-1"
          aria-label="Méthode de partage du transport"
          value={b.methode}
          onChange={(e) => set({ methode: e.target.value as MethodeRepartition })}
        >
          <option value="valeur">Au prorata de la valeur des articles</option>
          <option value="articles">Au prorata du nombre d'articles</option>
        </Select>
      </label>

      {Math.abs(resultat.ecart) > 0.009 && (
        <p className="mt-3 flex gap-2 rounded-[--radius-sm] bg-[#f6e9e9] px-3.5 py-2.5 text-[12px] leading-relaxed text-[#8a2f2f]">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          {resultat.ecart > 0 ? (
            <span>
              <strong>{montantDevise(resultat.ecart)}</strong> d'articles ne sont attribués à
              personne. Si ce sont vos propres articles, ajoutez-vous comme une ligne : sinon leur
              part de transport sort de votre poche.
            </span>
          ) : (
            <span>
              Les lignes annoncent <strong>{montantDevise(-resultat.ecart)}</strong> de plus que la
              commande SHEIN. Vérifiez les montants saisis.
            </span>
          )}
        </p>
      )}

      {/* ── Le résultat ───────────────────────────────────────── */}
      <h4 className="mt-6 text-[13px] font-medium">3. À réclamer à chacune</h4>
      <div className="mt-3 overflow-x-auto rounded-[--radius-md] border border-line">
        <table className="w-full min-w-[520px] border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-line bg-cream/50 text-left">
              <th className="px-3 py-2.5 font-medium">Cliente</th>
              <th className="px-3 py-2.5 text-right font-medium">Articles</th>
              <th className="px-3 py-2.5 text-right font-medium">Transport</th>
              <th className="px-3 py-2.5 text-right font-medium">Frais</th>
              <th className="px-3 py-2.5 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {resultat.parts.map((part) => (
              <tr key={part.id} className="border-b border-line last:border-0">
                <td className="px-3 py-2.5">
                  {part.nom}
                  <span className="ml-1.5 text-[11.5px] text-stone">
                    {part.articles} art.
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">{formatFcfa(part.articlesFcfa)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{formatFcfa(part.transportFcfa)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{formatFcfa(part.fraisFcfa)}</td>
                <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                  {formatFcfa(part.totalFcfa)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Chiffre label="Encaissé auprès des clientes" valeur={formatFcfa(resultat.encaisse)} />
        <Chiffre label="Payé à SHEIN" valeur={formatFcfa(resultat.totalFcfa)} />
        <Chiffre
          label="Bénéfice"
          valeur={formatFcfa(resultat.benefice)}
          alerte={resultat.benefice <= 0 && resultat.totalFcfa > 0}
        />
      </div>

      {resultat.benefice <= 0 && resultat.totalFcfa > 0 && (
        <p className="mt-3 flex gap-2 rounded-[--radius-sm] bg-[#f6e9e9] px-3.5 py-2.5 text-[12px] leading-relaxed text-[#8a2f2f]">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          Ce colis ne rapporte rien : vous paieriez la différence. Vérifiez que toutes les clientes
          sont saisies, ou attendez d'en avoir davantage avant de commander.
        </p>
      )}

      {resultat.parts.length === 1 && seule > 0 && (
        <p className="mt-3 flex gap-2 rounded-[--radius-sm] bg-cream/70 px-3.5 py-2.5 text-[12px] leading-relaxed text-graphite">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          Une seule cliente porte tout le transport : {formatFcfa(seule)} rien que pour couvrir
          SHEIN. À plusieurs, cette somme se divise — c'est tout l'intérêt du groupage.
        </p>
      )}

      {/* ── Report sur le groupage ────────────────────────────── */}
      {onSaveCost && groupings.length > 0 && resultat.totalFcfa > 0 && (
        <div className="mt-5 flex flex-wrap items-end gap-3 border-t border-line pt-4">
          <label className="text-[11.5px] text-stone">
            <Label htmlFor="rep-groupage">Enregistrer ce coût sur un groupage</Label>
            <Select
              id="rep-groupage"
              value={groupageId}
              onChange={(e) => setGroupageId(e.target.value)}
            >
              <option value="">Choisir un groupage…</option>
              {groupings.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.reference} — {g.destination}
                </option>
              ))}
            </Select>
          </label>
          <Button
            type="button"
            variant="secondary"
            disabled={!groupageId}
            onClick={() => void onSaveCost(groupageId, resultat.totalFcfa)}
          >
            Enregistrer {formatFcfa(resultat.totalFcfa)}
          </Button>
        </div>
      )}
    </section>
  );
}

function Chiffre({
  label,
  valeur,
  alerte,
}: {
  label: string;
  valeur: string;
  alerte?: boolean;
}) {
  return (
    <div
      className={
        alerte
          ? 'rounded-[--radius-md] border border-[#e0bcbc] bg-[#f6e9e9] p-3.5'
          : 'rounded-[--radius-md] border border-line bg-cream/40 p-3.5'
      }
    >
      <p className="text-[11.5px] text-stone">{label}</p>
      <p className={alerte ? 'mt-1 text-[19px] tabular-nums text-[#8a2f2f]' : 'mt-1 text-[19px] tabular-nums'}>
        {valeur}
      </p>
    </div>
  );
}
