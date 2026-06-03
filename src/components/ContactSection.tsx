import React, { useState } from 'react';
import { Send, MapPin, Mail, Phone, Instagram, CheckCircle2, Lock } from 'lucide-react';
import { motion } from 'motion/react';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    object: 'Collaboration / Presse',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setFormData({ name: '', email: '', object: 'Collaboration / Presse', message: '' });
      setTimeout(() => setSuccess(false), 5000);
    }, 1500);
  };

  const instagramPosts = [
    {
      id: 1,
      image: '/src/assets/images/foulard_coton_sable_1780455334087.png',
      likes: '2.4K',
      comments: '112',
      tag: 'Le Coton Sable'
    },
    {
      id: 2,
      image: '/src/assets/images/hijab_jersey_premium_1780455349520.png',
      likes: '1.9K',
      comments: '88',
      tag: 'Jersey Suprême'
    },
    {
      id: 3,
      image: '/src/assets/images/voile_essentiel_blanc_1780455365335.png',
      likes: '3.1K',
      comments: '145',
      tag: "L'Orient Lumineux"
    },
    {
      id: 4,
      image: '/src/assets/images/accessoire_foulard_noir_1780455383236.png',
      likes: '2.8K',
      comments: '99',
      tag: 'Ébène Signature'
    }
  ];

  return (
    <div id="contact-section" className="py-24 bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Contact and Form layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          
          {/* Left Panel: Showroom / Maison Coordinates */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-4 flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#b39a74] block mb-2">
                NOUS ÉCRIRE
              </span>
              
              <h3 className="text-2xl sm:text-4xl font-serif text-neutral-900 tracking-tight mb-6">
                Entrer en contact
              </h3>

              <p className="text-xs sm:text-sm text-neutral-500 font-light leading-relaxed mb-8">
                Que ce soit pour une question sur nos d’longueurs de coton premium, une commande spéciale ou une demande de collaboration média, notre équipe d'accompagnement vous répond sous 24 heures de manière privilégiée.
              </p>

              {/* Contact Coordinates */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="p-2.5 bg-white border border-neutral-200 text-[#b39a74] rounded-sm shadow-2xs">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-[10px] uppercase font-mono tracking-widest text-[#b39a74] font-medium">Showroom Paris</h5>
                    <p className="text-xs text-neutral-800 mt-1">12 Avenue Montaigne, 75008 Paris, France</p>
                    <p className="text-[10px] text-neutral-400 italic">Uniquement sur invitation</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-2.5 bg-white border border-neutral-200 text-[#b39a74] rounded-sm shadow-2xs">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-[10px] uppercase font-mono tracking-widest text-[#b39a74] font-medium">Mails généraux</h5>
                    <p className="text-xs text-neutral-800 mt-1 hover:text-[#b39a74] transition-colors">
                      <a href="mailto:contact@afauralumea.com">contact@afauralumea.com</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="p-2.5 bg-white border border-neutral-200 text-[#b39a74] rounded-sm shadow-2xs">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-[10px] uppercase font-mono tracking-widest text-[#b39a74] font-medium">Téléphone conciergerie</h5>
                    <p className="text-xs text-neutral-800 mt-1">+33 1 72 84 94 00</p>
                    <p className="text-[10px] text-neutral-400">Du lundi au vendredi, 10h — 18h CET</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social handles links */}
            <div className="pt-6 border-t border-neutral-200/60 mt-10 lg:mt-0">
              <span className="text-[11px] uppercase font-mono text-neutral-400 tracking-widest block mb-2.5">
                Suivre la Maison
              </span>
              <a
                href="#instagram"
                className="inline-flex items-center text-xs font-sans text-neutral-800 hover:text-[#b39a74] transition-colors"
              >
                <Instagram className="w-4 h-4 mr-1.5 stroke-[1.5]" />
                @afaura_lumea
              </a>
            </div>
          </motion.div>

          {/* Right Panel: Premium message submission block */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
            className="lg:col-span-8 bg-white p-6 sm:p-10 border border-neutral-200/60 shadow-lg rounded-xs"
          >
            {success ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mb-4 animate-bounce" />
                <h4 className="text-xl font-serif text-neutral-900 mb-2">Message envoyé avec succès</h4>
                <p className="text-xs text-neutral-500 max-w-sm leading-relaxed">
                  Merci d'avoir pris le temps de nous écrire. Notre Atelier étudie votre requête et reviendra vers vous à l'adresse fournie dans un délai de 24h.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Votre Nom *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#faf8f5] border border-neutral-200 text-xs px-4 py-3.5 rounded-xs outline-none focus:border-neutral-950 transition-colors"
                      placeholder="Nom complet"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Adresse email de réponse *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#faf8f5] border border-neutral-200 text-xs px-4 py-3.5 rounded-xs outline-none focus:border-neutral-950 transition-colors"
                      placeholder="sarah@example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Sujet de contact *</label>
                  <select
                    value={formData.object}
                    onChange={(e) => setFormData({ ...formData, object: e.target.value })}
                    className="w-full bg-[#faf8f5] border border-neutral-200 text-xs px-4 py-3.5 rounded-xs outline-none focus:border-neutral-950 transition-colors cursor-pointer"
                  >
                    <option value="Collaboration / Presse">Collaboration / Relations Presse</option>
                    <option value="Suivi de Commande">Suivi d'expédition de commande</option>
                    <option value="Avis de drapage">Conseil de longueur et de tissu</option>
                    <option value="Autre Demande">Autre question</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-neutral-400 mb-1.5">Votre Message *</label>
                  <textarea
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#faf8f5] border border-neutral-200 text-xs px-4 py-3.5 rounded-xs outline-none focus:border-neutral-950 transition-colors resize-none leading-relaxed"
                    placeholder="Comment notre Atelier peut-il vous accompagner ?"
                    required
                  />
                </div>

                {/* Newsletter activation trigger */}
                <div className="flex items-start space-x-2.5 pt-2">
                  <input
                    type="checkbox"
                    id="newsletter-sub"
                    className="mt-0.5 rounded-xs border-neutral-350 accent-neutral-900 cursor-pointer"
                    defaultChecked
                  />
                  <label id="newsletter-sub-label" htmlFor="newsletter-sub" className="text-[11px] text-neutral-500 font-light leading-snug cursor-pointer select-none">
                    Je souhaite m'inscrire à la gazette de l’Atelier et faire partie du club Afaura LUMÉA pour recevoir en priorité les lancements de nouveaux jerseys premium.
                  </label>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex justify-between items-center">
                  <span className="text-[10px] text-neutral-400 font-mono flex items-center">
                    <Lock className="w-3 h-3 mr-1" /> RGPD — Chiffrement sécurisé
                  </span>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3.5 bg-neutral-950 text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#b39a74] hover:text-neutral-950 transition-colors duration-300 flex items-center cursor-pointer disabled:bg-neutral-400 rounded-xs shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting ? 'Transmission...' : 'Envoyer le message'}
                    <Send className="w-3 h-3 ml-2" />
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>
        </div>

        {/* Instantly refined curated Instagram mock feed */}
        <div className="border-t border-neutral-200/65 pt-16">
          <div className="text-center mb-8">
            <span className="text-[10px] font-mono tracking-[0.45em] text-[#b39a74] uppercase block mb-1">
              #AFAURALUMEA ON INSTAGRAM
            </span>
            <h4 className="text-xl font-serif text-neutral-900">
              Partagez votre drapé
            </h4>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {instagramPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative aspect-square bg-neutral-200 group overflow-hidden cursor-pointer shadow-xs border border-neutral-100 rounded-xs"
              >
                <img
                  src={post.image}
                  alt={post.tag}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                
                {/* Visual Hover State - likeness metrics */}
                <div className="absolute inset-0 bg-neutral-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex flex-col justify-center items-center text-white p-4">
                  <Instagram className="w-5 h-5 text-white/80 mb-2 stroke-[1.5]" />
                  <span className="text-xs font-serif italic mb-3 font-semibold">{post.tag}</span>
                  <div className="flex space-x-4 text-[10px] font-mono">
                    <span>♥ {post.likes}</span>
                    <span>💬 {post.comments}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
