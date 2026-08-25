import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { cn } from '@/src/lib/cn';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** 'bottom' sur mobile façon iOS, 'right' en drawer sur grand écran. */
  side?: 'bottom' | 'right';
}

/** Panneau modal accessible : verrouille le scroll, se ferme à l'Échap et au clic extérieur. */
export function Sheet({ open, onClose, title, children, footer, side = 'right' }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={title}>
      <div className="animate-fade absolute inset-0 bg-ink/35 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={cn(
          'absolute flex flex-col bg-ivory shadow-2xl',
          side === 'right'
            ? 'animate-drawer inset-y-0 right-0 w-full max-w-md'
            : 'animate-sheet inset-x-0 bottom-0 max-h-[88vh] rounded-t-[--radius-xl]',
        )}
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="press grid size-9 place-items-center rounded-full bg-cream text-graphite"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">{children}</div>
        {footer && <div className="safe-bottom border-t border-line bg-white px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}
