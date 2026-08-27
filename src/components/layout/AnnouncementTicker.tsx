/**
 * Bandeau d'annonce défilant.
 *
 * Ce qui s'affiche vient d'un seul endroit : Administration → Réglages →
 * Bandeau d'annonce. Vide, le bandeau n'existe pas — pas de bandeau décoratif
 * qui annoncerait une promotion inexistante.
 *
 * La vitesse s'adapte à la longueur du texte : une annonce courte défilerait
 * trop vite et une longue trop lentement à durée fixe. On vise une allure de
 * lecture constante, quelle que soit la phrase.
 */
export function AnnouncementTicker({ message }: { message: string }) {
  const texte = message.trim();
  if (!texte) return null;

  // Environ 55 pixels par seconde, en estimant 7,5 px par caractère.
  const secondes = Math.max(14, Math.round((texte.length * 7.5) / 55));

  return (
    <div className="ticker relative overflow-hidden bg-mauve text-ivory" role="status" aria-live="polite">
      <div
        className="ticker-track py-2 text-[12.5px] tracking-wide"
        style={{ animationDuration: `${secondes}s` }}
      >
        {/* Deux copies : la seconde prend la place de la première quand la
            boucle repart, ce qui rend le raccord invisible. */}
        {[1, 2].map((copie) => (
          <span
            key={copie}
            data-ticker-copie={copie}
            // La copie de doublure ne doit pas être relue par un lecteur d'écran.
            aria-hidden={copie === 2}
            className="flex shrink-0 items-center whitespace-nowrap"
          >
            <span className="px-6">{texte}</span>
            <span aria-hidden className="opacity-60">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
