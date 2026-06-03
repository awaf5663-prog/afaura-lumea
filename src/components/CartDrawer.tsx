import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';
import { CartItem } from '../types';
import { motion } from 'motion/react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: CartDrawerProps) {
  const totalCartPrice = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const totalCartQty = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div id="cart-drawer-container" className="fixed inset-0 z-50 overflow-hidden">
      {/* Animated Dark backdrop element */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs cursor-pointer"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Animated Slide-out luxury body panel */}
        <motion.div 
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 280, damping: 28, mass: 0.9 }}
          className="w-screen max-w-md bg-[#faf8f5] shadow-2xl border-l border-neutral-200 flex flex-col h-full relative z-10"
        >
          {/* Header segment with title and close */}
          <div className="px-6 py-5 bg-white border-b border-neutral-100 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <ShoppingBag className="w-5.5 h-5.5 text-neutral-800" />
              <h3 className="text-sm font-serif font-semibold text-neutral-900 tracking-wider uppercase">
                Votre Panier
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full">
                {totalCartQty}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 px-1.5 text-neutral-400 hover:text-neutral-950 transition-colors rounded-full cursor-pointer"
              aria-label="Fermer le panier"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart List section */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <ShoppingBag className="w-12 h-12 text-neutral-200 mb-4 stroke-[1.25]" />
                <h4 className="text-base font-serif text-neutral-800 font-medium tracking-wide">
                  Votre panier est vide
                </h4>
                <p className="text-xs text-neutral-400 mt-2 max-w-xs font-light">
                  Explorez notre boutique Afaura LUMÉA et sélectionnez nos créations modestes de coton premium.
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 px-6 py-2.5 bg-neutral-950 text-white text-[10px] uppercase tracking-widest font-semibold hover:bg-[#b39a74] hover:text-neutral-900 transition-colors cursor-pointer"
                >
                  Continuer mes achats
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white border border-neutral-100/80 p-3.5 rounded-xs flex space-x-4 shadow-sm hover:shadow-md transition-all relative"
                >
                  {/* Item Image */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-50 border border-neutral-100 flex-shrink-0 overflow-hidden relative rounded-xs">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Informative contexts */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      {/* Name of product */}
                      <h4 className="text-xs font-serif font-semibold text-neutral-950 leading-snug line-clamp-1 pr-6">
                        {item.product.name}
                      </h4>

                      {/* Selected configurations */}
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[9px] font-mono text-neutral-500 bg-neutral-50 border border-neutral-100 px-1.5 py-0.5 rounded-xs font-medium">
                          {item.selectedSize}
                        </span>
                        
                        {/* Selected Color swatch and label */}
                        <div className="flex items-center space-x-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-neutral-300 inline-block"
                            style={{ backgroundColor: item.selectedColor.hex }}
                          />
                          <span className="text-[9px]/tight font-mono text-neutral-400 max-w-[80px] truncate">
                            {item.selectedColor.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quantity controls and Price multiplication */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-neutral-200 rounded-xs bg-neutral-50 overflow-hidden">
                        <button
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="p-1 px-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/50 transition-colors cursor-pointer"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="px-2 text-[10px] font-mono font-medium text-neutral-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-1 px-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/50 transition-colors cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      <div className="text-xs font-mono font-semibold text-neutral-900">
                        {(item.product.price * item.quantity).toFixed(2)} €
                      </div>
                    </div>
                  </div>

                  {/* Remove absolute button */}
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="absolute top-2.5 right-2 text-neutral-400 hover:text-rose-600 transition-colors p-1.5 cursor-pointer rounded-full hover:bg-rose-50"
                    title="Retirer du panier"
                  >
                    <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                  </button>
                </motion.div>
              ))
            )}
          </div>

          {/* Subtotal and checkout segment */}
          {cart.length > 0 && (
            <div className="p-6 bg-white border-t border-neutral-150 space-y-4">
              {/* Checkout visual guarantees */}
              <div className="flex items-center justify-center space-x-2 text-[9px] uppercase font-mono tracking-wider text-neutral-500 py-1.5 border-b border-dashed border-neutral-100 mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Livraison offerte dès 80€ d'achats</span>
              </div>

              {/* Price list details */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>Sous-total articles :</span>
                  <span className="font-mono">{totalCartPrice.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>Frais de port :</span>
                  <span className="font-mono text-emerald-600">
                    {totalCartPrice >= 80 ? 'Gratuit' : '4.90 €'}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm text-neutral-900 pt-3 border-t border-neutral-100">
                  <span className="font-serif font-semibold">Total estimatif :</span>
                  <span className="font-mono font-bold text-base text-neutral-950">
                    {(totalCartPrice + (totalCartPrice >= 80 ? 0 : 4.9)).toFixed(2)} €
                  </span>
                </div>
              </div>

              {/* Action buttons triggers with scale spring taps */}
              <div className="space-y-2 pt-2">
                <motion.button
                  onClick={onCheckout}
                  className="w-full py-3.5 bg-neutral-950 text-[#faf8f5] hover:bg-[#b39a74] hover:text-neutral-950 text-[10px] font-semibold uppercase tracking-widest transition-colors duration-300 flex items-center justify-center group cursor-pointer rounded-xs"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Passer la Commande
                  <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1.5 transition-transform duration-300" />
                </motion.button>
                
                <button
                  onClick={onClose}
                  className="w-full py-2 bg-transparent text-neutral-400 hover:text-neutral-900 text-[10px] uppercase tracking-widest text-center transition-colors cursor-pointer font-sans"
                >
                  Continuer la Visite Boutique
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
