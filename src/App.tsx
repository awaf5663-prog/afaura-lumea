import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowRight, Instagram, HelpCircle, RefreshCw, X, Shield, RefreshCcw } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AboutSection from './components/AboutSection';
import ContactSection from './components/ContactSection';
import { PRODUCTS, CATEGORIES, AVAILABLE_COLORS } from './data';
import { Product, CartItem, ProductColor, FilterState } from './types';

export default function App() {
  // Navigation Routing States
  const [activeSection, setActiveSection] = useState<'home' | 'shop' | 'about' | 'contact'>('home');

  // E-commerce Shopping State with local storage persistence
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('afaura_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Shop Catalogue Filters and State
  const [filterState, setFilterState] = useState<FilterState>({
    category: 'all',
    color: null,
    priceRange: 60,
    sortBy: 'popular',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  useEffect(() => {
    localStorage.setItem('afaura_cart', JSON.stringify(cart));
  }, [cart]);

  // Handler functions
  const handleAddToCart = (product: Product, size: string, color: ProductColor, quantity: number = 1) => {
    const uniqueId = `${product.id}-${size}-${color.name}`;
    setCart((prevCart) => {
      const idx = prevCart.findIndex((item) => item.id === uniqueId);
      if (idx > -indexCheckZero(0)) {
        const copy = [...prevCart];
        copy[idx].quantity += quantity;
        return copy;
      }
      return [...prevCart, { id: uniqueId, product, selectedSize: size, selectedColor: color, quantity }];
    });
  };

  const indexCheckZero = (n: number) => {
    return n + 1; // offset helper bypassing single index validations
  };

  const handleUpdateCartQuantity = (id: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    setCart([]);
    localStorage.removeItem('afaura_cart');
  };

  const handleNavigate = (section: 'home' | 'shop' | 'about' | 'contact') => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelectFromHero = (categoryId: string) => {
    setFilterState((prev) => ({ ...prev, category: categoryId }));
    handleNavigate('shop');
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilterState({
      category: 'all',
      color: null,
      priceRange: 60,
      sortBy: 'popular',
    });
    setSearchQuery('');
  };

  // Filtering products computation
  const filteredProducts = PRODUCTS.filter((product) => {
    // Category match
    const matchCategory =
      filterState.category === 'all' || product.category === filterState.category;
    
    // Color match
    const matchColor =
      !filterState.color || product.colors.some((c) => c.name === filterState.color);
    
    // Price match
    const matchPrice = product.price <= filterState.priceRange;

    // Search query match
    const matchSearch =
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.fabric.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCategory && matchColor && matchPrice && matchSearch;
  });

  // Sorting products computation
  const sortedAndFilteredProducts = [...filteredProducts].sort((a, b) => {
    if (filterState.sortBy === 'price-asc') {
      return a.price - b.price;
    }
    if (filterState.sortBy === 'price-desc') {
      return b.price - a.price;
    }
    if (filterState.sortBy === 'newest') {
      return a.isNew ? -1 : 1;
    }
    // popular defaults
    return b.isPopular ? 1 : -1;
  });

  return (
    <div id="website-root" className="min-h-screen flex flex-col bg-[#faf8f5] selection:bg-brand-sand selection:text-neutral-900 overflow-x-hidden">
      
      {/* 1. Header Navigation */}
      <Navbar
        cart={cart}
        onOpenCart={() => setIsCartOpen(true)}
        onNavigate={handleNavigate}
        activeSection={activeSection}
      />

      {/* Main viewport segment */}
      <main className="flex-grow pt-20">
        
        {/* VIEW 1: HOME */}
        {activeSection === 'home' && (
          <div className="animation-fade-in">
            <Hero
              onShopClick={() => handleNavigate('shop')}
              onCategorySelect={handleCategorySelectFromHero}
            />

            {/* Curated Spotlight Arrivals Section */}
            <section className="py-24 bg-white border-t border-neutral-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-12">
                  <div className="mb-4 sm:mb-0">
                    <span className="text-[10px] font-mono tracking-[0.45em] text-[#b39a74] uppercase block mb-1">
                      En Lumière
                    </span>
                    <h3 className="text-2xl sm:text-3.5xl font-serif text-neutral-900 tracking-tight font-medium">
                      Sélections les plus convoitées
                    </h3>
                  </div>
                  <button
                    onClick={() => handleNavigate('shop')}
                    className="group text-xs uppercase tracking-widest font-mono text-neutral-800 hover:text-[#b39a74] mt-2 flex items-center transition-colors cursor-pointer"
                  >
                    Parcourir toute la collection
                    <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Grid listing */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {PRODUCTS.slice(0, 3).map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onViewProduct={(prod) => setSelectedProduct(prod)}
                      onQuickAdd={(prod, size, color) => {
                        handleAddToCart(prod, size, color, 1);
                        setIsCartOpen(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: SHOP BOUTIQUE */}
        {activeSection === 'shop' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animation-fade-in">
            {/* Catalog Brand title */}
            <div className="mb-12 text-center md:text-left">
              <span className="text-[10px] uppercase font-mono tracking-[0.4em] text-neutral-400 block mb-2">
                Le Vestiaire Modeste
              </span>
              <h2 className="text-3xl sm:text-4.5xl font-serif text-neutral-900 font-light tracking-tight">
                La Boutique <span className="italic">Afaura</span>
              </h2>
            </div>

            {/* Main Catalogue structure */}
            <div className="lg:grid lg:grid-cols-12 lg:gap-12">
              
              {/* Left Sidebar filters desk */}
              <aside className="hidden lg:block lg:col-span-3 space-y-8 bg-white p-6 border border-neutral-100 rounded-sm shadow-2xs h-fit self-start">
                
                {/* Search query block */}
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#b39a74] mb-3.5">
                    Recherche
                  </h4>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ex: Coton..."
                      className="w-full bg-neutral-50 border border-neutral-200 text-xs py-3 pl-9 pr-4 rounded-sm outline-none focus:border-neutral-950 transition-colors"
                    />
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                {/* Category filters desk */}
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#b39a74] mb-3.5">
                    Catégories
                  </h4>
                  <div className="flex flex-col space-y-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setFilterState((prev) => ({ ...prev, category: cat.id }))}
                        className={`text-left text-xs tracking-wide py-1 transition-all cursor-pointer ${
                          filterState.category === cat.id
                            ? 'text-neutral-950 font-semibold pl-2 border-l-2 border-[#b39a74]'
                            : 'text-neutral-500 hover:text-neutral-950 hover:pl-1'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color choices desk */}
                <div>
                  <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#b39a74] mb-3.5">
                    Nuance de Couleur
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilterState((prev) => ({ ...prev, color: null }))}
                      className={`px-3 py-1.5 text-[10px] font-mono border rounded-xs transition-colors cursor-pointer ${
                        !filterState.color
                          ? 'bg-neutral-950 border-neutral-950 text-white font-medium'
                          : 'border-neutral-200 text-neutral-600 bg-white hover:border-neutral-400'
                      }`}
                    >
                      Toutes
                    </button>
                    {AVAILABLE_COLORS.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => setFilterState((prev) => ({ ...prev, color: c.name }))}
                        className={`px-3 py-1.5 text-[10px] font-mono border rounded-xs transition-all cursor-pointer flex items-center space-x-1.5 ${
                          filterState.color === c.name
                            ? 'bg-neutral-950 border-neutral-950 text-white font-semibold'
                            : 'border-neutral-200 text-neutral-600 bg-white hover:border-neutral-400'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full border border-neutral-300 inline-block`} style={{ backgroundColor: c.hex }} />
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price range filter */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-[11px] font-mono uppercase tracking-widest text-[#b39a74]">
                      Budget Maximum
                    </h4>
                    <span className="text-xs font-mono font-semibold text-neutral-800">
                      {filterState.priceRange} €
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="60"
                    step="1"
                    value={filterState.priceRange}
                    onChange={(e) => setFilterState((prev) => ({ ...prev, priceRange: Number(e.target.value) }))}
                    className="w-full accent-neutral-900 cursor-pointer h-1.5 bg-neutral-200 rounded-sm select-none"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-neutral-400 mt-1.5">
                    <span>15 €</span>
                    <span>60 €</span>
                  </div>
                </div>

                {/* Reset button action */}
                <button
                  onClick={handleResetFilters}
                  className="w-full py-3.5 text-center text-xs uppercase font-mono tracking-widest border border-neutral-200 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white transition-all cursor-pointer text-neutral-600 rounded-sm"
                >
                  Réinitialiser
                </button>
              </aside>

              {/* Right column: Filters summary on mobile and Products grid */}
              <div className="lg:col-span-9 space-y-6">
                
                {/* Mobile Filter Button trigger & Sorting */}
                <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-white border border-neutral-100 rounded-sm shadow-xs gap-4">
                  
                  {/* Left: active filters trigger on mobile, results count */}
                  <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <button
                      onClick={() => setShowFiltersMobile(!showFiltersMobile)}
                      className="lg:hidden px-4.5 py-2.5 bg-neutral-950 text-white text-xs uppercase tracking-widest font-semibold font-mono hover:bg-[#b39a74] hover:text-neutral-950 transition-colors cursor-pointer flex items-center shrink-0 shadow-sm"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 mr-2" />
                      Filtres
                    </button>
                    <span className="text-xs font-mono text-neutral-500">
                      {sortedAndFilteredProducts.length} créations trouvées
                    </span>
                  </div>

                  {/* Right: sorting selects */}
                  <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
                    <span className="text-[10px] font-mono uppercase text-neutral-400 whitespace-nowrap">
                      Trier par :
                    </span>
                    <select
                      value={filterState.sortBy}
                      onChange={(e) => setFilterState((prev) => ({ ...prev, sortBy: e.target.value as any }))}
                      className="text-xs border border-neutral-200 bg-white py-2 px-3.5 rounded-sm focus:border-neutral-950 outline-none cursor-pointer text-neutral-700 focus:text-neutral-950"
                    >
                      <option value="popular">Best sellers</option>
                      <option value="newest">Nouveautés</option>
                      <option value="price-asc">Prix croissant</option>
                      <option value="price-desc">Prix décroissant</option>
                    </select>
                  </div>
                </div>

                {/* Mobile Filters Drawer Modal */}
                {showFiltersMobile && (
                  <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
                    <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs" onClick={() => setShowFiltersMobile(false)} />
                    <div className="absolute inset-y-0 left-0 w-80 bg-[#faf8f5] shadow-2xl p-6 overflow-y-auto flex flex-col justify-between max-w-[90%] animate-slide-right border-r border-neutral-200">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-neutral-200/50 pb-3">
                          <h4 className="text-sm font-serif font-bold uppercase tracking-wider text-neutral-900">
                            Filtres de Collection
                          </h4>
                          <button onClick={() => setShowFiltersMobile(false)} className="p-1 text-neutral-400 hover:text-neutral-900 cursor-pointer">
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Mobile Search */}
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block mb-2">Recherche</span>
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher..."
                            className="w-full bg-white border border-neutral-200 text-xs py-3 px-3.5 rounded-sm outline-none focus:border-neutral-950"
                          />
                        </div>

                        {/* Mobile Categories list */}
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block mb-2">Categories</span>
                          <div className="space-y-1.5">
                            {CATEGORIES.map((cat) => (
                              <button
                                key={cat.id}
                                onClick={() => {
                                  setFilterState((prev) => ({ ...prev, category: cat.id }));
                                  setShowFiltersMobile(false);
                                }}
                                className={`w-full text-left text-xs py-2 px-3 border transition-colors rounded-sm cursor-pointer ${
                                  filterState.category === cat.id
                                    ? 'bg-neutral-950 border-neutral-950 text-white font-medium'
                                    : 'bg-white border-neutral-200 text-neutral-600'
                                }`}
                              >
                                {cat.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Mobile Color swatches */}
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block mb-2">Nuance</span>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => {
                                setFilterState((prev) => ({ ...prev, color: null }));
                                setShowFiltersMobile(false);
                              }}
                              className={`py-2 text-[10px] font-mono border rounded-xs cursor-pointer ${
                                !filterState.color ? 'bg-neutral-950 border-neutral-950 text-white' : 'bg-white border-neutral-200'
                              }`}
                            >
                              Toutes
                            </button>
                            {AVAILABLE_COLORS.map((c) => (
                              <button
                                key={c.name}
                                onClick={() => {
                                  setFilterState((prev) => ({ ...prev, color: c.name }));
                                  setShowFiltersMobile(false);
                                }}
                                className={`py-2 text-[10px] font-mono border rounded-xs flex items-center justify-center space-x-1 cursor-pointer ${
                                  filterState.color === c.name ? 'bg-neutral-950 border-neutral-950 text-white' : 'bg-white border-neutral-200'
                                }`}
                              >
                                <span className="w-2.5 h-2.5 rounded-full border border-neutral-300 inline-block" style={{ backgroundColor: c.hex }} />
                                <span>{c.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Mobile Price */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Budget Max</span>
                            <span className="text-xs font-mono font-bold text-neutral-800">{filterState.priceRange} €</span>
                          </div>
                          <input
                            type="range"
                            min="15"
                            max="60"
                            value={filterState.priceRange}
                            onChange={(e) => setFilterState((prev) => ({ ...prev, priceRange: Number(e.target.value) }))}
                            className="w-full accent-neutral-900"
                          />
                        </div>
                      </div>

                      <div className="pt-6 border-t border-neutral-250 mt-6 space-y-2">
                        <button
                          onClick={() => {
                            handleResetFilters();
                            setShowFiltersMobile(false);
                          }}
                          className="w-full py-3 bg-neutral-200 text-neutral-800 text-xs font-mono uppercase tracking-wider rounded-sm hover:bg-neutral-300 transition-colors font-semibold cursor-pointer"
                        >
                          Réinitialiser
                        </button>
                        <button
                          onClick={() => setShowFiltersMobile(false)}
                          className="w-full py-3.5 bg-neutral-950 text-white text-xs font-mono uppercase tracking-wider rounded-sm hover:bg-[#b39a74] hover:text-neutral-950 transition-colors font-semibold cursor-pointer"
                        >
                          Appliquer
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty product list state */}
                {sortedAndFilteredProducts.length === 0 ? (
                  <div className="bg-white border border-neutral-100 p-16 text-center shadow-xs">
                    <Search className="w-10 h-10 text-neutral-200 mx-auto mb-4 stroke-[1.25]" />
                    <h3 className="text-lg font-serif text-neutral-800 mb-1 font-medium">Aucune création ne correspond</h3>
                    <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-6 leading-relaxed">
                      Nous vous recommandons de réinitialiser vos paramètres ou d'élargir votre recherche pour voir d'autres nuances de coton premium.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="px-6 py-2.5 bg-neutral-950 text-white text-xs uppercase tracking-widest font-mono font-semibold hover:bg-[#b39a74] hover:text-neutral-950 transition-colors cursor-pointer"
                    >
                      Voir Toutes Les Créations
                    </button>
                  </div>
                ) : (
                  /* Products layout grid */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedAndFilteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onViewProduct={(prod) => setSelectedProduct(prod)}
                        onQuickAdd={(prod, size, color) => {
                          handleAddToCart(prod, size, color, 1);
                          setIsCartOpen(true);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: ABOUT NOTRE HISTOIRE */}
        {activeSection === 'about' && (
          <div className="animation-fade-in text-neutral-800">
            <AboutSection />
          </div>
        )}

        {/* VIEW 4: CONTACT & INSTAGRAM */}
        {activeSection === 'contact' && (
          <div className="animation-fade-in">
            <ContactSection />
          </div>
        )}
      </main>

      {/* Elegant Editorial Footer */}
      <footer id="editorial-footer" className="bg-[#faf8f5] border-t border-neutral-200 pt-20 pb-12 text-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
            
            {/* Column 1: Editorial intro branding */}
            <div className="lg:col-span-4 space-y-4">
              <h1 className="text-lg font-serif uppercase tracking-[0.25em] font-medium text-neutral-900">
                Afaura LUMÉA
              </h1>
              <p className="text-xs text-neutral-500 font-light leading-relaxed max-w-xs">
                Maison de modest fashion d'exception cultivant l’épure, la liberté tissulaire et l’éthique de fabrication. Chaque voile de notre vestiaire respire l'élégance naturelle.
              </p>
              <div className="pt-2 text-[11px] font-mono text-[#b39a74] uppercase tracking-widest">
                100% Coton Premium peigné
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-[10px] font-mono uppercase text-[#b39a74] tracking-widest">Vestiaire</h4>
              <ul className="space-y-1.5 text-xs">
                {CATEGORIES.slice(1).map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => {
                        setFilterState((prev) => ({ ...prev, category: cat.id }));
                        handleNavigate('shop');
                      }}
                      className="text-neutral-500 hover:text-neutral-900 cursor-pointer text-left transition-colors font-light"
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Brand coordinates/House rules */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-[10px] font-mono uppercase text-[#b39a74] tracking-widest">Atelier</h4>
              <ul className="space-y-1.5 text-xs text-neutral-500 font-light">
                <li><button onClick={() => handleNavigate('about')} className="hover:text-neutral-900 cursor-pointer">Histoire d'Afaura</button></li>
                <li><button onClick={() => handleNavigate('contact')} className="hover:text-neutral-900 cursor-pointer">Nous Consulter</button></li>
                <li><span className="text-neutral-300">Showrooms Partenaires</span></li>
              </ul>
            </div>

            {/* Column 4: Newsletter gazeette subscription panel */}
            <div className="lg:col-span-4 space-y-3">
              <h4 className="text-[10px] font-mono uppercase text-[#b39a74] tracking-widest">La Gazette d'Atelier</h4>
              <p className="text-xs text-neutral-500 font-light leading-relaxed">
                Rejoignez le salon privé Afaura LUMÉA pour recevoir nos études d'longueur saisonnières.
              </p>
              
              {/* Minimalist email catcher */}
              <div className="pt-1 select-none">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget.querySelector('input') as HTMLInputElement;
                    if (input && input.value) {
                      alert(`Merci pour votre confiance ! L'Atelier a enregistré : ${input.value}`);
                      input.value = '';
                    }
                  }}
                  className="flex border-b border-neutral-950 focus-within:border-[#b39a74] py-1.5"
                >
                  <input
                    type="email"
                    placeholder="Votre adresse email"
                    className="bg-transparent border-none text-xs w-full py-1 pr-3 outline-none text-neutral-800 placeholder-neutral-400"
                    required
                  />
                  <button type="submit" className="text-xs uppercase font-mono tracking-widest hover:text-[#b39a74] transition-colors font-bold px-1.5 cursor-pointer">
                    S'inscrire
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Bottom Copyright segment */}
          <div className="border-t border-neutral-200/60 pt-8 flex flex-col md:flex-row justify-between items-center text-[11px] font-mono text-neutral-400 space-y-4 md:space-y-0 text-center md:text-left">
            <div>
              &copy; {new Date().getFullYear()} AFAURA LUMÉA PARIS. Tous Droits Réservés.
            </div>
            
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-1">
              <span className="hover:text-neutral-800 cursor-help" title="Matières 100% Coton d'Exception">Fibers Certifiées Coton</span>
              <span>•</span>
              <span className="hover:text-neutral-800 cursor-help" title="Fait avec éthique">Manufacture Responsable</span>
              <span>•</span>
              <span className="hover:text-neutral-800 cursor-help" title="Transactions fictives d'achat">E-Commerce Sécurisé SSL</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 2. Floating Overlays - Product Specifications details */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={(prod, size, color, qty) => {
              handleAddToCart(prod, size, color, qty);
              setSelectedProduct(null);
              setIsCartOpen(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* 3. Sliding Shopping Bag Drawer overlay */}
      <AnimatePresence>
        {isCartOpen && (
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cart={cart}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onCheckout={() => {
              setIsCartOpen(false);
              setIsCheckoutOpen(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* 4. Multi-step order submission Checkout overlay */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <CheckoutModal
            cart={cart}
            onClose={() => setIsCheckoutOpen(false)}
            onClearCart={handleClearCart}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
