import { useState } from 'react';
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
import { CartPage } from '@/src/pages/CartPage';
import { CheckoutPage } from '@/src/pages/CheckoutPage';
import { ConfirmationPage } from '@/src/pages/ConfirmationPage';
import { FaqPage } from '@/src/pages/FaqPage';
import { HomePage } from '@/src/pages/HomePage';
import { HowItWorksPage } from '@/src/pages/HowItWorksPage';
import { NotFoundPage } from '@/src/pages/NotFoundPage';
import { ProductPage } from '@/src/pages/ProductPage';
import { ShopPage } from '@/src/pages/ShopPage';
import { SizeGuidePage } from '@/src/pages/SizeGuidePage';
import { SheinConfirmationPage } from '@/src/pages/SheinConfirmationPage';
import { SheinPage } from '@/src/pages/SheinPage';
import { SheinRequestPage } from '@/src/pages/SheinRequestPage';
import { TrackingPage } from '@/src/pages/TrackingPage';
import { AdminPage } from '@/src/pages/admin/AdminPage';

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
          <Routes />
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
