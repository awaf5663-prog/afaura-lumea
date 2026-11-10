import { Check, Copy, ExternalLink, Sparkles, Users } from 'lucide-react';
import { useState } from 'react';
import { useSettings } from '@/src/hooks/useSettings';
import { useToast } from '@/src/hooks/useToast';
import {
  WHATSAPP_GROUP_BADGE,
  WHATSAPP_GROUP_LINK,
  WHATSAPP_GROUP_SUBTITLE,
  WHATSAPP_GROUP_TITLE,
} from '@/src/config/site';

interface WhatsAppCommunityCardProps {
  compact?: boolean;
  className?: string;
}

export function WhatsAppCommunityCard({ compact = false, className = '' }: WhatsAppCommunityCardProps) {
  const { settings } = useSettings();
  const { notify } = useToast();
  const [copied, setCopied] = useState(false);

  // Vérifier si désactivé dans les réglages
  if (settings?.whatsappGroupActive === false) {
    return null;
  }

  const link = settings?.whatsappGroupLink?.trim() || WHATSAPP_GROUP_LINK;
  const title = settings?.whatsappGroupTitle?.trim() || WHATSAPP_GROUP_TITLE;
  const subtitle = settings?.whatsappGroupSubtitle?.trim() || WHATSAPP_GROUP_SUBTITLE;
  const badge = settings?.whatsappGroupBadge?.trim() || WHATSAPP_GROUP_BADGE;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(link).then(() => {
      setCopied(true);
      notify('Lien d’invitation au groupe copié !');
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      notify('Impossible de copier automatiquement', 'error');
    });
  };

  const handleOpen = () => {
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  if (compact) {
    return (
      <div
        className={`group relative overflow-hidden rounded-[--radius-lg] border border-emerald-500/20 bg-gradient-to-r from-emerald-950 via-[#0d3d2e] to-[#075e54] p-4 text-white shadow-sm transition hover:shadow-md ${className}`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30">
              <Users className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  {badge}
                </span>
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h4 className="text-[14.5px] font-medium text-white">{title}</h4>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="press inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[12px] text-white hover:bg-white/20"
              title="Copier le lien d'invitation"
            >
              {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
              <span>{copied ? 'Copié' : 'Copier'}</span>
            </button>
            <button
              type="button"
              onClick={handleOpen}
              className="press inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-1.5 text-[12.5px] font-medium text-ink hover:bg-emerald-400"
            >
              <span>Rejoindre</span>
              <ExternalLink className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-[--radius-xl] border border-emerald-500/25 bg-gradient-to-br from-[#052e24] via-[#094336] to-[#065f46] p-6 sm:p-8 text-white shadow-lg ${className}`}
    >
      {/* Halo décoratif subtil */}
      <div
        className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-emerald-500/15 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/60 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-300">
            <Sparkles className="size-3 text-emerald-400" />
            <span>{badge}</span>
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <h3 className="mt-3 text-[22px] font-medium tracking-tight text-white sm:text-[28px] font-display">
            {title}
          </h3>

          <p className="mt-2 text-[14px] leading-relaxed text-emerald-100/90 sm:text-[14.5px]">
            {subtitle}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-emerald-200/80">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1 rounded-full bg-emerald-400" />
              Arrivages en avant-première
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1 rounded-full bg-emerald-400" />
              Tarifs revendeurs & grossistes
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1 rounded-full bg-emerald-400" />
              Commandes groupées SHEIN & ALIBABA
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row lg:flex-col xl:flex-row">
          <button
            type="button"
            onClick={handleCopy}
            className="press inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-[13.5px] font-medium text-white backdrop-blur hover:bg-white/20"
          >
            {copied ? (
              <>
                <Check className="size-4 text-emerald-400" />
                <span>Lien copié !</span>
              </>
            ) : (
              <>
                <Copy className="size-4" />
                <span>Copier le lien</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleOpen}
            className="press inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-[14px] font-semibold text-emerald-950 shadow-md hover:bg-emerald-300"
          >
            <span>Rejoindre le Groupe VIP</span>
            <ExternalLink className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
