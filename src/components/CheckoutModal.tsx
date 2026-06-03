import React, { useState } from 'react';
import { X, Check, CreditCard, ChevronRight, Sparkles, ShoppingBag, Truck, ArrowLeft } from 'lucide-react';
import { CartItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface CheckoutModalProps {
  cart: CartItem[];
  onClose: () => void;
  onClearCart: () => void;
}

export default function CheckoutModal({ cart, onClose, onClearCart }: CheckoutModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [shippingForm, setShippingForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    zip: '',
    city: '',
    country: 'France'
  });
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvv: ''
  });
  const [formErrors, setFormErrors] = useState<string>('');

  const cartSubtotal = cart.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);
  const shippingCost = cartSubtotal >= 80 ? 0 : 4.9;
  const orderTotal = cartSubtotal + shippingCost;

  // Validation functions
  const validateShipping = () => {
    const { firstName, lastName, email, phone, address, zip, city } = shippingForm;
    if (!firstName || !lastName || !email || !phone || !address || !zip || !city) {
      setFormErrors('Veuillez remplir tous les champs obligatoires.');
      return false;
    }
    if (!email.includes('@')) {
      setFormErrors('Veuillez entrer une adresse e-mail valide.');
      return false;
    }
    setFormErrors('');
    return true;
  };

  const validatePayment = () => {
    const { cardNumber, cardName, expiry, cvv } = paymentForm;
    if (!cardNumber || !cardName || !expiry || !cvv) {
      setFormErrors('Veuillez renseigner toutes les informations de paiement.');
      return false;
    }
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setFormErrors('Numéro de carte bancaire incomplet.');
      return false;
    }
    if (cvv.length < 3) {
      setFormErrors('Cryptogramme visuel (CVV) invalide.');
      return false;
    }
    setFormErrors('');
    return true;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (validateShipping()) {
        setStep(2);
      }
    } else if (step === 2) {
      if (validatePayment()) {
        setStep(3);
      }
    }
  };

  const handleFinish = () => {
    onClearCart();
    onClose();
  };

  // Live card format helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) formattedValue += ' ';
      formattedValue += value[i];
    }
    setPaymentForm({ ...paymentForm, cardNumber: formattedValue.slice(0, 19) });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      setPaymentForm({ ...paymentForm, expiry: value.slice(0, 2) + '/' + value.slice(2, 4) });
    } else {
      setPaymentForm({ ...paymentForm, expiry: value.slice(0, 4) });
    }
  };

  return (
    <div
      id="checkout-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      {/* Animated Dark Overlay backdrop path */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs cursor-pointer"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        transition={{ type: "spring", stiffness: 300, damping: 26 }}
        className="bg-[#faf8f5] w-full max-w-4xl shadow-2xl border border-neutral-200 rounded-xs overflow-hidden max-h-[92vh] flex flex-col md:flex-row relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: Step execution context */}
        <div className="flex-grow p-6 sm:p-8 overflow-y-auto max-h-[60vh] md:max-h-none">
          {/* Header step guide */}
          <div className="flex items-center space-x-2.5 mb-6">
            <span className={`text-[10px] font-mono tracking-wider font-semibold rounded-full w-5 h-5 flex items-center justify-center ${step >= 1 ? 'bg-neutral-950 text-white' : 'bg-neutral-200 text-neutral-600'}`}>1</span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#b39a74]">Livraison</span>
            <ChevronRight className="w-3 h-3 text-neutral-350" />
            <span className={`text-[10px] font-mono tracking-wider font-semibold rounded-full w-5 h-5 flex items-center justify-center ${step >= 2 ? 'bg-neutral-950 text-white' : 'bg-neutral-200 text-neutral-600'}`}>2</span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#b39a74]">Paiement</span>
            <ChevronRight className="w-3 h-3 text-neutral-350" />
            <span className={`text-[10px] font-mono tracking-wider font-semibold rounded-full w-5 h-5 flex items-center justify-center ${step >= 3 ? 'bg-neutral-950 text-white' : 'bg-neutral-200 text-neutral-600'}`}>3</span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#b39a74]">Reçu</span>
          </div>

          <AnimatePresence mode="wait">
            {formErrors && (
              <motion.div 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xs mb-4 leading-relaxed"
              >
                {formErrors}
              </motion.div>
            )}
          </AnimatePresence>

          {/* STEP 1: Shipping form */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-serif text-neutral-900 tracking-tight mb-4">
                Informations de Livraison
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Prénom *</label>
                  <input
                    type="text"
                    value={shippingForm.firstName}
                    onChange={(e) => setShippingForm({ ...shippingForm, firstName: e.target.value })}
                    className="w-full bg-white border border-neutral-200 text-xs px-3.5 py-3.5 rounded-xs outline-none focus:border-neutral-950"
                    placeholder="Sarah"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Nom de famille *</label>
                  <input
                    type="text"
                    value={shippingForm.lastName}
                    onChange={(e) => setShippingForm({ ...shippingForm, lastName: e.target.value })}
                    className="w-full bg-white border border-neutral-200 text-xs px-3.5 py-3.5 rounded-xs outline-none focus:border-neutral-950"
                    placeholder="Mansouri"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Adresse e-mail *</label>
                  <input
                    type="email"
                    value={shippingForm.email}
                    onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                    className="w-full bg-white border border-neutral-200 text-xs px-3.5 py-3.5 rounded-xs outline-none focus:border-neutral-950"
                    placeholder="sarah.m@domain.com"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Numéro de téléphone *</label>
                  <input
                    type="tel"
                    value={shippingForm.phone}
                    onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                    className="w-full bg-white border border-neutral-200 text-xs px-3.5 py-3.5 rounded-xs outline-none focus:border-neutral-950"
                    placeholder="+33 6 12 34 56 78"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Adresse résidentielle *</label>
                  <input
                    type="text"
                    value={shippingForm.address}
                    onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                    className="w-full bg-white border border-neutral-200 text-xs px-3.5 py-3.5 rounded-xs outline-none focus:border-neutral-950"
                    placeholder="12 Avenue Montaigne"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Code postal *</label>
                  <input
                    type="text"
                    value={shippingForm.zip}
                    onChange={(e) => setShippingForm({ ...shippingForm, zip: e.target.value })}
                    className="w-full bg-white border border-neutral-200 text-xs px-3.5 py-3.5 rounded-xs outline-none focus:border-neutral-950"
                    placeholder="75008"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Ville *</label>
                  <input
                    type="text"
                    value={shippingForm.city}
                    onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                    className="w-full bg-white border border-neutral-200 text-xs px-3.5 py-3.5 rounded-xs outline-none focus:border-neutral-950"
                    placeholder="Paris"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Pays</label>
                  <select
                    value={shippingForm.country}
                    onChange={(e) => setShippingForm({ ...shippingForm, country: e.target.value })}
                    className="w-full bg-white border border-neutral-200 text-xs px-3.5 py-3.5 rounded-xs outline-none focus:border-neutral-950 cursor-pointer"
                  >
                    <option value="France">France</option>
                    <option value="Belgique">Belgique</option>
                    <option value="Suisse">Suisse</option>
                    <option value="Luxembourg">Luxembourg</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-between">
                <button
                  onClick={onClose}
                  className="px-6 py-3.5 border border-neutral-200 text-neutral-600 text-[10px] uppercase tracking-widest font-semibold hover:border-neutral-900 hover:text-neutral-950 transition-colors cursor-pointer rounded-xs"
                >
                  Retour
                </button>
                <motion.button
                  onClick={handleNextStep}
                  className="px-8 py-3.5 bg-neutral-950 text-white text-[10px] uppercase tracking-widest font-semibold hover:bg-brand-gold hover:text-neutral-950 transition-colors cursor-pointer flex items-center rounded-xs shadow-md"
                  whileTap={{ scale: 0.98 }}
                >
                  Procéder au Paiement
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Secure Payment details */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <button
                  onClick={() => setStep(1)}
                  className="p-1 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer text-neutral-600"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h3 className="text-xl font-serif text-neutral-900 tracking-tight">
                  Paiement Sécurisé
                </h3>
              </div>

              {/* Sophisticated Credential Card Overlay widget */}
              <div className="relative h-44 w-full max-w-sm mx-auto bg-neutral-900 rounded-lg p-5 text-white flex flex-col justify-between shadow-lg overflow-hidden mb-6 font-mono border border-neutral-800">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#b39a74]/15 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex justify-between items-center z-12">
                  <span className="text-[9px] uppercase tracking-widest font-light text-white/50">AFAURA LUMÉA VIP</span>
                  <CreditCard className="w-7 h-7 text-[#b39a74]" />
                </div>

                <div className="text-sm sm:text-base tracking-wider text-white/90 z-12 py-2">
                  {paymentForm.cardNumber || '•••• •••• •••• ••••'}
                </div>

                <div className="flex justify-between items-end z-12">
                  <div className="min-w-0">
                    <span className="text-[7px] text-white/40 block uppercase">Titulaire</span>
                    <span className="text-xs tracking-wider uppercase truncate max-w-[150px] inline-block mt-0.5 font-medium">
                      {paymentForm.cardName || 'SARAH MANSOURI'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[7px] text-white/40 block uppercase">Expire</span>
                    <span className="text-xs tracking-wider inline-block mt-0.5 font-medium">
                      {paymentForm.expiry || 'MM/AA'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Input parameters */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Nom sur la Carte *</label>
                  <input
                    type="text"
                    value={paymentForm.cardName}
                    onChange={(e) => setPaymentForm({ ...paymentForm, cardName: e.target.value.toUpperCase() })}
                    className="w-full bg-white border border-neutral-200 text-xs px-3.5 py-3.5 rounded-xs outline-none focus:border-neutral-950 uppercase"
                    placeholder="SARAH MANSOURI"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Numéro de carte bancaire *</label>
                  <input
                    type="text"
                    value={paymentForm.cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full bg-white border border-neutral-200 text-xs px-3.5 py-3.5 rounded-xs outline-none focus:border-neutral-950"
                    placeholder="4152 8223 9445 1022"
                    maxLength={19}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Date d'expiration *</label>
                    <input
                      type="text"
                      value={paymentForm.expiry}
                      onChange={handleExpiryChange}
                      className="w-full bg-white border border-neutral-200 text-xs px-3.5 py-3.5 rounded-xs outline-none focus:border-neutral-950"
                      placeholder="MM/AA"
                      maxLength={5}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Cryptogramme (CVV) *</label>
                    <input
                      type="password"
                      value={paymentForm.cvv}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value.replace(/\D/g, '') })}
                      className="w-full bg-white border border-neutral-200 text-xs px-3.5 py-3.5 rounded-xs outline-none focus:border-neutral-950"
                      placeholder="•••"
                      maxLength={3}
                      required
                    />
                  </div>
                </div>

                {/* Secure certificate note */}
                <span className="text-[9px] font-mono text-neutral-400 flex items-center pt-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 mr-1.5" /> Chiffrement SSL 256 bits — Transaction sécurisée fictive
                </span>
              </div>

              {/* Button segment */}
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3.5 border border-neutral-200 text-neutral-600 text-[10px] uppercase tracking-widest font-semibold hover:border-neutral-900 transition-colors cursor-pointer rounded-xs"
                >
                  Coordonnées
                </button>
                <motion.button
                  onClick={handleNextStep}
                  className="px-8 py-3.5 bg-neutral-950 text-white text-[10px] uppercase tracking-widest font-semibold hover:bg-emerald-700 hover:text-white transition-all cursor-pointer flex items-center rounded-xs shadow-md"
                  whileTap={{ scale: 0.98 }}
                >
                  Confirmer la Commande
                  <Sparkles className="w-3.5 h-3.5 ml-1.5 text-brand-gold fill-brand-gold" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Order completed successfully */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="text-center py-6"
            >
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full mx-auto flex items-center justify-center border border-emerald-150 mb-4 animate-scale-up">
                <Check className="w-8 h-8 stroke-[2]" />
              </div>

              <span className="text-[10px] font-mono tracking-widest text-[#b39a74] uppercase block mb-1">
                Commande Validée avec Succès
              </span>
              
              <h3 className="text-2xl sm:text-3.5xl font-serif text-neutral-900 tracking-tight mb-3">
                Merci pour votre confiance
              </h3>

              <div className="p-4 bg-white border border-neutral-150 rounded-xs inline-block font-mono text-xs text-neutral-600 mb-6 text-left max-w-sm w-full mx-auto shadow-sm">
                <div className="border-b border-neutral-100 pb-2 mb-2 flex justify-between">
                  <span>Numéro d'expédition :</span>
                  <span className="font-semibold text-neutral-900">AL-2026-063-{Math.floor(Math.random() * 9000 + 1000)}</span>
                </div>
                <div className="space-y-1">
                  <p>Destinataire : <strong className="font-semibold text-neutral-900">{shippingForm.firstName} {shippingForm.lastName}</strong></p>
                  <p>Adresse : <strong className="font-semibold text-neutral-900">{shippingForm.address}, {shippingForm.city}</strong></p>
                  <span className="text-[11px] block text-emerald-600 italic mt-2 flex items-center leading-relaxed">
                    <Truck className="w-3.5 h-3.5 mr-1" /> Un e-mail de suivi a été envoyé à : {shippingForm.email}
                  </span>
                </div>
              </div>

              <div className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed mb-8">
                Votre colis est en cours de préparation au sein de notre atelier. Toutes nos créations en <strong className="font-semibold text-neutral-800">100% Coton Premium</strong> reçoivent un soin de pliage d'exception et sont parfumées délicatement avant d'être envoyées.
              </div>

              <button
                onClick={handleFinish}
                className="px-10 py-4 bg-neutral-950 text-white text-[10px] uppercase tracking-widest font-semibold hover:bg-brand-gold hover:text-neutral-950 transition-colors cursor-pointer rounded-xs"
              >
                Retourner à la boutique
              </button>
            </motion.div>
          )}
        </div>

        {/* Right sidebar details check (Not shown in Success screens) */}
        {step !== 3 && (
          <div className="w-full md:w-80 bg-neutral-100 border-t md:border-t-0 md:border-l border-neutral-205 p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-xs uppercase font-mono tracking-widest text-brand-gold mb-4 flex items-center">
                <ShoppingBag className="w-4 h-4 mr-1.5" /> Votre Panier ({cart.reduce((ac, x) => ac + x.quantity, 0)})
              </h4>

              <div className="space-y-3.5 overflow-y-auto max-h-[25vh] md:max-h-[50vh] pr-1.5 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex space-x-3 text-xs">
                    <div className="w-12 h-12 bg-neutral-50 border border-neutral-200 flex-shrink-0 relative overflow-hidden rounded-xs">
                      <img src={item.product.image} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-medium text-neutral-900 truncate">{item.product.name}</p>
                      <span className="text-[9px] text-neutral-400 font-mono block mt-0.5">
                        Taille: {item.selectedSize} | {item.selectedColor.name} | Qté: {item.quantity}
                      </span>
                    </div>
                    <div className="font-mono text-neutral-700">
                      {(item.product.price * item.quantity).toFixed(2)} €
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-200 space-y-2 font-sans text-xs">
              <div className="flex justify-between text-neutral-500">
                <span>Sous-total:</span>
                <span className="font-mono">{cartSubtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-neutral-500">
                <span>Livraison standard:</span>
                <span className="font-mono">{shippingCost === 0 ? 'Offerte' : `${shippingCost.toFixed(2)} €`}</span>
              </div>
              <div className="flex justify-between text-neutral-900 font-bold pt-3.5 border-t border-neutral-300">
                <span className="font-serif">Total général:</span>
                <span className="font-mono text-sm">{orderTotal.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
