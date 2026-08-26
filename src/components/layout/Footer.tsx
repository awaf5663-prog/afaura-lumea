import { Instagram, Mail, MapPin } from 'lucide-react';
import logo from '@/src/assets/brand/logo-sombre.webp';
import { TikTokIcon } from '@/src/components/ui/TikTokIcon';
import { BRAND, CONTACT_EMAIL, INSTAGRAM_HANDLE, TIKTOK_HANDLE } from '@/src/config/site';
import { useWhatsapp } from '@/src/hooks/useSettings';
import { prettyPhone } from '@/src/lib/format';
import { Link } from '@/src/lib/router';

const COLUMNS = [
  {
    title: 'Boutique',
    links: [
      { to: '/boutique', label: 'Toutes les pièces' },
      { to: '/boutique?categorie=abaya', label: 'Abaya' },
      { to: '/boutique?categorie=piece_unique', label: 'Pièce unique' },
      { to: '/boutique?categorie=jersey', label: 'Jersey' },
      { to: '/boutique?categorie=dentelle', label: 'Dentelle' },
      { to: '/boutique?categorie=hijab_tape', label: 'Hijab tape' },
    ],
  },
  {
    title: 'Services',
    links: [
      { to: '/shein', label: 'Commande SHEIN' },
      { to: '/comment-ca-marche', label: 'Comment ça marche' },
      { to: '/suivi', label: 'Suivre ma commande' },
      { to: '/faq', label: 'Questions fréquentes' },
    ],
  },
];

export function Footer() {
  const whatsapp = useWhatsapp();
  const contactHref = whatsapp.url('Bonjour, j’ai une question.');

  return (
    <footer className="mt-20 border-t border-line bg-blush/35">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          {/*
            Le logo de la boutique, dans sa version encre pour tenir sur le fond
            clair. `drop-shadow` très légère : elle donne du relief au voile sans
            le transformer en image brillante.
          */}
          <img
            src={logo}
            alt={BRAND.name}
            width={720}
            height={720}
            className="h-28 w-auto object-contain drop-shadow-[0_6px_14px_rgba(23,17,15,0.16)]"
          />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-stone">{BRAND.tagline}</p>
          <p className="mt-4 flex items-center gap-2 text-sm text-stone">
            <MapPin className="size-4" /> {BRAND.city}
          </p>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="eyebrow mb-4">{column.title}</p>
            <ul className="space-y-2.5">
              {column.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="link-underline text-sm text-graphite">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <p className="eyebrow mb-4">Contact</p>
          <ul className="space-y-2.5 text-sm text-graphite">
            {contactHref && (
              <li>
                <a
                  href={contactHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline"
                >
                  {whatsapp.prefill ? `WhatsApp ${prettyPhone(whatsapp.number)}` : 'Nous écrire sur WhatsApp'}
                </a>
              </li>
            )}
            {CONTACT_EMAIL && (
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className="link-underline inline-flex items-center gap-2">
                  <Mail className="size-4" /> {CONTACT_EMAIL}
                </a>
              </li>
            )}
            {INSTAGRAM_HANDLE && (
              <li>
                <a
                  href={`https://www.instagram.com/${INSTAGRAM_HANDLE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline inline-flex items-center gap-2"
                >
                  <Instagram className="size-4" /> @{INSTAGRAM_HANDLE}
                </a>
              </li>
            )}
            {/*
              Le TikTok n'apparaît que le jour où le compte est renseigné dans
              la configuration : mieux vaut pas de lien qu'un lien inventé.
            */}
            {TIKTOK_HANDLE && (
              <li>
                <a
                  href={`https://www.tiktok.com/@${TIKTOK_HANDLE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline inline-flex items-center gap-2"
                >
                  <TikTokIcon className="size-4" /> @{TIKTOK_HANDLE}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="container-page hairline flex flex-col gap-2 py-6 text-[12px] text-stone sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {BRAND.name}. Tous droits réservés.
        </p>
        <p className="max-w-lg sm:text-right">
          {BRAND.name} est un service indépendant de commande groupée. Nous ne sommes ni SHEIN ni un
          revendeur officiel de SHEIN.
        </p>
      </div>
    </footer>
  );
}
