import { Instagram, Mail, MapPin } from 'lucide-react';
import { BRAND, CONTACT_EMAIL, INSTAGRAM_HANDLE } from '@/src/config/site';
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
          <p className="font-display text-2xl">{BRAND.name}</p>
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
                  href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline inline-flex items-center gap-2"
                >
                  <Instagram className="size-4" /> @{INSTAGRAM_HANDLE}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="container-page hairline flex flex-col gap-2 py-6 text-[12px] text-stone sm:flex-row sm:items-center sm:justify-between">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>
            © {new Date().getFullYear()} {BRAND.name}. Tous droits réservés.
          </span>
          {/*
            Seule porte d'entrée vers l'administration : discrète, en bas de page,
            et protégée par un code. Sans ce lien, l'espace est inaccessible depuis
            un téléphone, où l'on ne peut pas taper une adresse à la main.
          */}
          <Link to="/admin" className="link-underline text-stone">
            Espace boutique
          </Link>
        </p>
        <p className="max-w-lg sm:text-right">
          {BRAND.name} est un service indépendant de commande groupée. Nous ne sommes ni SHEIN ni un
          revendeur officiel de SHEIN.
        </p>
      </div>
    </footer>
  );
}
