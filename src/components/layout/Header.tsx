import { Heart, Lock, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import symbole from '@/src/assets/brand/symbole-sombre.webp';
import { AnnouncementTicker } from '@/src/components/layout/AnnouncementTicker';
import { BRAND } from '@/src/config/site';
import { useCart } from '@/src/hooks/useCart';
import { useFavoris } from '@/src/hooks/useFavoris';
import { useSettings } from '@/src/hooks/useSettings';
import { Link, useIsActive, useRouter } from '@/src/lib/router';
import { cn } from '@/src/lib/cn';

const NAV = [
  { to: '/', label: 'Accueil', exact: true },
  { to: '/boutique', label: 'Boutique' },
  { to: '/boutique?categorie=piece_unique', label: 'Pièce unique' },
  { to: '/shein', label: 'Commande SHEIN' },
  { to: '/comment-ca-marche', label: 'Comment ça marche' },
  { to: '/guide-des-tailles', label: 'Guide des tailles' },
  { to: '/favoris', label: 'Mes favoris' },
  { to: '/suivi', label: 'Suivi' },
  { to: '/faq', label: 'FAQ' },
  { to: '/a-propos', label: 'À propos' },
];

function NavLink({ to, label, exact }: { to: string; label: string; exact?: boolean }) {
  const active = useIsActive(to.split('?')[0], exact);
  return (
    <Link
      to={to}
      className={cn(
        'link-underline whitespace-nowrap py-1 text-[13.5px] transition-colors',
        active ? 'text-ink' : 'text-stone hover:text-ink',
      )}
    >
      {label}
    </Link>
  );
}

export function Header({ onOpenCart }: { onOpenCart: () => void }) {
  const { count, pulse } = useCart();
  const { count: favoris } = useFavoris();
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
      <AnnouncementTicker message={settings?.announcement ?? ''} />

      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-300',
          scrolled ? 'border-b border-[#F4C7D3]/60 bg-[#FAF3F4]/95 backdrop-blur-xl shadow-xs' : 'bg-[#FAF3F4]/90 backdrop-blur-md',
        )}
      >
        <div className="container-page flex h-16 sm:h-20 items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="press -ml-2 grid size-10 place-items-center rounded-full text-[#3D1220] xl:hidden hover:bg-[#FCE8EE]/50"
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="size-5" />
            </button>

            <Link to="/" className="flex items-center gap-2.5 group select-none" aria-label={`${BRAND.name} — accueil`}>
              <img
                src={symbole}
                alt=""
                className="size-8 sm:size-9 shrink-0 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
              />
              <span className="flex flex-col items-start text-left">
                <span className="text-xl sm:text-2xl font-serif tracking-[0.16em] text-[#581127] font-bold leading-none">
                  AFAURA
                </span>
                <span className="text-[9px] tracking-[0.25em] uppercase text-[#8A6470] font-sans font-medium mt-0.5">
                  Espace Catalogue
                </span>
              </span>
            </Link>

            {/* Quick Pills like Espace AFAURA */}
            <div className="hidden lg:flex items-center gap-2 ml-4">
              <Link
                to="/boutique"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all bg-white/80 border-[#F4C7D3]/60 text-[#7E1E3C] shadow-xs hover:bg-white hover:border-[#E296A9]"
              >
                <span>Catalogue</span>
              </Link>
              <Link
                to="/shein"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all shadow-xs bg-gradient-to-r from-[#FAF3F4] to-[#FCE8EE] border-[#E296A9]/70 text-[#581127] hover:border-[#7E1E3C]"
              >
                <span>Services Exclusifs</span>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-5" aria-label="Navigation principale">
            {NAV.map((item) => (
              <NavLink key={item.to} {...item} />
            ))}
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Tracking Button */}
            <Link
              to="/suivi"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FAF3F4] via-[#FFF8F9] to-[#FCE8EE] shadow-xs border border-[#E296A9] hover:border-[#7E1E3C] text-[#581127] text-xs font-bold transition-all"
              title="Suivre et consulter mes commandes"
            >
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Suivi Colis</span>
            </Link>

            <button
              type="button"
              onClick={() => navigate('/boutique?focus=recherche')}
              className="press grid size-9 sm:size-10 place-items-center rounded-full text-[#3D1220] hover:bg-white/80 transition-colors"
              aria-label="Rechercher un article"
            >
              <Search className="size-5 text-[#581127]" />
            </button>

            <Link
              to="/favoris"
              className="press relative grid size-9 sm:size-10 place-items-center rounded-full text-[#3D1220] hover:bg-white/80 transition-colors"
              aria-label={`Mes favoris, ${favoris} article${favoris > 1 ? 's' : ''}`}
            >
              <Heart className="size-5 text-[#581127]" strokeWidth={1.8} />
              {favoris > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid size-[18px] place-items-center rounded-full bg-[#7E1E3C] text-[10px] font-semibold text-white shadow-xs">
                  {favoris > 99 ? '99+' : favoris}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={onOpenCart}
              className="press relative grid size-9 sm:size-10 place-items-center rounded-full text-[#3D1220] hover:bg-white/80 transition-colors"
              aria-label={`Panier, ${count} article${count > 1 ? 's' : ''}`}
            >
              <ShoppingBag className="size-5 text-[#581127]" />
              {count > 0 && (
                <span
                  key={pulse}
                  className="animate-pop absolute -right-0.5 -top-0.5 grid size-[18px] place-items-center rounded-full bg-[#581127] text-[10px] font-bold text-white shadow-sm"
                >
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[85] xl:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="animate-fade absolute inset-0 bg-ink/35" onClick={() => setMenuOpen(false)} />
          {/*
            Le menu défile.

            Il compte une dizaine d'entrées, et « Espace boutique » ferme la
            marche. Sur un écran de 640 px, le panneau mesurait 796 px : le
            lien de l'administration tombait sous le bord de l'écran, sans
            aucun moyen d'y accéder depuis un téléphone. La hauteur est donc
            bornée à l'écran, et ce qui dépasse se fait défiler.
          */}
          <nav className="animate-sheet absolute inset-x-0 top-0 max-h-[92dvh] overflow-y-auto overscroll-contain rounded-b-[--radius-xl] bg-ivory px-6 pb-8 pt-5">
            <div className="mb-6 flex items-center justify-between">
              <span className="flex items-center gap-2.5">
                <img src={symbole} alt="" className="size-8 object-contain" />
                <span className="font-display text-lg">{BRAND.name}</span>
              </span>
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

            {/*
              L'espace boutique vit ici, dans le menu, et nulle part ailleurs :
              une cliente n'a rien à y faire, et il reste protégé par un code.
              Le placer dans la barre du haut le mettrait sous les yeux de tout
              le monde à chaque page.
            */}
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className="hairline mt-1 flex items-center gap-2 py-3.5 text-[13.5px] text-stone"
            >
              <Lock className="size-3.5" />
              Espace boutique
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
