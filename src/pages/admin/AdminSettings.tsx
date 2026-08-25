import { Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/src/components/ui/Button';
import { FormRow, Input, Label, Textarea } from '@/src/components/ui/Field';
import { DELIVERY_ZONES } from '@/src/config/site';
import { useSettings } from '@/src/hooks/useSettings';
import { useToast } from '@/src/hooks/useToast';
import { normalizePhone } from '@/src/lib/format';
import type { StoreSettings } from '@/src/types';

/** Convertit une date ISO en valeur pour <input type="datetime-local">. */
const toLocalInput = (iso: string) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

export function AdminSettings() {
  const { settings, save } = useSettings();
  const { notify } = useToast();
  const [draft, setDraft] = useState<StoreSettings | null>(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  if (!draft) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await save({ ...draft, whatsappNumber: normalizePhone(draft.whatsappNumber) });
      notify('Réglages enregistrés');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Enregistrement impossible.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-2xl">
      <h2 className="text-[24px]">Réglages</h2>

      <section className="mt-6 rounded-[--radius-lg] border border-line bg-white p-5">
        <h3 className="text-[18px]">Contact</h3>
        <FormRow className="mt-4">
          <Label htmlFor="s-wa" hint="format international, sans +">
            Numéro WhatsApp
          </Label>
          <Input
            id="s-wa"
            inputMode="tel"
            placeholder="221771234567"
            value={draft.whatsappNumber}
            onChange={(e) => setDraft({ ...draft, whatsappNumber: e.target.value })}
          />
          <p className="mt-1.5 text-[12px] text-stone">
            Utilisé par tous les boutons WhatsApp du site — une seule valeur, jamais recopiée ailleurs.
          </p>
        </FormRow>

        <FormRow>
          <Label htmlFor="s-announce" hint="(vide = pas de bandeau)">
            Bandeau d'annonce
          </Label>
          <Textarea
            id="s-announce"
            value={draft.announcement}
            onChange={(e) => setDraft({ ...draft, announcement: e.target.value })}
            placeholder="Ex : Clôture des demandes SHEIN vendredi à 18h."
          />
        </FormRow>
      </section>

      <section className="mt-5 rounded-[--radius-lg] border border-line bg-white p-5">
        <h3 className="text-[18px]">Groupage</h3>
        <FormRow className="mt-4">
          <Label htmlFor="s-group">Clôture du prochain groupage</Label>
          <Input
            id="s-group"
            type="datetime-local"
            value={toLocalInput(draft.nextGroupingDate)}
            onChange={(e) =>
              setDraft({
                ...draft,
                nextGroupingDate: e.target.value ? new Date(e.target.value).toISOString() : '',
              })
            }
          />
          <p className="mt-1.5 flex gap-2 text-[12px] text-stone">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            Laissez vide tant que la date n'est pas arrêtée : le site affichera « date annoncée sur
            WhatsApp » au lieu d'un compte à rebours fictif.
          </p>
        </FormRow>
      </section>

      <section className="mt-5 rounded-[--radius-lg] border border-line bg-white p-5">
        <h3 className="text-[18px]">Frais de livraison</h3>
        <p className="mt-1 text-[12.5px] text-stone">
          Laissez vide pour afficher « à confirmer » plutôt qu'un montant approximatif.
        </p>
        <div className="mt-4 space-y-3">
          {DELIVERY_ZONES.map((zone) => (
            <FormRow key={zone.id} className="mb-0">
              <Label htmlFor={`fee-${zone.id}`}>{zone.label}</Label>
              <Input
                id={`fee-${zone.id}`}
                type="number"
                min={0}
                step={100}
                placeholder="À confirmer"
                value={draft.deliveryFees[zone.id] ?? ''}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    deliveryFees: {
                      ...draft.deliveryFees,
                      [zone.id]: e.target.value === '' ? null : Number(e.target.value),
                    },
                  })
                }
              />
            </FormRow>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-[--radius-lg] border border-line bg-white p-5">
        <h3 className="text-[18px]">Paiement mobile</h3>
        <p className="mt-1 text-[12.5px] text-stone">
          Ces numéros s'affichent dans les instructions de paiement. Laissez vide et le site indiquera
          que les coordonnées sont envoyées sur WhatsApp.
        </p>
        <div className="mt-4 grid gap-x-4 sm:grid-cols-2">
          <FormRow>
            <Label htmlFor="s-wave">Numéro Wave</Label>
            <Input
              id="s-wave"
              inputMode="tel"
              value={draft.waveNumber}
              onChange={(e) => setDraft({ ...draft, waveNumber: e.target.value })}
            />
          </FormRow>
          <FormRow>
            <Label htmlFor="s-om">Numéro Orange Money</Label>
            <Input
              id="s-om"
              inputMode="tel"
              value={draft.orangeMoneyNumber}
              onChange={(e) => setDraft({ ...draft, orangeMoneyNumber: e.target.value })}
            />
          </FormRow>
        </div>
      </section>

      <Button type="submit" size="lg" className="mt-6" loading={saving}>
        Enregistrer les réglages
      </Button>
    </form>
  );
}
