import { Button } from '@/src/components/ui/Button';
import { useRouter } from '@/src/lib/router';
import { useSeo } from '@/src/lib/seo';

export function NotFoundPage() {
  const { navigate } = useRouter();
  useSeo({ title: 'Page introuvable', description: 'Cette page n’existe pas.', noIndex: true });

  return (
    <div className="container-page py-24 text-center">
      <p className="eyebrow">Erreur 404</p>
      <h1 className="mt-4 text-[38px]">Cette page n'existe pas</h1>
      <p className="mx-auto mt-3 max-w-sm text-[15px] text-stone">
        Le lien est peut-être ancien. Reprenons depuis la boutique.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button onClick={() => navigate('/boutique')}>Aller à la boutique</Button>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Retour à l'accueil
        </Button>
      </div>
    </div>
  );
}
