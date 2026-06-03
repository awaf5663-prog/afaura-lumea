import { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, Search, Globe, ChevronRight } from 'lucide-react';
import { CartItem } from '../types';
import { motion } from 'motion/react';

interface NavbarProps {
  cart: CartItem[];
  onOpenCart: () => void;
  onNavigate: (section: 'home' | 'shop' | 'about' | 'contact') => void;
  activeSection: string;
}

export default function Navbar({ cart, onOpenCart, onNavigate, activeSection }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (section: 'home' | 'shop' | 'about' | 'contact') => {
    onNavigate(section);
    setIsOpen(false);
  };

  return (
    <nav
      id="main-navigation"
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${
        isScrolled
          ? 'bg-[#faf8f5]/92 backdrop-blur-md shadow-xs border-b border-neutral-100 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          
          {/* Left: Language Indicator or Sub-branding */}
          <div className="hidden lg:flex items-center space-x-2 text-[10px] uppercase tracking-widest font-mono text-neutral-500">
            <Globe className="w-3.5 h-3.5 text-neutral-400" />
            <span>FR — EUR</span>
          </div>

          {/* Center-Left: Desktop Navigation with fluid layout underlines */}
          <div className="hidden md:flex space-x-8 items-center h-full">
            <button
              onClick={() => handleLinkClick('home')}
              className={`text-[11px] uppercase tracking-[0.25em] font-sans transition-colors cursor-pointer relative py-2 ${
                activeSection === 'home'
                  ? 'text-neutral-950 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-900 font-normal'
              }`}
            >
              <span>Collection</span>
              {activeSection === 'home' && (
                <motion.div
                  layoutId="active-nav-border"
                  className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-neutral-950"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
            
            <button
              onClick={() => handleLinkClick('shop')}
              className={`text-[11px] uppercase tracking-[0.25em] font-sans transition-colors cursor-pointer relative py-2 ${
                activeSection === 'shop'
                  ? 'text-neutral-950 font-semibold'
                  : 'text-neutral-400 hover:text-neutral-900 font-normal'
              }`}
            >
              <span>Boutique</span>
              {activeSection === 'shop' && (
                <motion.div
                  layoutId="active-nav-border"
                  className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-neutral-950"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          </div>

          {/* Center: Brand Identity Logo */}
          <div className="text-center">
            <button
              onClick={() => handleLinkClick('home')}
              className="group cursor-pointer focus:outline-none flex flex-col items-center"
            >
              <h1 className="text-xl sm:text-2xl font-serif tracking-[0.28em] font-medium text-neutral-900 uppercase">
                Afaura
              </h1>
              <span className="text-[8px] uppercase tracking-[0.5em] font-mono text-neutral-400 -mt-0.5 group-hover:text-brand-gold transition-colors duration-300">
                LUMÉA
              </span>
            </button>
          </div>

          {/* Right Desktop Nav actions & Cart Trigger */}
          <div className="flex items-center space-x-5">
            <div className="hidden sm:flex space-x-6 items-center">
              <button
                onClick={() => handleLinkClick('about')}
                className={`text-[11px] uppercase tracking-[0.25em] font-sans transition-colors cursor-pointer relative py-2 ${
                  activeSection === 'about'
                    ? 'text-neutral-950 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-900 font-normal'
                }`}
              >
                <span>Maison</span>
                {activeSection === 'about' && (
                  <motion.div
                    layoutId="active-nav-border"
                    className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-neutral-950"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
              
              <button
                onClick={() => handleLinkClick('contact')}
                className={`text-[11px] uppercase tracking-[0.25em] font-sans transition-colors cursor-pointer relative py-2 ${
                  activeSection === 'contact'
                    ? 'text-neutral-950 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-900 font-normal'
                }`}
              >
                <span>Contact</span>
                {activeSection === 'contact' && (
                  <motion.div
                    layoutId="active-nav-border"
                    className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-neutral-950"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            </div>

            {/* Micro-animated Cart drawer bag with floating bouncy state on count update */}
            <motion.button
              onClick={onOpenCart}
              className="relative p-2 text-neutral-800 hover:text-brand-gold transition-colors cursor-pointer focus:outline-none"
              aria-label="Voir le panier"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingBag className="w-[21px] h-[21px] stroke-[1.25]" />
              {totalCartItems > 0 && (
                <motion.span 
                  key={totalCartItems}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  className="absolute -top-1 -right-1 bg-neutral-950 text-[8px] text-white w-4.5 h-4.5 flex items-center justify-center rounded-full font-mono font-medium shadow-xs"
                >
                  {totalCartItems}
                </motion.span>
              )}
            </motion.button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 -mr-1 md:hidden text-neutral-800 focus:outline-none cursor-pointer"
              aria-label="Menu principal"
            >
              {isOpen ? <X className="w-5.5 h-5.5 stroke-[1.5]" /> : <Menu className="w-5.5 h-5.5 stroke-[1.5]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay and Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-[#faf8f5] shadow-lg border-b border-neutral-200 py-6 px-6 md:hidden z-40 transition-all">
          <div className="flex flex-col space-y-4">
            <button
              onClick={() => handleLinkClick('home')}
              className="flex justify-between items-center text-xs uppercase tracking-widest font-medium py-2 border-b border-neutral-100 text-neutral-800 hover:text-neutral-950 font-sans"
            >
              <span>Collection</span>
              <ChevronRight className="w-4 h-4 text-neutral-500" />
            </button>
            <button
              onClick={() => handleLinkClick('shop')}
              className="flex justify-between items-center text-xs uppercase tracking-widest font-medium py-2 border-b border-neutral-100 text-neutral-800 hover:text-neutral-950 font-sans"
            >
              <span>La Boutique</span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>
            <button
              onClick={() => handleLinkClick('about')}
              className="flex justify-between items-center text-xs uppercase tracking-widest font-medium py-2 border-b border-neutral-100 text-neutral-800 hover:text-neutral-950 font-sans"
            >
              <span>Maison Afaura</span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>
            <button
              onClick={() => handleLinkClick('contact')}
              className="flex justify-between items-center text-xs uppercase tracking-widest font-medium py-2 border-b border-neutral-100 text-neutral-800 hover:text-neutral-950 font-sans"
            >
              <span>Nous Rejoindre</span>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            </button>
            <div className="pt-4 flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500">FR — EUR</span>
              <div className="flex items-center space-x-1.5 text-[10px] font-mono text-neutral-400">
                <span>100% COTON PREMIUM</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
