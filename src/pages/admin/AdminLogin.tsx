import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/src/components/ui/Button';
import { ErrorText, FormRow, Input, Label } from '@/src/components/ui/Field';
import { useAdminAuth } from '@/src/hooks/useAdminAuth';
import { useRouter } from '@/src/lib/router';

export function AdminLogin() {
  const { signIn, mode } = useAdminAuth();
  const { navigate } = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [secret, setSecret] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(identifier, secret);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Connexion impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page grid min-h-[70vh] place-items-center py-12">
      <form onSubmit={submit} className="w-full max-w-sm rounded-[--radius-lg] border border-line bg-white p-7">
        <p className="eyebrow">Espace administrateur</p>
        <h1 className="mt-2 text-[28px]">Connexion</h1>

        {mode === 'supabase' ? (
          <>
            <FormRow className="mt-6">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </FormRow>
            <FormRow>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
              />
            </FormRow>
          </>
        ) : (
          <FormRow className="mt-6">
            <Label htmlFor="passcode">Code d'accès</Label>
            <Input
              id="passcode"
              type="password"
              autoComplete="current-password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
            />
          </FormRow>
        )}

        <ErrorText>{error}</ErrorText>

        <Button type="submit" full className="mt-4" loading={loading}>
          Entrer
        </Button>

        {/* L'administration masque l'entête du site : sans ce lien, on ne
            peut revenir à la boutique qu'avec le bouton « retour ». */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-4 flex w-full items-center justify-center gap-1.5 text-[12.5px] text-stone underline underline-offset-2"
        >
          <ArrowLeft className="size-3.5" />
          Retour à la boutique
        </button>

        {mode === 'local' && (
          <p className="mt-6 flex gap-2 rounded-[--radius-sm] bg-cream px-4 py-3 text-[12px] leading-relaxed text-graphite">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            <span>
              Mode local : ce code protège l'accès depuis ce navigateur, mais ne remplace pas une
              authentification serveur. Renseignez les variables Supabase pour activer une vraie
              connexion sécurisée (voir README).
            </span>
          </p>
        )}
      </form>
    </div>
  );
}
