import { Suspense, lazy, useState } from 'react';
import { CartDrawer } from '@/src/components/cart/CartDrawer';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { BottomNav } from '@/src/components/layout/BottomNav';
import { Footer } from '@/src/components/layout/Footer';
import { Header } from '@/src/components/layout/Header';
import { WhatsAppFab } from '@/src/components/layout/WhatsAppFab';
import { AdminAuthProvider } from '@/src/hooks/useAdminAuth';
import { CartProvider } from '@/src/hooks/useCart';
import { SettingsProvider } from '@/src/hooks/useSettings';
import { ToastProvider } from '@/src/hooks/useToast';
import { RouterProvider, matchPath, useRouter } from '@/src/lib/router';
import { useVersionCheck } from '@/src/hooks/useVersionCheck';
import { useVisitTracking } from '@/src/hooks/useVisitTracking';

import { CartPage } from '@/src/pages/CartPage';
import { CheckoutPage } from '@/src/pages/CheckoutPage';


import { HomePage } from '@/src/pages/HomePage';


import { ProductPage } from '@/src/pages/ProductPage';
import { ShopPage } from '@/src/pages/ShopPage';


import { SheinPage } from '@/src/pages/SheinPage';
import { SheinRequestPage } from '@/src/pages/SheinRequestPage';

/*
 * L'administration est chargée à la demande, et pas avec le reste du site.
 *
 * Elle pèse plus lourd que la boutique entière — tableaux, calculateur de
 * groupage, éditeur de fiches — et aucune cliente ne l'ouvrira jamais.
 * Statiquement importée, elle partait pourtant dans le même fichier : chaque
 * visiteuse la téléchargeait avant de voir un seul foulard, sur une connexion
 * mobile qui n'a pas de temps à perdre.
 */
/*
 * Ces pages-là non plus n'ont pas à voyager avec la boutique : on les ouvre
 * après avoir vu les articles, ou jamais. Chacune arrive quand on y va.
 */
const AboutPage = lazy(() => import('@/src/pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const FaqPage = lazy(() => import('@/src/pages/FaqPage').then((m) => ({ default: m.FaqPage })));
const HowItWorksPage = lazy(() =>
  import('@/src/pages/HowItWorksPage').then((m) => ({ default: m.HowItWorksPage })),
);
const SizeGuidePage = lazy(() =>
  import('@/src/pages/SizeGuidePage').then((m) => ({ default: m.SizeGuidePage })),
);
const TrackingPage = lazy(() =>
  import('@/src/pages/TrackingPage').then((m) => ({ default: m.TrackingPage })),
);
const SheinConfirmationPage = lazy(() =>
  import('@/src/pages/SheinConfirmationPage').then((m) => ({ default: m.SheinConfirmationPage })),
);
const ConfirmationPage = lazy(() =>
  import('@/src/pages/ConfirmationPage').then((m) => ({ default: m.ConfirmationPage })),
);
const NotFoundPage = lazy(() =>
  import('@/src/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

const AdminPage = lazy(() =>
  import('@/src/pages/admin/AdminPage').then((m) => ({ default: m.AdminPage })),
);

function Routes() {
  const { path } = useRouter();

  const product = matchPath('/produit/:slug', path);
  if (product) return <ProductPage slug={product.slug} />;

  const confirmation = matchPath('/confirmation/:orderNumber', path);
  if (confirmation) return <ConfirmationPage orderNumber={confirmation.orderNumber} />;

  const sheinConfirmation = matchPath('/shein/confirmation/:requestNumber', path);
  if (sheinConfirmation)
    return <SheinConfirmationPage requestNumber={sheinConfirmation.requestNumber} />;

  switch (path) {
    case '/':
      return <HomePage />;
    case '/boutique':
      return <ShopPage />;
    case '/panier':
      return <CartPage />;
    case '/commander':
      return <CheckoutPage />;
    case '/shein':
      return <SheinPage />;
    case '/shein/demande':
      return <SheinRequestPage />;
    case '/comment-ca-marche':
      return <HowItWorksPage />;
    case '/suivi':
      return <TrackingPage />;
    case '/faq':
      return <FaqPage />;
    case '/a-propos':
      return <AboutPage />;
    case '/guide-des-tailles':
      return <SizeGuidePage />;
    case '/admin':
      return <AdminPage />;
    default:
      return <NotFoundPage />;
  }
}

function Shell() {
  const { path } = useRouter();
  const [cartOpen, setCartOpen] = useState(false);
  const isAdmin = path.startsWith('/admin');
  // Une version plus récente est en ligne : on recharge sur les pages
  // tranquilles, on propose sur celles où quelqu'un est en train de saisir.
  const { nouvelleVersion, recharger } = useVersionCheck(path);
  // Comptage de la fréquentation (hors administration).
  useVisitTracking(path);

  return (
    <div className="flex min-h-dvh flex-col">
      {nouvelleVersion && (
        <div className="animate-fade sticky top-0 z-[90] flex flex-wrap items-center justify-center gap-3 bg-ink px-4 py-2.5 text-center text-[12.5px] text-ivory">
          Une version plus récente du site est en ligne.
          <button
            type="button"
            onClick={recharger}
            className="press rounded-full bg-ivory px-3.5 py-1.5 text-[12.5px] font-medium text-ink"
          >
            Recharger
          </button>
        </div>
      )}
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-ivory"
      >
        Aller au contenu
      </a>

      {!isAdmin && <Header onOpenCart={() => setCartOpen(true)} />}

      <main id="contenu" className={isAdmin ? 'flex-1' : 'flex-1 pb-safe-nav lg:pb-0'}>
        {/* Le reste de la page (entête, menu, panier) survit à une erreur de
            rendu : la cliente garde de quoi naviguer au lieu d'une page vide. */}
        <ErrorBoundary key={path} label="cette page" className="container-page my-10">
          {/*
            Les pages chargées à la demande arrivent avec un temps de retard.
            Une seule attente les couvre toutes, discrète : la boutique et
            l'accueil, eux, sont dans le fichier principal et s'affichent sans
            passer par ici.
          */}
          <Suspense
            fallback={
              <div className="container-page py-20 text-center text-[13.5px] text-stone">
                Un instant…
              </div>
            }
          >
            <Routes />
          </Suspense>
        </ErrorBoundary>
      </main>

      {!isAdmin && (
        <>
          <Footer />
          <WhatsAppFab />
          <BottomNav />
          <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <ToastProvider>
        <SettingsProvider>
          <AdminAuthProvider>
            <CartProvider>
              <Shell />
            </CartProvider>
          </AdminAuthProvider>
        </SettingsProvider>
      </ToastProvider>
    </RouterProvider>
  );
}
