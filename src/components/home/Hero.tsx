import { ArrowRight, Sparkles, ShieldCheck, Truck, Package, MessageCircle, ExternalLink } from 'lucide-react';
import symbole from '@/src/assets/brand/symbole-sombre.webp';
import heroImage from '@/src/assets/products/dentelle-noir-blanc.webp';
import secondHeroImage from '@/src/assets/products/abaya-leopard-fauve.webp';
import { BRAND, WHATSAPP_NUMBER } from '@/src/config/site';
import { useOuvertureGroupage } from '@/src/hooks/useOuvertureGroupage';
import { useProducts } from '@/src/hooks/useProducts';
import { Link, useRouter } from '@/src/lib/router';
import { GroupingBadge } from './GroupingBadge';

export function Hero() {
  const { navigate } = useRouter();
  const { bandeau } = useOuvertureGroupage();
  const { products } = useProducts();

  // Find two showcase products or use beautiful fallbacks
  const productA = products[0] || null;
  const productB = products.find((p) => p.isPopular || p.id !== productA?.id) || products[1] || null;

  return (
    <section className="container-page pt-3 sm:pt-6 pb-4">
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[36px] text-white p-5 sm:p-8 lg:p-10 shadow-[0_20px_45px_-10px_rgba(88,17,39,0.35)] border border-[#E296A9]/40 bg-gradient-to-br from-[#581127] via-[#7E1E3C] to-[#3D1220]">
        {/* Ambient glowing circles */}
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-16 w-80 h-80 rounded-full bg-[#E296A9]/20 blur-3xl pointer-events-none" />

        {/* Top bar badges */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 mb-6">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-black/35 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs font-semibold text-[#FCE8EE]">
            <Sparkles className="size-3.5 text-[#F4C7D3]" />
            <span>Catalogue Officiel · Saint-Louis, Dakar, Thiès & Louga</span>
          </div>

          <div className="flex items-center gap-2 bg-black/35 backdrop-blur-md pl-1.5 pr-3 py-1 rounded-full border border-white/20 shadow-md">
            <img src={symbole} alt="" className="size-7 sm:size-8 object-contain rounded-full bg-white/10 p-0.5" />
            <span className="text-[11px] sm:text-xs font-serif font-bold text-[#FCE8EE] tracking-[0.2em] uppercase">
              AFAURA
            </span>
          </div>
        </div>

        {/* Main Grid Content */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-6">
          <div className="lg:col-span-7">
            <h1 className="text-3xl sm:text-5xl font-serif font-medium leading-[1.12] mb-3 text-white tracking-tight drop-shadow-md">
              Bienvenue sur <br className="hidden sm:inline" />
              <span className="font-semibold text-[#FCE8EE]">l'Espace AFAURA</span>
            </h1>

            <p className="text-sm sm:text-base text-[#FCE8EE]/95 leading-relaxed font-light mb-7 max-w-lg drop-shadow-xs">
              Maison de confection & sélection modeste. Voiles de soie de Médine, abayas raffinées, parfums et soins du corps. Commandez directement en FCFA ou confiez-nous vos commandes SHEIN & ALIBABA.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 sm:gap-4">
              <button
                type="button"
                onClick={() => navigate('/boutique')}
                className="button-3d-rose-poudre px-7 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xl text-[#581127]"
              >
                <span>Explorer le catalogue</span>
                <ArrowRight className="size-4 text-[#581127]" strokeWidth={2.5} />
              </button>

              <button
                type="button"
                onClick={() => navigate('/shein')}
                className="px-5 py-3.5 rounded-full font-semibold text-xs text-[#FCE8EE] bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Package className="size-4 text-[#F4C7D3]" />
                <span>SHEIN & ALIBABA</span>
              </button>

              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Bonjour%20Espace%20AFAURA%2C%20je%20souhaite%20des%20informations%20sur%20vos%20pi%C3%A8ces%20!`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#F4C7D3] hover:text-white font-medium tracking-wide underline underline-offset-4 drop-shadow-xs"
              >
                <MessageCircle className="size-3.5" />
                <span>WhatsApp direct (+221 78 107 16 04)</span>
              </a>
            </div>
          </div>

          {/* Right Floating Showcase */}
          <div className="lg:col-span-5 flex items-center justify-center sm:justify-end gap-3 sm:gap-4 py-2">
            {/* Card 1 */}
            <div
              onClick={() => productA ? navigate(`/produit/${productA.slug}`) : navigate('/boutique')}
              className="relative w-36 xs:w-40 sm:w-44 aspect-[3/4] rounded-[22px] sm:rounded-[26px] overflow-hidden border-2 border-white/60 shadow-2xl bg-white group select-none cursor-pointer flex-shrink-0 transform transition-transform hover:-translate-y-1.5"
            >
              <img
                src={productA?.images[0] || heroImage}
                alt={productA?.name || 'Pièce AFAURA'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-2.5 sm:p-3 text-left">
                <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-[#F4C7D3] font-bold">
                  Pièce Iconique
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-white leading-tight line-clamp-1">
                  {productA?.name || 'Hijabs Dentelle'}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#F4C7D3] mt-0.5">
                  {productA ? `${productA.price.toLocaleString('fr-FR')} FCFA` : 'Prix direct'}
                </span>
              </div>
            </div>

            {/* Card 2 */}
            <div
              onClick={() => productB ? navigate(`/produit/${productB.slug}`) : navigate('/boutique')}
              className="relative w-36 xs:w-40 sm:w-44 aspect-[3/4] rounded-[22px] sm:rounded-[26px] overflow-hidden border-2 border-white/60 shadow-2xl bg-white group select-none cursor-pointer mt-5 sm:mt-8 flex-shrink-0 transform transition-transform hover:-translate-y-1.5"
            >
              <img
                src={productB?.images[0] || secondHeroImage}
                alt={productB?.name || 'Abaya AFAURA'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-2.5 sm:p-3 text-left">
                <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-[#F4C7D3] font-bold">
                  Haute Ligne
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-white leading-tight line-clamp-1">
                  {productB?.name || 'Abaya Soie & Mousseline'}
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#F4C7D3] mt-0.5">
                  {productB ? `${productB.price.toLocaleString('fr-FR')} FCFA` : 'Sur mesure'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Groupage countdown alert if present */}
        {!bandeau && (
          <div className="mb-4 max-w-sm">
            <GroupingBadge />
          </div>
        )}

        {/* Bottom Guarantee Banner */}
        <div className="pt-3.5 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-black/25 backdrop-blur-md rounded-2xl px-4 py-2.5">
          <div className="flex items-center gap-2 text-white/95 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-[#FCE8EE]">Validation SHEIN & ALIBABA au Sénégal</span>
            <span className="text-white/60 hidden sm:inline">·</span>
            <span className="text-[11px] text-[#F4C7D3] hidden sm:inline">
              Taux garanti 1 USD = 650 FCFA · Zéro transitaire à chercher · Suivi en direct
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate('/shein')}
            className="text-xs font-bold text-[#F4C7D3] hover:text-white underline underline-offset-4 cursor-pointer ml-auto sm:ml-0 inline-flex items-center gap-1"
          >
            <span>Accéder aux services</span>
            <ExternalLink className="size-3" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-2 text-[13px] text-stone">
        <div className="inline-flex items-center gap-2">
          <ShieldCheck className="size-4 text-brand" strokeWidth={1.8} />
          <span>Prix confirmés en FCFA avant tout paiement</span>
        </div>
        <div className="inline-flex items-center gap-2">
          <Truck className="size-4 text-brand" strokeWidth={1.8} />
          <span>Livraison Saint-Louis, Dakar, Thiès, Louga</span>
        </div>
        <Link to="/comment-ca-marche" className="link-underline font-medium text-brand hover:text-mauve">
          Première commande ? Voir comment ça marche en 4 étapes →
        </Link>
      </div>
    </section>
  );
}
