import { Pencil } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/src/components/ui/Button';
import { ErrorText, FormRow, Input, Label, Textarea } from '@/src/components/ui/Field';
import { Sheet } from '@/src/components/ui/Sheet';
import { isValidSenegalPhone, prettyPhone } from '@/src/lib/format';

export interface Coordonnees {
  customerName: string;
  phone: string;
  address?: string;
  city?: string;
  note?: string;
}

/**
 * Corriger les coordonnées d'une commande ou d'une demande.
 *
 * Une cliente qui se trompe d'un chiffre en tapant son numéro n'est plus
 * joignable, et n'a aucun moyen de le rattraper elle-même : sa page Suivi
 * demande justement ce numéro. La boutique corrige donc à sa place.
 *
 * Ce panneau ne touche qu'aux coordonnées. Les montants restent ceux que la
 * base a calculés à l'enregistrement — les frais de livraison ont leur propre
 * champ, à côté, parce que c'est la boutique qui les fixe.
 */
export function CoordonneesEditor({
  valeur,
  reference,
  avecAdresse = true,
  disabled,
  onSave,
}: {
  valeur: Coordonnees;
  /** Numéro de commande ou de demande, rappelé en tête du panneau. */
  reference: string;
  /** Les demandes SHEIN n'ont ni adresse ni ville : le groupage s'en charge. */
  avecAdresse?: boolean;
  disabled?: boolean;
  onSave: (coordonnees: Coordonnees) => Promise<void>;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [brouillon, setBrouillon] = useState<Coordonnees>(valeur);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const ouvrir = () => {
    setBrouillon(valeur);
    setErreur(null);
    setOuvert(true);
  };

  const enregistrer = async () => {
    const nom = brouillon.customerName.trim();
    if (!nom) return setErreur('Le nom ne peut pas être vide.');
    if (!isValidSenegalPhone(brouillon.phone)) {
      return setErreur('Numéro sénégalais attendu : 77, 78, 76, 70 ou 75, neuf chiffres.');
    }
    setEnCours(true);
    setErreur(null);
    try {
      await onSave({
        customerName: nom,
        phone: brouillon.phone.trim(),
        address: brouillon.address?.trim(),
        city: brouillon.city?.trim(),
        note: brouillon.note?.trim(),
      });
      setOuvert(false);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Enregistrement impossible.');
    } finally {
      setEnCours(false);
    }
  };

  const changement = brouillon.phone.trim() !== valeur.phone.trim();

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={ouvrir}
        className="press inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-[12.5px] font-medium text-graphite disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Pencil className="size-3.5" />
        Modifier les coordonnées
      </button>

      <Sheet
        open={ouvert}
        onClose={() => setOuvert(false)}
        title="Corriger les coordonnées"
        footer={
          <div className="flex gap-2.5">
            <Button variant="secondary" full disabled={enCours} onClick={() => setOuvert(false)}>
              Annuler
            </Button>
            <Button full loading={enCours} onClick={() => void enregistrer()}>
              Enregistrer
            </Button>
          </div>
        }
      >
        <p className="text-[12.5px] text-stone">{reference}</p>

        <FormRow className="mt-4">
          <Label htmlFor="co-nom">Nom de la cliente</Label>
          <Input
            id="co-nom"
            value={brouillon.customerName}
            onChange={(e) => setBrouillon({ ...brouillon, customerName: e.target.value })}
          />
        </FormRow>

        <FormRow>
          <Label htmlFor="co-tel">Téléphone</Label>
          <Input
            id="co-tel"
            inputMode="tel"
            value={brouillon.phone}
            onChange={(e) => setBrouillon({ ...brouillon, phone: e.target.value })}
          />
          {changement && (
            <p className="mt-1.5 text-[12px] leading-relaxed text-mauve">
              Le suivi passe à ce numéro : la cliente devra saisir{' '}
              <strong className="font-medium">{prettyPhone(brouillon.phone) || '…'}</strong> sur la
              page Suivi, plus l'ancien. Prévenez-la.
            </p>
          )}
        </FormRow>

        {avecAdresse && (
          <>
            <FormRow>
              <Label htmlFor="co-adresse">Adresse</Label>
              <Input
                id="co-adresse"
                value={brouillon.address ?? ''}
                onChange={(e) => setBrouillon({ ...brouillon, address: e.target.value })}
              />
            </FormRow>
            <FormRow>
              <Label htmlFor="co-ville">Ville</Label>
              <Input
                id="co-ville"
                value={brouillon.city ?? ''}
                onChange={(e) => setBrouillon({ ...brouillon, city: e.target.value })}
              />
            </FormRow>
          </>
        )}

        <FormRow>
          <Label htmlFor="co-note" hint="(facultatif)">
            Note
          </Label>
          <Textarea
            id="co-note"
            value={brouillon.note ?? ''}
            onChange={(e) => setBrouillon({ ...brouillon, note: e.target.value })}
          />
        </FormRow>

        {erreur && <ErrorText>{erreur}</ErrorText>}

        <p className="mt-3 text-[12px] leading-relaxed text-stone">
          Seules les coordonnées changent. Le montant reste celui calculé à la commande.
        </p>
      </Sheet>
    </>
  );
}
