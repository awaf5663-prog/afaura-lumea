import React, { useRef } from 'react';
import { ArrowRight, Leaf, ShieldCheck, Sparkles, Award } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';

interface HeroProps {
  onShopClick: () => void;
  onCategorySelect?: (categoryId: string) => void;
}

export default function Hero({ onShopClick, onCategorySelect }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll position inside Hero
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  // Soft spring configuration for ultra-fluid quiet-luxury movement
  const springConfig = { stiffness: 90, damping: 28, mass: 0.8, restDelta: 0.001 };
  
  // Parallax Background transforms
  const rawYBg = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const yBg = useSpring(rawYBg, springConfig);

  const rawScaleBg = useTransform(scrollYProgress, [0, 1], [1.02, 1.15]);
  const scaleBg = useSpring(rawScaleBg, springConfig);

  // Parallax Middle overlay transforms (for text container)
  const rawYText = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const yText = useSpring(rawYText, springConfig);

  const rawOpacityText = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const opacityText = useSpring(rawOpacityText, springConfig);

  // Parallax Foreground Left Layer (Moves faster to create depth hierarchy)
  const rawYForeLeft = useTransform(scrollYProgress, [0, 1], ["0%", "-35%"]);
  const yForeLeft = useSpring(rawYForeLeft, springConfig);

  // Parallax Foreground Right Layer (Moves significantly faster for dramatic high-contrast overlap)
  const rawYForeRight = useTransform(scrollYProgress, [0, 1], ["0%", "-55%"]);
  const yForeRight = useSpring(rawYForeRight, springConfig);

  const rawScaleForeRight = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const scaleForeRight = useSpring(rawScaleForeRight, springConfig);

  return (
    <div id="hero-section" ref={containerRef} className="relative bg-[#faf8f5] overflow-hidden">
      {/* Immersive Editorial Photo Hero Banner */}
      <div className="relative h-[85vh] sm:h-[90vh] md:h-[98vh] w-full overflow-hidden flex items-center justify-center">
        {/* Dynamic Darkened visual overlay to ensure typography is beautifully readable */}
        <motion.div 
          style={{ opacity: useSpring(useTransform(scrollYProgress, [0, 1], [0.3, 0.55]), springConfig) }}
          className="absolute inset-0 bg-neutral-900 z-10 pointer-events-none" 
        />

        {/* Parallax Background Layer */}
        <motion.img
          src="/src/assets/images/hero_modest_banner_1780455318951.png"
          alt="Afaura LUMÉA draped luxury fabrics backdrop"
          style={{ 
            y: yBg,
            scale: scaleBg 
          }}
          className="absolute inset-0 w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />

        {/* Decorative Floating Sub-Header line (Z-Index 15) */}
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-15 hidden sm:flex flex-col items-center space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-[0.45em] text-[#faf8f5]/90">
            MAISON DE MODEST FASHION HAUT DE GAMME
          </span>
          <div className="w-12 h-[1px] bg-brand-gold/60 mt-2" />
        </div>

        {/* Foreground Layer Left: A cropped vertical photo that floats over everything on the left */}
        <motion.div
          style={{ y: yForeLeft }}
          className="absolute top-[28%] left-[5%] z-20 w-32 sm:w-44 aspect-[3/4.5] pointer-events-none hidden lg:block overflow-hidden border-[5px] border-white/95 shadow-xl rounded-xs bg-[#faf8f5] transition-shadow duration-500 hover:shadow-2xl"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            src="/src/assets/images/voile_essentiel_blanc_1780455365335.png"
            alt="Voile drapé blanc"
            className="w-full h-full object-cover object-center scale-102"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-neutral-950/5 hover:bg-transparent transition-colors duration-500" />
        </motion.div>

        {/* Rich Typography Display Content / Middle Layer with Parallax */}
        <motion.div 
          style={{ y: yText, opacity: opacityText }}
          className="relative z-20 text-center max-w-4xl px-4 flex flex-col items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-[11px] font-mono tracking-[0.6em] text-white/95 uppercase mb-4 sm:mb-6 leading-none">
            Nouveautés Textiles d'Exception
          </p>

          <h2 className="text-4.5xl sm:text-6.5xl md:text-8xl font-serif text-[#faf8f5] tracking-tight leading-none mb-6 max-w-xl sm:leading-[1.08] font-light">
            Elegance in <br className="hidden sm:block" />
            <span className="italic font-normal text-brand-sand">every layer</span>
          </h2>

          <p className="text-xs sm:text-sm font-sans tracking-wide text-white/90 max-w-md sm:max-w-lg mb-8 font-light leading-relaxed">
            Une marque de modest fashion spécialisée dans les voiles, foulards et jerseys en coton 100% premium. Conçus pour épouser vos drapés avec un raffinement intemporel.
          </p>

          {/* Luxury CTA Button */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={onShopClick}
              className="px-9 py-4 bg-white text-neutral-950 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-neutral-950 hover:text-[#faf8f5] border border-white hover:border-neutral-930 transition-all duration-300 shadow-lg cursor-pointer flex items-center group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                Découvrir la Boutique
                <ArrowRight className="w-4 h-4 ml-2.5 group-hover:translate-x-1.5 transition-transform duration-300" />
              </span>
            </button>
          </div>
        </motion.div>

        {/* Foreground Layer Right: An asymmetrical cropped photo floating over everything on the bottom-right */}
        <motion.div
          style={{ y: yForeRight, scale: scaleForeRight }}
          className="absolute bottom-[10%] right-[6%] z-20 w-40 sm:w-56 md:w-64 aspect-[3/4.5] pointer-events-none hidden md:block overflow-hidden border-[6px] border-white/95 shadow-2xl rounded-xs bg-[#faf8f5] transition-shadow duration-500 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)]"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            src="/src/assets/images/accessoire_foulard_noir_1780455383236.png"
            alt="Foreground luxury folds"
            className="w-full h-full object-cover object-center scale-102"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-x-0 bottom-0 bg-neutral-950/80 backdrop-blur-xs text-[#faf8f5] py-2 px-3 text-center border-t border-white/10">
            <p className="text-[8px] tracking-[0.25em] uppercase font-mono">FINITION COUTURE</p>
          </div>
        </motion.div>

        {/* Elegant Bottom Border/Indicators */}
        <div className="absolute bottom-8 left-0 w-full z-20 px-8 hidden sm:flex justify-between text-[10px] font-mono tracking-widest text-[#faf8f5]/80">
          <div className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-pulse" />
            <span>AFAURA LUMÉA — INTERACTIVE EXPERIENCE</span>
          </div>
          <div className="flex space-x-4">
            <span>MODESTE</span>
            <span>•</span>
            <span>MINIMALISTE</span>
            <span>•</span>
            <span>DURABLE</span>
          </div>
        </div>
      </div>

      {/* Brand Pillars Panel */}
      <div className="bg-neutral-950 text-neutral-100 py-12 relative z-30 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-neutral-800 text-center md:text-left">
            <motion.div 
              className="flex flex-col items-center md:items-start md:px-6 pt-6 md:pt-0"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Leaf className="w-5 h-5 text-[#b39a74] mb-3.5 stroke-[1.25]" />
              <h4 className="text-xs uppercase tracking-wider font-semibold font-sans">100% Coton Premium</h4>
              <p className="text-[11px] text-neutral-400 mt-1 max-w-xs font-light leading-relaxed">
                Des matières naturelles haut de gamme, douces, respirantes et durables.
              </p>
            </motion.div>

            <motion.div 
              className="flex flex-col items-center md:items-start md:px-6 pt-6 md:pt-0"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Sparkles className="w-5 h-5 text-[#b39a74] mb-3.5 stroke-[1.25]" />
              <h4 className="text-xs uppercase tracking-wider font-semibold font-sans">Drapé Parfait</h4>
              <p className="text-[11px] text-neutral-400 mt-1 max-w-xs font-light leading-relaxed">
                Des textiles fluides pensés pour tenir sans glisser avec élégance.
              </p>
            </motion.div>

            <motion.div 
              className="flex flex-col items-center md:items-start md:px-6 pt-6 md:pt-0"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Award className="w-5 h-5 text-[#b39a74] mb-3.5 stroke-[1.25]" />
              <h4 className="text-xs uppercase tracking-wider font-semibold font-sans">Chic Minimaliste</h4>
              <p className="text-[11px] text-neutral-400 mt-1 max-w-xs font-light leading-relaxed">
                Une harmonie calme à l'esthétique épurée inspirée du quiet luxury.
              </p>
            </motion.div>

            <motion.div 
              className="flex flex-col items-center md:items-start md:px-6 pt-6 md:pt-0"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <ShieldCheck className="w-5 h-5 text-[#b39a74] mb-3.5 stroke-[1.25]" />
              <h4 className="text-xs uppercase tracking-wider font-semibold font-sans">Pudeur Moderne</h4>
              <p className="text-[11px] text-neutral-400 mt-1 max-w-xs font-light leading-relaxed">
                Des longueurs étudiées s'adaptant confortablement à toutes les morphologies.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Structured Minimal Collections highlight with Zoom entrance & spring on interaction */}
      <div className="py-24 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[10px] uppercase font-mono tracking-[0.45em] text-neutral-400 block mb-2">
              Collections Signature
            </span>
            <h3 className="text-2xl sm:text-3.5xl font-serif text-neutral-900 tracking-tight font-light">
              Inspirations Afaura <span className="italic">LUMÉA</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            {/* Collection 1: Foulards Coton */}
            <motion.div
              onClick={() => onCategorySelect?.('foulard_cotton')}
              className="group cursor-pointer overflow-hidden relative aspect-[3/4] bg-neutral-100 shadow-sm border border-neutral-200/40 rounded-sm flex flex-col justify-end p-7"
              whileHover={{ y: -6, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <img
                src="/src/assets/images/foulard_coton_sable_1780455334087.png"
                alt="Foulards en coton premium"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.8s] ease-out group-hover:scale-106"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/25 to-transparent opacity-85 group-hover:opacity-90 transition-opacity duration-500" />
              <div className="relative z-10">
                <span className="text-[9px] uppercase font-mono tracking-widest text-[#b39a74]">100% Naturel</span>
                <h4 className="text-lg sm:text-xl font-serif text-white tracking-wide mt-1">Foulards Coton</h4>
                <p className="text-[11px] text-neutral-300 mt-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 font-light leading-relaxed">
                  Toucher soyeux et tenue structurée.
                </p>
                <div className="mt-3 flex items-center text-xs text-white uppercase tracking-widest font-mono border-b border-white pb-0.5 w-fit group-hover:border-brand-gold group-hover:text-brand-gold transition-colors duration-300">
                  <span>Découvrir</span>
                </div>
              </div>
            </motion.div>

            {/* Collection 2: Hijabs Jersey */}
            <motion.div
              onClick={() => onCategorySelect?.('hijab_jersey')}
              className="group cursor-pointer overflow-hidden relative aspect-[3/4] bg-neutral-100 shadow-sm border border-neutral-200/40 rounded-sm flex flex-col justify-end p-7"
              whileHover={{ y: -6, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              <img
                src="/src/assets/images/hijab_jersey_premium_1780455349520.png"
                alt="Hijabs en jersey haut de gamme"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.8s] ease-out group-hover:scale-106"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/25 to-transparent opacity-85 group-hover:opacity-90 transition-opacity duration-500" />
              <div className="relative z-10">
                <span className="text-[9px] uppercase font-mono tracking-widest text-[#b39a74]">Élastique & Doux</span>
                <h4 className="text-lg sm:text-xl font-serif text-white tracking-wide mt-1">Hijabs Jersey</h4>
                <p className="text-[11px] text-neutral-300 mt-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 font-light leading-relaxed">
                  Liberté de mouvement sans compromis.
                </p>
                <div className="mt-3 flex items-center text-xs text-white uppercase tracking-widest font-mono border-b border-white pb-0.5 w-fit group-hover:border-brand-gold group-hover:text-brand-gold transition-colors duration-300">
                  <span>Découvrir</span>
                </div>
              </div>
            </motion.div>

            {/* Collection 3: Essentiels */}
            <motion.div
              onClick={() => onCategorySelect?.('essentiels')}
              className="group cursor-pointer overflow-hidden relative aspect-[3/4] bg-neutral-100 shadow-sm border border-neutral-200/40 rounded-sm flex flex-col justify-end p-7"
              whileHover={{ y: -6, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <img
                src="/src/assets/images/voile_essentiel_blanc_1780455365335.png"
                alt="Essentiels Modest"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.8s] ease-out group-hover:scale-106"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/25 to-transparent opacity-85 group-hover:opacity-90 transition-opacity duration-500" />
              <div className="relative z-10">
                <span className="text-[9px] uppercase font-mono tracking-widest text-[#b39a74]">Indispensable</span>
                <h4 className="text-lg sm:text-xl font-serif text-white tracking-wide mt-1">Essentiels Modest</h4>
                <p className="text-[11px] text-neutral-300 mt-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 font-light leading-relaxed">
                  Voiles fins et sous-hijabs seconde peau.
                </p>
                <div className="mt-3 flex items-center text-xs text-white uppercase tracking-widest font-mono border-b border-white pb-0.5 w-fit group-hover:border-brand-gold group-hover:text-brand-gold transition-colors duration-300">
                  <span>Découvrir</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
