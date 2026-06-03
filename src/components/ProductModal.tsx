import { useState } from 'react';
import { X, Ruler, Plus, Minus, Check, Star, CornerDownRight, ShieldCheck, Heart } from 'lucide-react';
import { Product, ProductColor } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, color: ProductColor, quantity: number) => void;
}

export default function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImage, setActiveImage] = useState<string>(product.image);
  const [isAdded, setIsAdded] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize, selectedColor, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <div
      id="product-details-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      {/* Animated Dark Overlay backdrop path */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs cursor-pointer"
        onClick={onClose}
      />

      {/* Floating Animated Modal Card wrapper */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="relative bg-[#faf8f5] w-full max-w-4xl shadow-2xl border border-neutral-200/50 rounded-xs overflow-hidden max-h-[90vh] md:max-h-none overflow-y-auto md:overflow-visible z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button top-right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-40 p-2 bg-neutral-900 text-white hover:bg-brand-gold rounded-full transition-colors cursor-pointer shadow-md"
          aria-label="Fermer"
        >
          <X className="w-4.5 h-4.5 stroke-[2]" />
        </button>

        {/* Modal Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Product Images Gallery */}
          <div className="p-6 bg-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-100">
            {/* Active zoomable product image framing */}
            <div className="relative aspect-square w-full bg-neutral-50 overflow-hidden border border-neutral-100/60 mb-4 group/zoom rounded-xs">
              <motion.img
                key={activeImage}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-115 ease-out cursor-zoom-in"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-3 left-3 bg-neutral-950/70 text-[9px] text-[#faf8f5] uppercase font-mono tracking-widest px-2.5 py-0.5 pointer-events-none rounded-xs">
                Survoler pour zoomer
              </span>
            </div>

            {/* Thumbnail Carousel if multiple images exist */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-14 h-14 border relative overflow-hidden bg-neutral-50 cursor-pointer rounded-xs transition-all ${
                      activeImage === img ? 'border-neutral-950 scale-102 shadow-xs' : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}
            
            {/* Textile Guarantee Highlights */}
            <div className="mt-6 pt-4 border-t border-neutral-100 hidden md:block">
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2 text-xs text-neutral-600">
                  <ShieldCheck className="w-4 h-4 text-[#b39a74]" />
                  <span>Coton Éthique durable</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-neutral-600">
                  <Star className="w-4 h-4 text-[#b39a74] fill-[#b39a74] stroke-[1]" />
                  <span>100% Hypoallergénique</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Detailed Product Context & Choice inputs */}
          <div className="p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Product Category and visual like button */}
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-[#b39a74] font-medium">
                  {product.categoryLabel}
                </span>
                <motion.button
                  onClick={() => setIsLiked(!isLiked)}
                  className="text-neutral-400 hover:text-rose-500 transition-colors pointer shadow-xs p-1.5 rounded-full bg-white border border-neutral-100 cursor-pointer"
                  whileTap={{ scale: 0.85 }}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                </motion.button>
              </div>

              {/* Title & Price */}
              <h3 className="text-xl sm:text-2.5xl font-serif text-neutral-900 tracking-tight leading-snug mb-3">
                {product.name}
              </h3>

              {/* Product short status */}
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-lg font-mono font-semibold text-neutral-950">
                  {product.price.toFixed(2)} €
                </span>
                <span className="text-xs font-mono text-neutral-400">TVA incluse</span>
              </div>

              {/* Brief Description */}
              <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed font-light mb-6">
                {product.longDescription}
              </p>

              {/* Textile Specifications Highlights */}
              <div className="p-3.5 bg-white border border-neutral-100 rounded-sm mb-6">
                <h4 className="text-[10px] font-mono uppercase tracking-widest text-[#b39a74] mb-1.5 flex items-center">
                  <CornerDownRight className="w-3 h-3 mr-1" /> Composition & Entretien
                </h4>
                <p className="text-xs text-neutral-700 font-sans leading-relaxed">
                  Tissu : <strong className="font-semibold">{product.fabric}</strong>. Un textile premium d'une haute respirabilité et douceur céleste.
                </p>
                <p className="text-[11px] text-neutral-400 mt-1.5 italic">
                  Lavage délicat à 30°C — Séchage à plat — Repassage doux à l'envers.
                </p>
              </div>

              {/* Colors Choice segment */}
              <div className="mb-6">
                <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 block mb-2.5">
                  Coloris : <span className="text-neutral-900 font-semibold">{selectedColor.name}</span>
                </span>
                <div className="flex items-center space-x-2.5">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c)}
                      className={`w-6 h-6 rounded-full border cursor-pointer relative transition-all ${
                        selectedColor.name === c.name
                          ? 'scale-110 ring-2 ring-offset-2 ring-neutral-400 border-transparent'
                          : 'border-neutral-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-neutral-950 text-white text-[9px] font-mono py-0.5 px-2 rounded-xs whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-md">
                        {c.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sizing & Length section with size guide popover */}
              {product.sizes[0] !== 'Unique' && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400">
                      Longueur Sélectionnée : <span className="text-neutral-900 font-semibold">{selectedSize}</span>
                    </span>
                    <button
                      onClick={() => setShowSizeGuide(!showSizeGuide)}
                      className="text-xs font-sans text-brand-gold hover:text-neutral-900 underline flex items-center transition-colors cursor-pointer"
                    >
                      <Ruler className="w-3.5 h-3.5 mr-1" />
                      Guide de drapillage
                    </button>
                  </div>

                  {/* Size buttons row */}
                  <div className="flex gap-2">
                    {product.sizes.map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className={`px-4 py-2 text-xs font-mono border rounded-xs transition-colors cursor-pointer ${
                          selectedSize === sz
                            ? 'border-neutral-950 bg-neutral-950 text-white font-semibold'
                            : 'border-neutral-200 text-neutral-600 bg-white hover:border-neutral-400'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>

                  {/* Size Guide Context Box */}
                  <AnimatePresence>
                    {showSizeGuide && (
                      <motion.div 
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="mt-3 p-3.5 bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 rounded-sm font-sans leading-relaxed shadow-2xs"
                      >
                        <p className="font-semibold text-neutral-900 mb-1">Nos Recommandations :</p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li><strong>1m60 :</strong> Idéal pour les drapés serrés simples et torsades de tous les jours.</li>
                          <li><strong>1m80 :</strong> Taille universelle standard, assure une couverture de poitrine généreuse.</li>
                          <li><strong>2m00 à 2m10 :</strong> Longueur majestueuse pour drapés sophistiqués multicouches ("layers styles").</li>
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Quantity indicator selection */}
              <div className="mb-6 flex items-center space-x-4">
                <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400">
                  Quantité :
                </span>
                <div className="flex items-center border border-neutral-300 rounded-xs bg-white overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 px-3 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-4 text-xs font-mono font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1.5 px-3 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Complete Add to Cart Button action row */}
            <div className="pt-4 border-t border-neutral-150">
              <motion.button
                onClick={handleAddToCart}
                disabled={isAdded}
                className={`w-full py-4 text-xs uppercase tracking-widest font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center rounded-xs shadow-md ${
                  isAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-950 text-[#faf8f5] hover:bg-brand-gold hover:text-neutral-950'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 mr-2 animate-bounce" />
                    Ajouté au Panier !
                  </>
                ) : (
                  'Ajouter au Panier'
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
