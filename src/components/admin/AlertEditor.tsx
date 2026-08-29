import { Bell, BellOff, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/src/components/ui/Button';
import { FormRow, Input, Label } from '@/src/components/ui/Field';
import { useToast } from '@/src/hooks/useToast';
import { db } from '@/src/services';
import type { AlertSettings, AlertTestResult } from '@/src/services/types';

/**
 * Réglage de l'alerte « nouvelle commande ».
 *
 * Volontairement à part du reste des réglages : ces deux champs partent dans
 * une table que le site public ne peut pas lire, et l'enregistrement suit un
 * chemin différent. Les mélanger au même formulaire aurait donné un bouton
 * « Enregistrer » qui écrit à deux endroits — et une panne d'un côté aurait
 * fait croire à un échec de l'autre.
 */
export function AlertEditor() {
  const { notify } = useToast();
  const [draft, setDraft] = useState<AlertSettings | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [enregistrement, setEnregistrement] = useState(false);
  const [test, setTest] = useState<'inactif' | 'en-cours'>('inactif');
  const [resultat, setResultat] = useState<AlertTestResult | null>(null);

  useEffect(() => {
    let vivant = true;
    db.getAlertSettings()
      .then((s) => vivant && setDraft(s))
      .catch((e: unknown) => vivant && setErreur(e instanceof Error ? e.message : String(e)))
      .finally(() => vivant && setChargement(false));
    return () => {
      vivant = false;
    };
  }, []);

  const enregistrer = async () => {
    if (!draft) return;
    setEnregistrement(true);
    setResultat(null);
    try {
      await db.saveAlertSettings(draft);
      setErreur('');
      notify('Alerte enregistrée');
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setErreur(message);
      notify(message, 'error');
    } finally {
      setEnregistrement(false);
    }
  };

  const envoyerTest = async () => {
    setTest('en-cours');
    setResultat(null);
    try {
      setResultat(await db.testAlert());
    } catch (e) {
      setResultat({
        ok: false,
        enAttente: false,
        detail: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setTest('inactif');
    }
  };

  if (chargement) {
    return (
      <p className="flex items-center gap-2 text-[13.5px] text-stone">
        <Loader2 className="size-4 animate-spin" /> Chargement…
      </p>
    );
  }

  if (!draft) {
    return <p className="text-[13.5px] text-[#8a2f2f]">{erreur || 'Réglage indisponible.'}</p>;
  }

  const complet = draft.telegramToken.trim() !== '' && draft.telegramChatId.trim() !== '';

  return (
    /*
     * Ce bloc vit à l'intérieur du formulaire des réglages, qui a son propre
     * bouton « Enregistrer ». Sans ce garde-fou, appuyer sur Entrée dans un
     * champ ci-dessous soumettait CE formulaire-là : la boutique voyait
     * « Réglages enregistrés » alors que le jeton, lui, n'était pas parti.
     * Entrée enregistre donc l'alerte, et rien d'autre.
     */
    <div
      onKeyDown={(event) => {
        if (event.key !== 'Enter' || event.target instanceof HTMLTextAreaElement) return;
        event.preventDefault();
        event.stopPropagation();
        void enregistrer();
      }}
    >
      <p className="text-[13px] leading-relaxed text-stone">
        Recevez un message sur Telegram dès qu’une commande ou une demande SHEIN arrive — même si
        la cliente n’envoie pas de message WhatsApp. Créez un robot avec{' '}
        <span className="font-medium text-graphite">@BotFather</span> sur Telegram, il vous donne
        un jeton ; puis écrivez à{' '}
        <span className="font-medium text-graphite">@userinfobot</span>, il vous donne votre
        identifiant.
      </p>

      {erreur && (
        <p className="mt-4 rounded-[--radius-md] border border-[#e5c3c3] bg-[#fdf1f1] p-3 text-[13px] text-[#8a2f2f]">
          {erreur}
        </p>
      )}

      <FormRow className="mt-4">
        <Label htmlFor="a-token" hint="donné par @BotFather">
          Jeton du robot
        </Label>
        {/*
          `type="password"` : le jeton donne le droit d'écrire au nom du
          robot. Il ne doit pas rester lisible sur un écran qu'on montre.
        */}
        <Input
          id="a-token"
          type="password"
          autoComplete="off"
          placeholder="123456789:AA…"
          value={draft.telegramToken}
          onChange={(e) => setDraft({ ...draft, telegramToken: e.target.value })}
        />
      </FormRow>

      <FormRow>
        <Label htmlFor="a-chat" hint="donné par @userinfobot">
          Votre identifiant Telegram
        </Label>
        <Input
          id="a-chat"
          inputMode="numeric"
          placeholder="123456789"
          value={draft.telegramChatId}
          onChange={(e) => setDraft({ ...draft, telegramChatId: e.target.value })}
        />
      </FormRow>

      <label className="mt-2 flex items-start gap-3 text-[13.5px]">
        <input
          type="checkbox"
          className="mt-0.5 size-4 accent-[--color-mauve]"
          checked={draft.enabled}
          onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
        />
        <span>
          <span className="font-medium">Envoyer les alertes</span>
          <span className="mt-0.5 block text-[12.5px] text-stone">
            Décoché, rien ne part : vos identifiants restent enregistrés, simplement inutilisés.
          </span>
        </span>
      </label>

      <p className="mt-4 flex items-center gap-2 text-[12.5px] text-stone">
        {draft.enabled && complet ? (
          <>
            <Bell className="size-4 text-mauve" /> Alerte active.
          </>
        ) : (
          <>
            <BellOff className="size-4" />
            {complet ? 'Renseigné mais éteint.' : 'Pas encore configurée : aucun message ne part.'}
          </>
        )}
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button type="button" onClick={() => void enregistrer()} loading={enregistrement}>
          Enregistrer l’alerte
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={!complet || test === 'en-cours'}
          loading={test === 'en-cours'}
          onClick={() => void envoyerTest()}
        >
          Envoyer un test
        </Button>
      </div>

      {test === 'en-cours' && (
        <p className="mt-3 text-[12.5px] text-stone">
          Message envoyé, on attend la réponse de Telegram…
        </p>
      )}

      {/*
        On n'annonce « ça marche » qu'après avoir vu Telegram accepter le
        message. Un simple « envoyé » ne prouverait rien : un jeton faux part
        aussi bien, il est seulement refusé à l'arrivée.
      */}
      {resultat && (
        <p
          className={`mt-3 flex items-start gap-2 text-[13px] ${
            resultat.ok ? 'text-graphite' : 'text-[#8a2f2f]'
          }`}
        >
          {resultat.ok ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-mauve" />
          ) : (
            <XCircle className="mt-0.5 size-4 shrink-0" />
          )}
          <span>
            {resultat.ok
              ? 'Telegram a accepté le message : regardez votre téléphone.'
              : resultat.detail || "Telegram a refusé le message. Vérifiez le jeton et l'identifiant."}
          </span>
        </p>
      )}
    </div>
  );
}
