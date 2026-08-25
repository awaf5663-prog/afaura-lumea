import type { ReactNode } from 'react';
import { useWhatsapp } from '@/src/hooks/useSettings';
import { useToast } from '@/src/hooks/useToast';
import { cn } from '@/src/lib/cn';

/**
 * Lien WhatsApp — un vrai <a>, jamais window.open().
 *
 * C'est important : les navigateurs mobiles bloquent l'ouverture de fenêtre dès
 * qu'elle ne suit pas immédiatement le geste de l'utilisatrice, et le clic
 * semble alors ne rien faire. Un lien, lui, part toujours : il s'ouvre aussi
 * par appui long, et il est copiable.
 *
 * Quand le numéro n'est pas configuré (repli sur le lien court WhatsApp
 * Business), le message est copié au passage, sans empêcher la navigation.
 */
export function WhatsAppLink({
  message,
  children,
  className,
  variant = 'solid',
  onMissing,
}: {
  message: string;
  children: ReactNode;
  className?: string;
  variant?: 'solid' | 'plain';
  /** Rendu de repli quand aucun contact WhatsApp n'est configuré. */
  onMissing?: ReactNode;
}) {
  const whatsapp = useWhatsapp();
  const { notify } = useToast();
  const href = whatsapp.url(message);

  if (!href) return <>{onMissing ?? null}</>;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        // Copie « au passage » : on ne bloque surtout pas la navigation.
        if (!whatsapp.prefill && message) {
          void navigator.clipboard
            ?.writeText(message)
            .then(() => notify('Message copié — collez-le dans la conversation'))
            .catch(() => undefined);
        }
      }}
      className={cn(
        variant === 'solid'
          ? 'press inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[#1f9c53] px-7 text-[15px] font-medium text-white hover:bg-[#188143]'
          : 'underline underline-offset-2',
        className,
      )}
    >
      {children}
    </a>
  );
}
