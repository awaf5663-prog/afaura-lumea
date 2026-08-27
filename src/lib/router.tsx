import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/**
 * Micro-routeur (History API) — ~90 lignes, zéro dépendance.
 * Suffisant pour une boutique de cette taille et bien plus léger
 * qu'un routeur complet sur une connexion mobile sénégalaise.
 */

interface RouterValue {
  path: string;
  search: URLSearchParams;
  navigate: (to: string, options?: { replace?: boolean; keepScroll?: boolean }) => void;
}

const RouterContext = createContext<RouterValue | null>(null);

/**
 * Racine de l'application, déduite de l'emplacement du bundle.
 * Vide quand le site est servi à la racine du domaine (cas normal) ; renseignée
 * quand il vit dans un sous-dossier — un aperçu hébergé, par exemple. Les URL
 * internes restent alors propres sans configuration supplémentaire.
 */
const BASE = (() => {
  try {
    const { pathname } = new URL(import.meta.url);
    const index = pathname.lastIndexOf('/assets/');
    return index > 0 ? pathname.slice(0, index) : '';
  } catch {
    return '';
  }
})();

/** Racine du site, terminée par « / ». Sert à demander un fichier public. */
export const BASE_URL = `${BASE}/`;

/**
 * L'History API est indisponible dans certains contextes embarqués.
 * On bascule alors sur le fragment (#) plutôt que de casser la navigation.
 * Un aperçu autonome peut aussi l'imposer via <meta name="lumea-router" content="hash">.
 */
let useHash = (() => {
  try {
    return document.querySelector('meta[name="lumea-router"]')?.getAttribute('content') === 'hash';
  } catch {
    return false;
  }
})();

function readLocation(): string {
  if (useHash) return window.location.hash.slice(1) || '/';
  const path = window.location.pathname.slice(BASE.length) || '/';
  return path + window.location.search;
}

function writeLocation(to: string, replace: boolean): void {
  if (!useHash) {
    try {
      const url = BASE + to;
      if (replace) window.history.replaceState({}, '', url);
      else window.history.pushState({}, '', url);
      return;
    } catch {
      useHash = true;
    }
  }
  const target = `${window.location.pathname}${window.location.search}#${to}`;
  if (replace) window.location.replace(target);
  else window.location.hash = to;
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState(readLocation);

  useEffect(() => {
    const onChange = () => setLocation(readLocation());
    window.addEventListener('popstate', onChange);
    window.addEventListener('hashchange', onChange);
    return () => {
      window.removeEventListener('popstate', onChange);
      window.removeEventListener('hashchange', onChange);
    };
  }, []);

  const navigate = useCallback<RouterValue['navigate']>((to, options) => {
    if (to === readLocation()) return;
    writeLocation(to, Boolean(options?.replace));
    setLocation(to);
    if (!options?.keepScroll) window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const value = useMemo(() => {
    const [path, search] = location.split('?');
    return { path: path.replace(/\/+$/, '') || '/', search: new URLSearchParams(search ?? ''), navigate };
  }, [location, navigate]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterValue {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter doit être utilisé dans <RouterProvider>');
  return ctx;
}

/** Compare un chemin à un motif type "/produit/:slug". Renvoie les params ou null. */
export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const p = pattern.split('/').filter(Boolean);
  const c = path.split('/').filter(Boolean);
  if (p.length !== c.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < p.length; i += 1) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodeURIComponent(c[i]);
    else if (p[i] !== c[i]) return null;
  }
  return params;
}

interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  children: ReactNode;
  replace?: boolean;
}

export function Link({ to, children, replace, onClick, ...rest }: LinkProps) {
  const { navigate } = useRouter();
  return (
    <a
      href={BASE + to}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(to, { replace });
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

/** true si le chemin courant correspond au lien (utile pour la navigation active). */
export function useIsActive(to: string, exact = false): boolean {
  const { path } = useRouter();
  if (exact || to === '/') return path === to;
  return path === to || path.startsWith(`${to}/`);
}
