import React, { useState } from 'react';
import { Eye, ShoppingBag } from 'lucide-react';
import { Product, ProductColor } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ProductCardProps {
  product: Product;
  onViewProduct: (product: Product) => void;
  onQuickAdd?: (product: Product, size: string, color: ProductColor) => void;
  key?: string | number;
}

export default function ProductCard({ product, onViewProduct, onQuickAdd }: ProductCardProps) {
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0]);
  const [isHovered, setIsHovered] = useState(false);

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickAdd) {
      onQuickAdd(product, selectedSize, selectedColor);
    }
  };

  // Spring animation definitions for quiet-luxury micro tactile feedback
  const cardSpringConfig = { stiffness: 260, damping: 24 };

  return (
    <motion.div
      id={`product-card-${product.id}`}
      className="group relative flex flex-col bg-white border border-neutral-100/70 shadow-xs hover:border-neutral-200/50 rounded-sm overflow-hidden h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ 
        y: -4,
        boxShadow: "0 15px 30px -10px rgba(18, 18, 18, 0.08)"
      }}
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      {/* Visual Image Frame Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-50 flex items-center justify-center">
        {/* Badge Labels with stagger */}
        <div className="absolute top-3 left-3 z-20 flex flex-col space-y-1">
          {product.isNew && (
            <motion.span 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="px-2 py-0.5 bg-neutral-900 text-[#faf8f5] text-[9px] uppercase font-mono tracking-widest rounded-xs"
            >
              Nouveau
            </motion.span>
          )}
          {product.isPopular && (
            <motion.span 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="px-2 py-0.5 bg-brand-gold text-neutral-950 text-[9px] uppercase font-mono tracking-widest font-medium rounded-xs"
            >
              Populaire
            </motion.span>
          )}
        </div>

        {/* Product image with zoom & minor slow pan on hover */}
        <motion.img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center pointer-events-none"
          animate={{
            scale: isHovered ? 1.06 : 1,
            y: isHovered ? -3 : 0
          }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          referrerPolicy="no-referrer"
        />

        {/* Elegant Dark Luxury Overlay triggered smoothly on hover */}
        <motion.div 
          className="absolute inset-0 bg-neutral-950/15 z-10 flex items-center justify-center space-x-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {/* Details View Button */}
          <motion.button
            onClick={() => onViewProduct(product)}
            className="p-3 bg-brand-cream text-neutral-900 rounded-full hover:bg-neutral-950 hover:text-white transition-colors duration-300 cursor-pointer shadow-md"
            title="Détails du produit"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.90 }}
            transition={{ type: "spring", ...cardSpringConfig }}
          >
            <Eye className="w-4.5 h-4.5 stroke-[1.5]" />
          </motion.button>
          
          {/* Active Quick Add Button */}
          {product.sizes[0] !== 'Unique' && (
            <motion.button
              onClick={handleQuickAddClick}
              className="p-3 bg-brand-gold text-neutral-950 rounded-full hover:bg-neutral-950 hover:text-[#faf8f5] transition-colors duration-300 cursor-pointer shadow-md"
              title="Ajout rapide"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.90 }}
              transition={{ type: "spring", ...cardSpringConfig }}
            >
              <ShoppingBag className="w-4.5 h-4.5 stroke-[1.5]" />
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Details Typography Box */}
      <div className="p-5 flex flex-col flex-grow bg-white">
        {/* Category Description Tag */}
        <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gold mb-1 leading-none">
          {product.categoryLabel}
        </span>

        {/* Product name & price row */}
        <div className="flex justify-between items-start mb-1.5">
          <h4
            className="text-sm font-serif font-medium text-neutral-900 hover:text-brand-gold cursor-pointer transition-colors leading-snug"
            onClick={() => onViewProduct(product)}
          >
            {product.name}
          </h4>
          <span className="text-xs sm:text-sm font-mono font-medium text-neutral-800 ml-2 whitespace-nowrap">
            {product.price.toFixed(2)} €
          </span>
        </div>

        {/* Short fabric description */}
        <p className="text-xs text-neutral-400 font-light mb-4 line-clamp-1 leading-relaxed">
          {product.fabric}
        </p>

        {/* Sizes & Lengths panel preview */}
        <div className="mt-auto space-y-4">
          {product.sizes[0] !== 'Unique' && (
            <div className="flex flex-wrap items-center gap-1 pt-1">
              <span className="text-[10px] font-mono text-neutral-400 mr-2 uppercase tracking-wide">Long :</span>
              {product.sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(sz);
                  }}
                  className={`px-2 py-0.5 text-[9px] font-mono border rounded-xs transition-colors cursor-pointer ${
                    selectedSize === sz
                      ? 'border-neutral-950 bg-neutral-950 text-[#faf8f5]'
                      : 'border-neutral-200 text-neutral-500 hover:border-neutral-400 hover:bg-neutral-50/50'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          )}

          {/* Color choice swatches preview & Details Link */}
          <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
            <div className="flex items-center space-x-1.5">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedColor(c);
                  }}
                  className={`w-3.5 h-3.5 rounded-full ${c.bgClass} border cursor-pointer relative group/color transition-all duration-300 ${
                    selectedColor.name === c.name
                      ? 'scale-125 ring-1 ring-offset-2 ring-neutral-400 border-transparent'
                      : 'border-neutral-200 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {/* Micro-tooltip description on hover */}
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-neutral-900 text-[#faf8f5] text-[8px] font-mono py-0.5 px-2 rounded-xs whitespace-nowrap opacity-0 group-hover/color:opacity-100 transition-opacity pointer-events-none z-30 shadow-md">
                    {c.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Quick Discover Chevron */}
            <button
              onClick={() => onViewProduct(product)}
              className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer group/link flex items-center space-x-1 font-medium"
            >
              <span>Découvrir</span>
              <span className="group-hover/link:translate-x-1 transition-transform inline-block">→</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
