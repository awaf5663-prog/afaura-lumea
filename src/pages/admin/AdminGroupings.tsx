import { AlertTriangle, ArrowRightLeft, MessageCircle, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { FormRow, Input, Label, Select, Textarea } from '@/src/components/ui/Field';
import { Sheet } from '@/src/components/ui/Sheet';
import { DEFAULT_GROUPING } from '@/src/config/pricing';
import { groupingCount, groupingFillRate } from '@/src/hooks/useGroupings';
import { useToast } from '@/src/hooks/useToast';
import { cn } from '@/src/lib/cn';
import { formatDate, formatFcfa, prettyPhone } from '@/src/lib/format';
import { uid } from '@/src/lib/orderNumber';
import { isWhatsappConfigured, whatsappLink } from '@/src/lib/whatsapp';
import { db } from '@/src/services';
import type { AlertThresholds, Grouping, GroupingStatus, SheinRequest } from '@/src/types';

const STATUS_LABEL: Record<GroupingStatus, string> = {
  open: 'Ouvert',
  full: 'Complet',
  closed: 'Clôturé',
  in_transit: 'En acheminement',
  arrived: 'Arrivé',
  delivered: 'Livré',
  postponed: 'Reporté',
  cancelled: 'Annulé',
};

/** Indicateurs de pilotage d'un groupage. Strictement administratif. */
export interface GroupingStats {
  count: number;
  siteOrders: number;
  serviceRevenue: number;
  /** Commandes dont les frais ne sont pas encore chiffrés (devis manuel, hors site). */
  unpricedOrders: number;
  logisticsCost: number | null;
  margin: number | null;
  marginPerOrder: number | null;
  /** Commandes nécessaires pour couvrir le coût logistique. */
  breakEven: number | null;
  breakEvenReference: number | null;
}

export function computeGroupingStats(grouping: Grouping, requests: SheinRequest[], fallbackFee: number | null): GroupingStats {
  const attached = requests.filter(
    (r) => r.groupingId === grouping.id && r.status !== 'cancelled',
  );
  const knownFees = attached
    .map((r) => r.quote?.serviceFee)
    .filter((fee): fee is number => typeof fee === 'number');

  const serviceRevenue = knownFees.reduce((sum, fee) => sum + fee, 0);
  const unpricedOrders = attached.length - knownFees.length + grouping.manualOrderCount;
  const count = groupingCount(grouping);

  const logisticsCost = grouping.logisticsCost;
  const margin = logisticsCost === null ? null : serviceRevenue - logisticsCost;

  const reference =
    knownFees.length > 0 ? Math.round(serviceRevenue / knownFees.length) : fallbackFee;
  const breakEven =
    logisticsCost === null || reference === null || reference <= 0
      ? null
      : Math.ceil(logisticsCost / reference);

  return {
    count,
    siteOrders: attached.length,
    serviceRevenue,
    unpricedOrders,
    logisticsCost,
    margin,
    marginPerOrder: margin === null || count === 0 ? null : Math.round(margin / count),
    breakEven,
    breakEvenReference: reference,
  };
}

const blank = (existing: Grouping[]): Grouping => {
  const next = String(existing.length + 1).padStart(3, '0');
  return {
    id: uid(),
    reference: `GROUPAGE-${next}`,
    destination: DEFAULT_GROUPING.destination,
    closingDate: '',
    maxOrders: DEFAULT_GROUPING.maxOrders,
    minOrders: DEFAULT_GROUPING.minOrders,
    reservedCount: 0,
    manualOrderCount: 0,
    logisticsCost: DEFAULT_GROUPING.logisticsCost,
    status: 'open',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

const toLocalInput = (iso: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export function AdminGroupings({
  groupings,
  requests,
  thresholds,
  fallbackFee,
  whatsappConfigured,
  reload,
}: {
  groupings: Grouping[];
  requests: SheinRequest[];
  thresholds: AlertThresholds;
  fallbackFee: number | null;
  whatsappConfigured: boolean;
  reload: () => Promise<void>;
}) {
  const { notify } = useToast();
  const [editing, setEditing] = useState<Grouping | null>(null);
  const [saving, setSaving] = useState(false);
  const [notifying, setNotifying] = useState<Grouping | null>(null);

  const alerts = useMemo(
    () =>
      groupings
        .filter((g) => g.status === 'open' || g.status === 'full')
        .map((g) => ({ grouping: g, rate: groupingFillRate(g) }))
        .filter((a) => a.rate >= thresholds.warning)
        .sort((a, b) => b.rate - a.rate),
    [groupings, thresholds],
  );

  const save = async (grouping: Grouping) => {
    setSaving(true);
    try {
      await db.saveGrouping(grouping);
      await reload();
      setEditing(null);
      notify('Groupage enregistré');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Enregistrement impossible.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (grouping: Grouping) => {
    if (!window.confirm(`Supprimer ${grouping.reference} ? Les demandes rattachées sont conservées.`))
      return;
    await db.deleteGrouping(grouping.id);
    await reload();
    notify('Groupage supprimé');
  };

  const transfer = async (from: Grouping) => {
    const targets = groupings.filter((g) => g.id !== from.id && g.status === 'open');
    if (targets.length === 0) {
      notify("Créez d'abord un autre groupage ouvert.", 'error');
      return;
    }
    const target = targets[0];
    if (
      !window.confirm(
        `Transférer les demandes de ${from.reference} vers ${target.reference} ? Pensez ensuite à prévenir les clientes.`,
      )
    )
      return;
    const moved = await db.transferRequests(from.id, target.id);
    await reload();
    notify(`${moved} demande${moved > 1 ? 's' : ''} transférée${moved > 1 ? 's' : ''}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[24px]">Groupages ({groupings.length})</h2>
        <Button size="sm" onClick={() => setEditing(blank(groupings))}>
          <Plus className="size-4" /> Nouveau
        </Button>
      </div>

      {alerts.length > 0 && (
        <ul className="mt-5 space-y-2">
          {alerts.map(({ grouping, rate }) => (
            <li
              key={grouping.id}
              className={cn(
                'flex items-start gap-2.5 rounded-[--radius-md] px-4 py-3 text-[13px]',
                rate >= 100 ? 'bg-blush text-mauve' : 'bg-cream text-graphite',
              )}
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>
                <strong className="font-medium">{grouping.reference}</strong> —{' '}
                {rate >= 100
                  ? 'Groupage complet.'
                  : rate >= thresholds.almostFull
                    ? 'Le groupage est presque complet.'
                    : 'Le groupage commence à se remplir.'}{' '}
                {groupingCount(grouping)}/{grouping.maxOrders} ({rate} %)
              </span>
            </li>
          ))}
        </ul>
      )}

      {groupings.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Aucun groupage"
            description="Créez le premier départ : capacité, seuil minimum, coût logistique et date de clôture. Le compteur apparaîtra alors sur la page SHEIN."
            action={<Button onClick={() => setEditing(blank(groupings))}>Créer un groupage</Button>}
          />
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {groupings.map((grouping) => (
            <GroupingCard
              key={grouping.id}
              grouping={grouping}
              stats={computeGroupingStats(grouping, requests, fallbackFee)}
              onEdit={() => setEditing({ ...grouping })}
              onDelete={() => void remove(grouping)}
              onTransfer={() => void transfer(grouping)}
              onNotify={() => setNotifying(grouping)}
              onStatus={(status) => void save({ ...grouping, status })}
              whatsappConfigured={whatsappConfigured}
            />
          ))}
        </ul>
      )}

      <GroupingEditor
        grouping={editing}
        saving={saving}
        onClose={() => setEditing(null)}
        onSave={save}
      />

      <NotifySheet
        grouping={notifying}
        requests={requests}
        onClose={() => setNotifying(null)}
      />
    </div>
  );
}

function GroupingCard({
  grouping,
  stats,
  onEdit,
  onDelete,
  onTransfer,
  onNotify,
  onStatus,
  whatsappConfigured,
}: {
  grouping: Grouping;
  stats: GroupingStats;
  onEdit: () => void;
  onDelete: () => void;
  onTransfer: () => void;
  onNotify: () => void;
  onStatus: (status: GroupingStatus) => void;
  whatsappConfigured: boolean;
}) {
  const rate = groupingFillRate(grouping);
  const closingPassed =
    Boolean(grouping.closingDate) && new Date(grouping.closingDate).getTime() < Date.now();
  const underMinimum = stats.count < grouping.minOrders;
  const needsDecision = closingPassed && underMinimum && grouping.status === 'open';

  return (
    <li className="rounded-[--radius-lg] border border-line bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-[20px]">{grouping.reference}</p>
          <p className="mt-0.5 text-[12.5px] text-stone">
            {grouping.destination || 'Destination non précisée'}
            {grouping.closingDate ? ` · clôture le ${formatDate(grouping.closingDate)}` : ' · date non fixée'}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge tone={grouping.status === 'open' ? 'accent' : 'neutral'}>
            {STATUS_LABEL[grouping.status]}
          </Badge>
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Modifier ${grouping.reference}`}
            className="press grid size-9 place-items-center rounded-full bg-cream"
          >
            <Pencil className="size-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Supprimer ${grouping.reference}`}
            className="press grid size-9 place-items-center rounded-full bg-cream text-[#8a2f2f]"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between text-[13px]">
          <span className="font-medium">
            {stats.count} / {grouping.maxOrders} commandes
          </span>
          <span className="text-stone">
            minimum {grouping.minOrders} · {rate} %
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-sand">
          <div
            className={cn('h-full rounded-full transition-all duration-500', rate >= 100 ? 'bg-mauve' : 'bg-ink')}
            style={{ width: `${rate}%` }}
          />
        </div>
        <p className="mt-1.5 text-[11.5px] text-stone">
          {stats.siteOrders} via le site · {grouping.manualOrderCount} hors site
        </p>
      </div>

      {/* Pilotage — jamais affiché aux clientes. */}
      <div className="mt-5 rounded-[--radius-md] bg-cream/60 p-4">
        <p className="eyebrow">Rentabilité — usage interne</p>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-[13px] sm:grid-cols-3">
          <Stat label="Frais encaissés" value={formatFcfa(stats.serviceRevenue)} />
          <Stat
            label="Coût logistique"
            value={stats.logisticsCost === null ? 'Non estimé' : formatFcfa(stats.logisticsCost)}
          />
          <Stat
            label="Marge estimée"
            value={stats.margin === null ? '—' : formatFcfa(stats.margin)}
            tone={stats.margin === null ? undefined : stats.margin >= 0 ? 'positive' : 'negative'}
          />
          <Stat
            label="Marge / commande"
            value={stats.marginPerOrder === null ? '—' : formatFcfa(stats.marginPerOrder)}
          />
          <Stat
            label="Seuil de rentabilité"
            value={stats.breakEven === null ? '—' : `${stats.breakEven} commandes`}
          />
          <Stat
            label="Non chiffrées"
            value={`${stats.unpricedOrders} commande${stats.unpricedOrders > 1 ? 's' : ''}`}
          />
        </dl>
        {stats.breakEven !== null && stats.breakEvenReference !== null && (
          <p className="mt-2.5 text-[11.5px] text-stone">
            Calculé sur des frais moyens de {formatFcfa(stats.breakEvenReference)} par commande.
            {stats.unpricedOrders > 0 &&
              ' Les commandes non chiffrées ne sont pas comptées dans les frais encaissés.'}
          </p>
        )}
      </div>

      {needsDecision && (
        <div className="mt-4 rounded-[--radius-md] border border-line bg-blush/40 p-4">
          <p className="flex items-start gap-2 text-[13px] font-medium text-graphite">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            Date de clôture dépassée avec {stats.count} commande{stats.count > 1 ? 's' : ''} sur{' '}
            {grouping.minOrders} minimum. À vous de décider — rien n'est décidé automatiquement.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={onEdit}>
              Reporter la date
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onStatus('closed')}>
              Maintenir et clôturer
            </Button>
            <Button size="sm" variant="secondary" onClick={onTransfer}>
              <ArrowRightLeft className="size-4" /> Transférer au suivant
            </Button>
            <Button size="sm" variant="danger" onClick={() => onStatus('cancelled')}>
              Annuler
            </Button>
          </div>
          {whatsappConfigured && (
            <button
              type="button"
              onClick={onNotify}
              className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] text-mauve underline underline-offset-2"
            >
              <MessageCircle className="size-3.5" /> Prévenir les clientes concernées
            </button>
          )}
        </div>
      )}

      {!needsDecision && whatsappConfigured && stats.siteOrders > 0 && (
        <button
          type="button"
          onClick={onNotify}
          className="press mt-4 inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-2 text-[12.5px]"
        >
          <MessageCircle className="size-3.5" /> Prévenir les clientes
        </button>
      )}

      {grouping.note && <p className="mt-3 text-[12.5px] italic text-stone">« {grouping.note} »</p>}
    </li>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'positive' | 'negative';
}) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.1em] text-stone">{label}</dt>
      <dd
        className={cn(
          'mt-0.5 tabular-nums',
          tone === 'positive' && 'text-[#1f7a45]',
          tone === 'negative' && 'text-[#8a2f2f]',
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function GroupingEditor({
  grouping,
  saving,
  onClose,
  onSave,
}: {
  grouping: Grouping | null;
  saving: boolean;
  onClose: () => void;
  onSave: (grouping: Grouping) => Promise<void>;
}) {
  const [draft, setDraft] = useState<Grouping | null>(grouping);

  // Le brouillon suit l'élément ouvert.
  if (grouping && (!draft || draft.id !== grouping.id)) setDraft(grouping);

  return (
    <Sheet
      open={Boolean(grouping)}
      onClose={onClose}
      title={grouping?.reservedCount ? 'Modifier le groupage' : 'Nouveau groupage'}
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" full onClick={onClose}>
            Annuler
          </Button>
          <Button full loading={saving} onClick={() => draft && void onSave(draft)}>
            Enregistrer
          </Button>
        </div>
      }
    >
      {draft && (
        <div>
          <div className="grid gap-x-4 sm:grid-cols-2">
            <FormRow>
              <Label htmlFor="g-ref">Référence</Label>
              <Input
                id="g-ref"
                value={draft.reference}
                onChange={(e) => setDraft({ ...draft, reference: e.target.value })}
              />
            </FormRow>
            <FormRow>
              <Label htmlFor="g-dest">Destination</Label>
              <Input
                id="g-dest"
                value={draft.destination}
                onChange={(e) => setDraft({ ...draft, destination: e.target.value })}
              />
            </FormRow>
          </div>

          <FormRow>
            <Label htmlFor="g-date" hint="(vide = non fixée)">
              Clôture des inscriptions
            </Label>
            <Input
              id="g-date"
              type="datetime-local"
              value={toLocalInput(draft.closingDate)}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  closingDate: e.target.value ? new Date(e.target.value).toISOString() : '',
                })
              }
            />
            <p className="mt-1.5 text-[12px] text-stone">
              Cette date alimente le compte à rebours affiché sur le site.
            </p>
          </FormRow>

          <div className="grid gap-x-4 sm:grid-cols-2">
            <FormRow>
              <Label htmlFor="g-max">Capacité maximale</Label>
              <Input
                id="g-max"
                type="number"
                min={1}
                value={draft.maxOrders}
                onChange={(e) => setDraft({ ...draft, maxOrders: Math.max(1, Number(e.target.value)) })}
              />
            </FormRow>
            <FormRow>
              <Label htmlFor="g-min">Seuil minimum</Label>
              <Input
                id="g-min"
                type="number"
                min={0}
                value={draft.minOrders}
                onChange={(e) => setDraft({ ...draft, minOrders: Math.max(0, Number(e.target.value)) })}
              />
            </FormRow>
            <FormRow>
              <Label htmlFor="g-manual" hint="(WhatsApp, en personne)">
                Commandes hors site
              </Label>
              <Input
                id="g-manual"
                type="number"
                min={0}
                value={draft.manualOrderCount}
                onChange={(e) =>
                  setDraft({ ...draft, manualOrderCount: Math.max(0, Number(e.target.value)) })
                }
              />
            </FormRow>
            <FormRow>
              <Label htmlFor="g-cost" hint="(vide = non estimé)">
                Coût logistique
              </Label>
              <Input
                id="g-cost"
                type="number"
                min={0}
                step={500}
                placeholder="Non estimé"
                value={draft.logisticsCost ?? ''}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    logisticsCost: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
              />
            </FormRow>
          </div>

          <FormRow>
            <Label htmlFor="g-status">Statut</Label>
            <Select
              id="g-status"
              value={draft.status}
              onChange={(e) => setDraft({ ...draft, status: e.target.value as GroupingStatus })}
            >
              {Object.entries(STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </FormRow>

          <FormRow>
            <Label htmlFor="g-note" hint="(interne)">
              Note
            </Label>
            <Textarea
              id="g-note"
              value={draft.note ?? ''}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
            />
          </FormRow>

          <p className="text-[12px] leading-relaxed text-stone">
            Le compteur « {draft.reservedCount} demande{draft.reservedCount > 1 ? 's' : ''} via le
            site » est tenu automatiquement à chaque envoi de formulaire. Ajoutez ici uniquement les
            commandes prises en dehors du site.
          </p>
        </div>
      )}
    </Sheet>
  );
}

/** Liste des clientes du groupage, avec un message WhatsApp prêt à envoyer. */
function NotifySheet({
  grouping,
  requests,
  onClose,
}: {
  grouping: Grouping | null;
  requests: SheinRequest[];
  onClose: () => void;
}) {
  const attached = grouping
    ? requests.filter((r) => r.groupingId === grouping.id && r.status !== 'cancelled')
    : [];

  const message = (request: SheinRequest) =>
    `Bonjour ${request.customerName.split(' ')[0]}, au sujet de votre demande ${request.requestNumber} : ` +
    `voici où en est le groupage ${grouping?.reference ?? ''}.`;

  return (
    <Sheet open={Boolean(grouping)} onClose={onClose} title={`Prévenir — ${grouping?.reference ?? ''}`}>
      <p className="text-[13px] leading-relaxed text-stone">
        Un message par cliente, à envoyer depuis votre WhatsApp. Rien n'est envoyé automatiquement :
        vous relisez et complétez chaque message avant de l'expédier.
      </p>

      {attached.length === 0 ? (
        <p className="mt-6 text-[14px] text-stone">Aucune demande rattachée à ce groupage.</p>
      ) : (
        <ul className="mt-5 divide-y divide-line">
          {attached.map((request) => (
            <li key={request.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium">{request.customerName}</p>
                <p className="text-[12.5px] text-stone">
                  {request.requestNumber} · {prettyPhone(request.phone)}
                </p>
              </div>
              {isWhatsappConfigured(request.phone) && (
                <a
                  href={whatsappLink(request.phone, message(request))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="press inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#1f9c53] px-3.5 py-2 text-[12.5px] text-white"
                >
                  <MessageCircle className="size-3.5" /> Écrire
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}
