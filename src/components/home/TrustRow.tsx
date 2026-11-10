import { Sparkles, Truck, MessageCircle } from 'lucide-react';
import { Reveal } from '@/src/components/ui/Reveal';

export function TrustRow() {
  return (
    <section className="container-page mt-12 sm:mt-16">
      <Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card-3d-soft p-5 text-center flex flex-col items-center bg-white border border-[#F4C7D3]/60 rounded-3xl shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#7E1E3C] text-white flex items-center justify-center mb-3 shadow-md">
              <Truck className="w-6 h-6 text-[#F4C7D3]" strokeWidth={1.8} />
            </div>
            <h4 className="font-serif font-semibold text-sm mb-1 text-[#3D1220]">Livraison Dédiée</h4>
            <p className="text-xs text-[#8A6470] leading-relaxed">
              Expédition soignée sur Saint-Louis, Dakar, Thiès, Louga et partout au Sénégal.
            </p>
          </div>

          <div className="card-3d-soft p-5 text-center flex flex-col items-center bg-white border border-[#F4C7D3]/60 rounded-3xl shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#7E1E3C] text-white flex items-center justify-center mb-3 shadow-md">
              <Sparkles className="w-6 h-6 text-[#F4C7D3]" strokeWidth={1.8} />
            </div>
            <h4 className="font-serif font-semibold text-sm mb-1 text-[#3D1220]">Matières Nobles & Confection</h4>
            <p className="text-xs text-[#8A6470] leading-relaxed">
              Soie de Médine premium, mousseline, jersey ondulé et coupes amples au tombé impeccable.
            </p>
          </div>

          <div className="card-3d-soft p-5 text-center flex flex-col items-center bg-white border border-[#F4C7D3]/60 rounded-3xl shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#7E1E3C] text-white flex items-center justify-center mb-3 shadow-md">
              <MessageCircle className="w-6 h-6 text-[#F4C7D3]" strokeWidth={1.8} />
            </div>
            <h4 className="font-serif font-semibold text-sm mb-1 text-[#3D1220]">Commande WhatsApp Directe</h4>
            <p className="text-xs text-[#8A6470] leading-relaxed">
              Échangez en direct avec nos conseillères à Saint-Louis pour un accompagnement sur-mesure.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
