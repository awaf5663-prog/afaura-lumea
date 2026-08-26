import { useWhatsapp } from '@/src/hooks/useSettings';
import { BRAND } from '@/src/config/site';

/** Bouton WhatsApp flottant. Masqué tant qu'aucun contact WhatsApp n'est configuré. */
export function WhatsAppFab() {
  const whatsapp = useWhatsapp();
  const href = whatsapp.url(`Bonjour ${BRAND.name}, j'ai une question.`);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Nous écrire sur WhatsApp"
      className="press fixed bottom-[86px] right-4 z-[75] grid size-[52px] place-items-center rounded-full bg-[#17803f] text-white shadow-lg shadow-black/15 lg:bottom-6 lg:right-6"
    >
      <svg viewBox="0 0 24 24" className="size-6 fill-current" aria-hidden>
        <path d="M17.47 14.38c-.3-.15-1.74-.86-2.01-.96-.27-.1-.47-.15-.66.15-.2.3-.76.96-.93 1.16-.17.2-.34.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.19-.24-.57-.48-.5-.66-.5h-.56c-.2 0-.5.07-.77.37-.27.3-1.01.99-1.01 2.41s1.04 2.8 1.18 3c.15.2 2.04 3.12 4.95 4.38.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.12.56-.08 1.74-.71 1.98-1.4.24-.69.24-1.28.17-1.4-.07-.12-.27-.2-.57-.35zM12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.86 9.86 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.02h-.01c-1.5 0-2.97-.4-4.25-1.16l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.16 8.24z" />
      </svg>
    </a>
  );
}
