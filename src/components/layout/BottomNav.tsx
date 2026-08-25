import { Home, PackageSearch, ShoppingBag, Sparkles, Store } from 'lucide-react';
import { useCart } from '@/src/hooks/useCart';
import { Link, useIsActive } from '@/src/lib/router';
import { cn } from '@/src/lib/cn';

const ITEMS = [
  { to: '/', label: 'Accueil', icon: Home, exact: true },
  { to: '/boutique', label: 'Boutique', icon: Store },
  { to: '/panier', label: 'Panier', icon: ShoppingBag },
  { to: '/shein', label: 'SHEIN', icon: Sparkles },
  { to: '/suivi', label: 'Suivi', icon: PackageSearch },
];

/** Navigation basse : l'essentiel du parcours atteignable au pouce. */
export function BottomNav() {
  const { count, pulse } = useCart();

  return (
    <nav
      aria-label="Navigation rapide"
      className="safe-bottom fixed inset-x-0 bottom-0 z-[70] border-t border-line bg-ivory/96 backdrop-blur-md lg:hidden"
    >
      <ul className="flex items-stretch">
        {ITEMS.map(({ to, label, icon: Icon, exact }) => (
          <BottomItem key={to} to={to} label={label} exact={exact}>
            <span className="relative">
              <Icon className="size-[21px]" strokeWidth={1.6} />
              {to === '/panier' && count > 0 && (
                <span
                  key={pulse}
                  className="animate-pop absolute -right-2 -top-1.5 grid size-[16px] place-items-center rounded-full bg-ink text-[9px] font-semibold text-ivory"
                >
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </span>
          </BottomItem>
        ))}
      </ul>
    </nav>
  );
}

function BottomItem({
  to,
  label,
  exact,
  children,
}: {
  to: string;
  label: string;
  exact?: boolean;
  children: React.ReactNode;
}) {
  const active = useIsActive(to, exact);
  return (
    <li className="flex-1">
      <Link
        to={to}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex h-[62px] flex-col items-center justify-center gap-1 text-[10px] tracking-wide transition-colors',
          active ? 'text-ink' : 'text-stone',
        )}
      >
        {children}
        <span>{label}</span>
      </Link>
    </li>
  );
}
