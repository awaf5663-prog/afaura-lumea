import { useEffect, useRef } from 'react';

/**
 * Apparition au scroll : une seule fois, 600 ms, puis l'observateur est libéré.
 * Aucune animation permanente — c'est ce qui alourdit les sites sur mobile.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(delayMs = 0) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const target = entry.target as HTMLElement;
          target.style.animationDelay = `${delayMs}ms`;
          target.classList.add('is-visible');
          observer.unobserve(target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [delayMs]);

  return ref;
}
