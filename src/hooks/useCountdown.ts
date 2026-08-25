import { useEffect, useState } from 'react';

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  /** false si aucune date n'est configurée — on n'affiche alors aucun compteur. */
  configured: boolean;
}

function compute(target: string): Countdown {
  if (!target) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false, configured: false };
  }
  const end = new Date(target).getTime();
  if (Number.isNaN(end)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false, configured: false };
  }
  const diff = end - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, configured: true };
  }
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isPast: false,
    configured: true,
  };
}

/** Compte à rebours du prochain groupage. Jamais de date inventée : vide = rien d'affiché. */
export function useCountdown(targetIso: string): Countdown {
  const [state, setState] = useState<Countdown>(() => compute(targetIso));

  useEffect(() => {
    setState(compute(targetIso));
    if (!targetIso) return;
    const id = window.setInterval(() => setState(compute(targetIso)), 1000);
    return () => window.clearInterval(id);
  }, [targetIso]);

  return state;
}
