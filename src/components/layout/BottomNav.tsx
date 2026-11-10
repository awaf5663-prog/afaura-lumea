import { Heart, Home, PackageSearch, ShoppingBag, Sparkles, Store } from 'lucide-react';
import { useCart } from '@/src/hooks/useCart';
import { useFavoris } from '@/src/hooks/useFavoris';
import { Link, useIsActive } from '@/src/lib/router';

const ITEMS = [
  { to: '/', label: 'Accueil', icon: Home, exact: true },
  { to: '/boutique', label: 'Catalogue', icon: Store },
  { to: '/shein', label: 'Services', icon: Sparkles },
  { to: '/suivi', label: 'Suivi', icon: PackageSearch },
  { to: '/favoris', label: 'Favoris', icon: Heart },
  { to: '/panier', label: 'Panier', icon: ShoppingBag },
];

/** Navigation basse : floating dock raffiné style Espace AFAURA */
export function BottomNav() {
  const { count, pulse } = useCart();
  const { count: favoris } = useFavoris();

  return (
    <div className="fixed bottom-3 inset-x-0 z-[70] flex justify-center px-3 sm:px-4 pointer-events-none lg:hidden pb-[env(safe-area-inset-bottom,0px)]">
      <nav
        aria-label="Navigation principale"
        className="pointer-events-auto floating-dock rounded-full px-2 sm:px-2.5 py-1.5 flex items-center justify-around gap-1 shadow-[0_20px_40px_-8px_rgba(88,17,39,0.55)] border border-[#E296A9]/35 max-w-full"
      >
        {ITEMS.map(({ to, label, icon: Icon, exact }) => {
          const active = useIsActive(to, exact);
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? 'page' : undefined}
              className={`press relative flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all ${
                active
                  ? 'bg-[#E296A9] text-[#581127] shadow-sm'
                  : 'text-[#FAF3F4]/80 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className="size-4" strokeWidth={active ? 2.4 : 1.8} />
                {to === '/panier' && count > 0 && (
                  <span
                    key={pulse}
                    className="absolute -right-2 -top-1.5 grid size-3.5 place-items-center rounded-full bg-white text-[8.5px] font-bold text-[#581127]"
                  >
                    {count > 9 ? '9+' : count}
                  </span>
                )}
                {to === '/favoris' && favoris > 0 && !active && (
                  <span className="absolute -right-1 -top-1 size-2 rounded-full bg-[#E296A9] ring-1 ring-[#581127]" />
                )}
              </div>
              {active && <span className="text-[11.5px]">{label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
