import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BRAND } from '@/src/config/site';
import { useCart } from '@/src/hooks/useCart';
import { useSettings } from '@/src/hooks/useSettings';
import { Link, useIsActive, useRouter } from '@/src/lib/router';
import { cn } from '@/src/lib/cn';

const NAV = [
  { to: '/', label: 'Accueil', exact: true },
  { to: '/boutique', label: 'Boutique' },
  { to: '/boutique?categorie=hijab', label: 'Foulards & hijabs' },
  { to: '/shein', label: 'Commande SHEIN' },
  { to: '/comment-ca-marche', label: 'Comment ça marche' },
  { to: '/suivi', label: 'Suivi' },
  { to: '/faq', label: 'FAQ' },
];

function NavLink({ to, label, exact }: { to: string; label: string; exact?: boolean }) {
  const active = useIsActive(to.split('?')[0], exact);
  return (
    <Link
      to={to}
      className={cn(
        'link-underline py-1 text-[13.5px] transition-colors',
        active ? 'text-ink' : 'text-stone hover:text-ink',
      )}
    >
      {label}
    </Link>
  );
}

export function Header({ onOpenCart }: { onOpenCart: () => void }) {
  const { count, pulse } = useCart();
  const { settings } = useSettings();
  const { navigate } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      {settings?.announcement ? (
        <div className="bg-ink px-4 py-2 text-center text-[12px] tracking-wide text-ivory">
          {settings.announcement}
        </div>
      ) : null}

      <header
        className={cn(
          'sticky top-0 z-50 transition-colors duration-300',
          scrolled ? 'border-b border-line bg-ivory/92 backdrop-blur-md' : 'bg-ivory',
        )}
      >
        <div className="container-page flex h-16 items-center justify-between gap-3">
          <button
            type="button"
            className="press -ml-2 grid size-10 place-items-center rounded-full text-ink lg:hidden"
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="size-5" />
          </button>

          <Link to="/" className="flex flex-col items-center lg:items-start" aria-label={`${BRAND.name} — accueil`}>
            <span className="font-display text-[20px] leading-none tracking-[0.02em]">{BRAND.name}</span>
            <span className="mt-0.5 text-[9px] uppercase tracking-[0.32em] text-stone">{BRAND.city}</span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigation principale">
            {NAV.map((item) => (
              <NavLink key={item.to} {...item} />
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => navigate('/boutique?focus=recherche')}
              className="press grid size-10 place-items-center rounded-full text-ink"
              aria-label="Rechercher un article"
            >
              <Search className="size-5" />
            </button>
            <button
              type="button"
              onClick={onOpenCart}
              className="press relative grid size-10 place-items-center rounded-full text-ink"
              aria-label={`Panier, ${count} article${count > 1 ? 's' : ''}`}
            >
              <ShoppingBag className="size-5" />
              {count > 0 && (
                <span
                  key={pulse}
                  className="animate-pop absolute -right-0.5 -top-0.5 grid size-[18px] place-items-center rounded-full bg-ink text-[10px] font-semibold text-ivory"
                >
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[85] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="animate-fade absolute inset-0 bg-ink/35" onClick={() => setMenuOpen(false)} />
          <nav className="animate-sheet absolute inset-x-0 top-0 rounded-b-[--radius-xl] bg-ivory px-6 pb-8 pt-5">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display text-lg">{BRAND.name}</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Fermer le menu"
                className="press grid size-9 place-items-center rounded-full bg-cream"
              >
                <X className="size-4" />
              </button>
            </div>
            <ul className="flex flex-col">
              {NAV.map((item, index) => (
                <li key={item.to} className={index > 0 ? 'hairline' : undefined}>
                  <Link
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="block py-3.5 font-display text-[22px]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
