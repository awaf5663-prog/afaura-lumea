import React, { useRef } from 'react';
import { Sparkles, Compass, ShieldCheck, Heart } from 'lucide-react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';

export default function AboutSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll inside the About Section
  const { scrollYProgress } = useScroll({
    target: scrollContainerRef,
    offset: ["start end", "end start"]
  });

  const springConfig = { stiffness: 95, damping: 26, mass: 1 };

  // Scroll expansion transition: from inset frame to full scale
  const rawExtendScale = useTransform(scrollYProgress, [0.1, 0.55], [0.93, 1.05]);
  const extendScale = useSpring(rawExtendScale, springConfig);

  // Scroll active internal image zoom progress
  const rawImageZoom = useTransform(scrollYProgress, [0, 1], [1.02, 1.18]);
  const imageZoom = useSpring(rawImageZoom, springConfig);

  // Parallax translation for the overlapping editorial quote card (simulate depth level)
  const rawCardY = useTransform(scrollYProgress, [0.1, 0.8], [40, -50]);
  const cardY = useSpring(rawCardY, springConfig);

  // Floating backdrop spheres subtle movement
  const rawSphereY1 = useTransform(scrollYProgress, [0, 1], [-30, 40]);
  const sphereY1 = useSpring(rawSphereY1, springConfig);

  const rawSphereY2 = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const sphereY2 = useSpring(rawSphereY2, springConfig);

  return (
    <div 
      id="about-section" 
      ref={scrollContainerRef}
      className="py-28 bg-white relative overflow-hidden"
    >
      {/* Decorative luxury backdrops simulating high-end depth */}
      <motion.div 
        style={{ y: sphereY1 }}
        className="absolute -top-16 -right-16 w-96 h-96 bg-[#b39a74]/5 rounded-full blur-3xl pointer-events-none" 
      />
      <motion.div 
        style={{ y: sphereY2 }}
        className="absolute -bottom-16 -left-16 w-96 h-96 bg-brand-sand/20 rounded-full blur-3xl pointer-events-none" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">
          
          {/* Left Column: Scroll-Driven Editorial Expanding Picture frame */}
          <div className="lg:col-span-5 relative">
            <motion.div 
              style={{ scale: extendScale }}
              className="aspect-[3/4] w-full bg-neutral-100 overflow-hidden shadow-2xl border border-neutral-200/60 relative rounded-xs group"
            >
              {/* Main picture: sand premium draped cotton foulard */}
              <motion.img
                src="/src/assets/images/foulard_coton_sable_1780455334087.png"
                alt="Afaura LUMÉA luxury draping aesthetics"
                style={{ scale: imageZoom }}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-neutral-950/5 group-hover:bg-transparent transition-colors duration-500" />
              
              <div className="absolute bottom-5 left-5 bg-neutral-950 text-[#faf8f5] px-4 py-2.5 text-[9px] font-mono tracking-widest uppercase rounded-xs shadow-md">
                Atelier Paris / Lyon
              </div>
            </motion.div>

            {/* Overlapping Absolute Card - floating at a custom parallax speed */}
            <motion.div 
              style={{ y: cardY }}
              className="absolute -bottom-10 -right-4 sm:-right-8 w-64 bg-[#faf8f5]/95 backdrop-blur-md border border-neutral-200/50 p-6 shadow-xl hidden sm:block rounded-xs"
            >
              <div className="flex items-center space-x-1.5 mb-2">
                <span className="w-1.5 h-1.5 bg-[#b39a74] rounded-full" />
                <span className="text-[9px] font-mono tracking-widest text-[#b39a74] uppercase block">
                  MATIÈRE NOBLE
                </span>
              </div>
              <p className="text-xs font-serif font-normal italic text-neutral-800 leading-relaxed">
                "Nous ne concevons nos voiles qu'en coton 100% premium peigné brossé, pour une caresse ultime adaptée aux peaux les plus sensibles."
              </p>
            </motion.div>
          </div>

          {/* Right Column: Sophisticated Storytelling */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[11px] font-mono uppercase tracking-[0.45em] text-[#b39a74] block mb-2 font-medium">
              NOTRE PHILOSOPHIE
            </span>
            
            <h2 className="text-3xl sm:text-5.5xl font-serif text-neutral-900 tracking-tight leading-none mb-6 font-light">
              Afaura LUMÉA : <br />
              <span className="italic font-normal text-[#b39a74]">L'Éloge de la Pudeur Moderne</span>
            </h2>

            <p className="text-sm text-neutral-600 leading-relaxed font-light mb-6">
              Afaura LUMÉA est née du désir d'offrir une alternative textile d'exception pour la femme contemporaine. Spécialisée dans la modest fashion de luxe discret, notre maison façonne des foulards, voiles, jerseys premium et accessoires textiles d'une pudeur moderne absolue, transcendant les tendances éphémères.
            </p>

            <p className="text-sm text-neutral-600 leading-relaxed font-light mb-8">
              Chaque drapé, chaque pli d'un foulard est pensé comme une architecture fluide qui flatte la posture. En sélectionnant exclusivement du <strong className="font-medium text-neutral-800">100% Coton Premium</strong>, nous vous garantissons des textiles d'une respirabilité inégalée, adaptés à toutes les morphologies et tous les climats. La tradition du savoir-faire textile et les lignes sculpturales modernes s'unissent pour composer une élégance naturelle souveraine.
            </p>

            {/* Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-neutral-100 pt-8">
              <motion.div 
                className="flex space-x-3 items-start"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Compass className="w-5 h-5 text-[#b39a74] shrink-0 mt-0.5 stroke-[1.5]" />
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold font-sans text-neutral-900">
                    Savoir-faire Contemporain
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-1 font-light leading-relaxed">
                    Une alliance subtile entre héritage de tissage et coupes architecturales modernes.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                className="flex space-x-3 items-start"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <ShieldCheck className="w-5 h-5 text-[#b39a74] shrink-0 mt-0.5 stroke-[1.5]" />
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold font-sans text-neutral-900">
                    Exigence Textile
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-1 font-light leading-relaxed">
                    Aucun mélange synthétique rugueux. Douceur infinie de fibres longues et hypoallergéniques.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                className="flex space-x-3 items-start"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Sparkles className="w-5 h-5 text-[#b39a74] shrink-0 mt-0.5 stroke-[1.5]" />
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold font-sans text-neutral-900">
                    Quiet Luxury Intemporel
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-1 font-light leading-relaxed">
                    Des nuances neutres (sable, beige, charbon) conçues pour enrichir votre garde-robe.
                  </p>
                </div>
              </motion.div>

              <motion.div 
                className="flex space-x-3 items-start"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Heart className="w-5 h-5 text-[#b39a74] shrink-0 mt-0.5 stroke-[1.5]" />
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold font-sans text-neutral-900">
                    Pensé pour Toutes
                  </h4>
                  <p className="text-[11px] text-neutral-500 mt-1 font-light leading-relaxed">
                    Des longueurs s'adaptant à de multiples drapages avec confort physique et dignité.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
