/**
 * Le groupage, en image : plusieurs commandes, un seul voyage.
 *
 * Dessin vectoriel plutôt que photo. Trois raisons : il dit exactement ce que
 * dit le texte à côté — des colis séparés qui deviennent un seul départ vers
 * Saint-Louis ; il reste net sur n'importe quel écran pour quelques kilo-octets ;
 * et il ne promet rien de faux, contrairement à une photo d'entrepôt qui n'est
 * pas le nôtre.
 *
 * Projection isométrique 2:1, les faces les plus éclairées vers le haut.
 */
export function GroupingIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 300"
      role="img"
      aria-label="Plusieurs colis de clientes rassemblés en un seul envoi vers Saint-Louis"
      className={className}
    >
      <defs>
        <linearGradient id="lumea-fond" x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor="#fdf7f4" />
          <stop offset="100%" stopColor="#f6ded9" />
        </linearGradient>
        {/* Ombre portée douce, posée au sol isométrique. */}
        <radialGradient id="lumea-ombre" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#5c2f38" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#5c2f38" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="300" rx="22" fill="url(#lumea-fond)" />

      {/* ── Trajet : des commandes éparses vers un seul départ ── */}
      <path
        d="M104 196 C 150 176, 176 178, 214 194"
        fill="none"
        stroke="#8f4b5b"
        strokeOpacity="0.6"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="1 7"
      />
      <path
        d="M150 140 C 186 132, 206 142, 224 160"
        fill="none"
        stroke="#8f4b5b"
        strokeOpacity="0.6"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="1 7"
      />

      {/* ── Petits colis : chacun la commande d'une cliente ── */}
      <ellipse cx="92" cy="156" rx="34" ry="11" fill="url(#lumea-ombre)" />
      <polygon points="92.0,150.0 66.0,137.0 66.0,111.0 92.0,124.0" fill="#dbb3aa" />
      <polygon points="92.0,150.0 126.0,133.0 126.0,107.0 92.0,124.0" fill="#ecd0c8" />
      <polygon points="92.0,124.0 126.0,107.0 100.0,94.0 66.0,111.0" fill="#fbf1ed" />
      <polyline points="79,117.5 79,143.5" stroke="#8f4b5b" strokeOpacity="0.5" strokeWidth="2" fill="none" />

      <ellipse cx="140" cy="192" rx="30" ry="10" fill="url(#lumea-ombre)" />
      <polygon points="140.0,186.0 118.0,175.0 118.0,153.0 140.0,164.0" fill="#dbb3aa" />
      <polygon points="140.0,186.0 170.0,171.0 170.0,149.0 140.0,164.0" fill="#ecd0c8" />
      <polygon points="140.0,164.0 170.0,149.0 148.0,138.0 118.0,153.0" fill="#fbf1ed" />
      <polyline points="129,158.5 129,180.5" stroke="#8f4b5b" strokeOpacity="0.5" strokeWidth="2" fill="none" />

      <ellipse cx="74" cy="211" rx="30" ry="10" fill="url(#lumea-ombre)" />
      <polygon points="74.0,205.0 52.0,194.0 52.0,172.0 74.0,183.0" fill="#dbb3aa" />
      <polygon points="74.0,205.0 104.0,190.0 104.0,168.0 74.0,183.0" fill="#ecd0c8" />
      <polygon points="74.0,183.0 104.0,168.0 82.0,157.0 52.0,172.0" fill="#fbf1ed" />
      <polyline points="63,177.5 63,199.5" stroke="#8f4b5b" strokeOpacity="0.5" strokeWidth="2" fill="none" />

      {/* ── Le départ groupé : une seule caisse, aux couleurs de la maison ── */}
      <ellipse cx="240" cy="242" rx="62" ry="18" fill="url(#lumea-ombre)" />
      <polygon points="232.0,232.0 186.0,209.0 186.0,157.0 232.0,180.0" fill="#743b49" />
      <polygon points="232.0,232.0 294.0,201.0 294.0,149.0 232.0,180.0" fill="#8f4b5b" />
      <polygon points="232.0,180.0 294.0,149.0 248.0,126.0 186.0,157.0" fill="#a45c6c" />
      {/* Ruban de fermeture, sur les deux faces visibles. */}
      <polyline points="209,168.5 209,220.5" stroke="#fdf7f4" strokeOpacity="0.55" strokeWidth="3" fill="none" />
      <polyline points="263,164.5 263,216.5" stroke="#fdf7f4" strokeOpacity="0.55" strokeWidth="3" fill="none" />
      <polyline points="217,153 240,164.5 263,153" stroke="#fdf7f4" strokeOpacity="0.45" strokeWidth="3" fill="none" strokeLinejoin="round" />

      {/* ── Destination ── */}
      <g transform="translate(300 62)">
        <path
          d="M18 0a18 18 0 0 0-18 18c0 12.6 15.3 26.6 17 28.1a1.5 1.5 0 0 0 2 0C20.7 44.6 36 30.6 36 18A18 18 0 0 0 18 0Z"
          fill="#8f4b5b"
        />
        <circle cx="18" cy="18" r="7" fill="#fdf7f4" />
      </g>
      <text
        x="318"
        y="130"
        textAnchor="middle"
        fontSize="13"
        fontWeight="600"
        letterSpacing="1.4"
        fill="#5c2f38"
        fontFamily="Inter, system-ui, sans-serif"
      >
        SAINT-LOUIS
      </text>
    </svg>
  );
}
