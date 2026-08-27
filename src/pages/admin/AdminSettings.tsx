import { Info } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { FormRow, Input, Label, Textarea } from '@/src/components/ui/Field';
import { DELIVERY_ZONES } from '@/src/config/site';
import { useSettingsDraft } from '@/src/hooks/useSettingsDraft';
import { DraftStatus } from '@/src/components/admin/DraftStatus';
import { useProducts } from '@/src/hooks/useProducts';
import { useToast } from '@/src/hooks/useToast';
import { ReviewEditor } from '@/src/components/admin/ReviewEditor';
import { normalizePhone } from '@/src/lib/format';

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
  const { notify } = useToast();
  const { products } = useProducts(true);
  const { draft, setDraft, restored, saving, error, commit, discard } =
    useSettingsDraft('lumea.admin.draft.reglages');

  if (!draft) return null;

  const enregistrer = async () => {
    // Le numéro est normalisé avant l'envoi : ce qui part et ce qui reste
    // affiché sont ainsi la même chose.
    const propre = { ...draft, whatsappNumber: normalizePhone(draft.whatsappNumber) };
    if (await commit(propre)) notify('Réglages enregistrés');
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    void enregistrer();
  };

  return (
    <form onSubmit={submit} className="max-w-2xl xl:max-w-none">
      <h2 className="text-[24px]">Réglages</h2>

      <DraftStatus
        restored={restored}
        error={error}
        saving={saving}
        onDiscard={discard}
        onRetry={() => void enregistrer()}
      />

      <div className="mt-6 grid gap-5 xl:grid-cols-2 xl:items-start">
      <section className="rounded-[--radius-lg] border border-line bg-white p-5">
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
            C'est ce numéro qui permet d'envoyer les récapitulatifs <strong>déjà rédigés</strong>.
          </p>
        </FormRow>

        <FormRow>
          <Label htmlFor="s-walink" hint="wa.me/message/…">
            Lien court WhatsApp Business
          </Label>
          <Input
            id="s-walink"
            inputMode="url"
            placeholder="https://wa.me/message/XXXXXXXX"
            value={draft.whatsappLink}
            onChange={(e) => setDraft({ ...draft, whatsappLink: e.target.value })}
          />
          <p className="mt-1.5 flex gap-2 text-[12px] text-stone">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            Solution de repli si le numéro n'est pas renseigné. Ce format ouvre bien la
            conversation mais ne peut pas transporter de texte : le site copie alors le message
            dans le presse-papier avant d'ouvrir WhatsApp.
          </p>
        </FormRow>

        <FormRow>
          <Label htmlFor="s-announce" hint="défile en haut du site · vide = pas de bandeau">
            Bandeau d'annonce
          </Label>
          <Textarea
            id="s-announce"
            value={draft.announcement}
            onChange={(e) => setDraft({ ...draft, announcement: e.target.value })}
            placeholder="Ex : Clôture des demandes SHEIN vendredi à 18h."
          />
          <p className="mt-1.5 text-[12px] leading-relaxed text-stone">
            Le texte défile en continu, en rose foncé, tout en haut de chaque page. Une phrase
            courte se lit mieux qu'un paragraphe.
          </p>
        </FormRow>
      </section>

      <section className="rounded-[--radius-lg] border border-line bg-white p-5">
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
            Date de repli, utilisée seulement quand aucun groupage n'est ouvert (voir l'onglet
            Groupages, qui fait autorité). Laissez vide tant qu'aucune date n'est arrêtée : le site
            affichera « date annoncée sur WhatsApp » au lieu d'un compte à rebours fictif.
          </p>
        </FormRow>
      </section>

      <section className="rounded-[--radius-lg] border border-line bg-white p-5">
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
                step={1}
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

      <section className="rounded-[--radius-lg] border border-line bg-white p-5">
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

      <section className="rounded-[--radius-lg] border border-line bg-white p-5">
        <h3 className="text-[18px]">Avis clientes</h3>
        <div className="mt-4">
          <ReviewEditor
            reviews={draft.reviews}
            products={products}
            onChange={(reviews) => setDraft({ ...draft, reviews })}
          />
        </div>
      </section>

      </div>

      <Button type="submit" size="lg" className="mt-6" loading={saving}>
        Enregistrer les réglages
      </Button>
    </form>
  );
}
