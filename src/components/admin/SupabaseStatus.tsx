import { useEffect, useState } from 'react';
import { CircleCheck, CircleX, Loader2 } from 'lucide-react';
import { db } from '@/src/services';

type State =
  | { kind: 'checking' }
  | { kind: 'ok'; products: number }
  | { kind: 'error'; message: string; remedy: string | null };

/**
 * État réel de la connexion Supabase.
 *
 * Le bandeau annonçait « connecté » dès que l'adresse du projet était
 * renseignée — c'était une affirmation, pas une vérification. Une base dont le
 * schéma n'a pas encore été exécuté répondait donc « connecté » pendant que la
 * boutique était cassée. On interroge maintenant vraiment la base, et on dit
 * quoi faire quand ça ne répond pas.
 */
export function SupabaseStatus() {
  const [state, setState] = useState<State>({ kind: 'checking' });

  useEffect(() => {
    let annulé = false;
    void db
      .listProducts()
      .then((products) => {
        if (!annulé) setState({ kind: 'ok', products: products.length });
      })
      .catch((error: unknown) => {
        if (annulé) return;
        const message = error instanceof Error ? error.message : String(error);
        setState({ kind: 'error', message, remedy: remedyFor(message) });
      });
    return () => {
      annulé = true;
    };
  }, []);

  if (state.kind === 'checking') {
    return (
      <Frame tone="neutral" icon={<Loader2 className="mt-0.5 size-4 shrink-0 animate-spin" />}>
        Vérification de la connexion à Supabase…
      </Frame>
    );
  }

  if (state.kind === 'error') {
    return (
      <Frame tone="error" icon={<CircleX className="mt-0.5 size-4 shrink-0" />}>
        <strong className="font-medium">Supabase ne répond pas comme prévu.</strong>
        {state.remedy && <span className="mt-1 block">{state.remedy}</span>}
        <span className="mt-1.5 block break-all font-mono text-[11px] opacity-80">
          {state.message.slice(0, 300)}
        </span>
      </Frame>
    );
  }

  return (
    <Frame tone="ok" icon={<CircleCheck className="mt-0.5 size-4 shrink-0" />}>
      <strong className="font-medium">Connecté à Supabase</strong> — {state.products} article
      {state.products > 1 ? 's' : ''} en base. Les commandes sont partagées entre tous les
      appareils, et l'accès est protégé par les règles du projet.
      {state.products === 0 && (
        <span className="mt-1 block">
          La base ne contient aucun article : exécutez <code>supabase/seed-catalogue.sql</code> pour
          y verser le catalogue.
        </span>
      )}
    </Frame>
  );
}

function remedyFor(message: string): string | null {
  if (/does not exist|relation .* does not exist|PGRST205|schema cache/i.test(message)) {
    return "Les tables n'existent pas encore : exécutez supabase/schema.sql dans le SQL editor du projet, puis rechargez cette page.";
  }
  if (/Invalid API key|401|JWT/i.test(message)) {
    return 'La clé publique semble incorrecte. Reprenez-la dans Settings → API du projet (clé « publishable » ou « anon public »), jamais la clé « service_role ».';
  }
  if (/Failed to fetch|NetworkError|load failed/i.test(message)) {
    return "Le site n'arrive pas à joindre le projet. Vérifiez l'adresse du projet et votre connexion.";
  }
  return null;
}

function Frame({
  tone,
  icon,
  children,
}: {
  tone: 'ok' | 'error' | 'neutral';
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const tones = {
    ok: 'bg-cream text-graphite',
    error: 'bg-[#f6e9e9] text-[#6d2626]',
    neutral: 'bg-cream text-stone',
  } as const;
  return (
    <div
      className={`mt-5 flex items-start gap-2.5 rounded-[--radius-md] px-4 py-3 text-[12.5px] leading-relaxed ${tones[tone]}`}
    >
      {icon}
      <span className="min-w-0">{children}</span>
    </div>
  );
}

