import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ADMIN_PASSCODE } from '@/src/config/site';
import { STORAGE_KEYS, removeKey } from '@/src/lib/storage';
import { useRouter } from '@/src/lib/router';
import { isSupabaseConfigured } from '@/src/services';
import { supabaseSignIn, supabaseSignOut } from '@/src/services/supabaseAdapter';

interface AdminAuthValue {
  authenticated: boolean;
  /** 'supabase' = véritable authentification serveur ; 'local' = simple garde-fou. */
  mode: 'supabase' | 'local';
  signIn: (identifier: string, secret: string) => Promise<void>;
  signOut: () => void;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const { path } = useRouter();
  const mode: AdminAuthValue['mode'] = isSupabaseConfigured() ? 'supabase' : 'local';

  /*
   * L'accès n'est JAMAIS conservé.
   *
   * Rien n'est gardé d'une visite à l'autre : entrer dans l'administration
   * redemande l'identifiant à chaque fois. Un téléphone posé sur un comptoir,
   * prêté, ou perdu, n'ouvre pas la boutique. Ce que ça ne coûte pas : une
   * saisie en cours, désormais conservée à part (voir useSettingsDraft).
   */
  const [authenticated, setAuthenticated] = useState(false);

  // Reste d'une ancienne version qui gardait la session ouverte.
  useEffect(() => {
    removeKey(STORAGE_KEYS.adminSession);
  }, []);

  const signIn = useCallback<AdminAuthValue['signIn']>(
    async (identifier, secret) => {
      if (mode === 'supabase') {
        await supabaseSignIn(identifier, secret);
      } else if (secret !== ADMIN_PASSCODE) {
        throw new Error('Code incorrect.');
      }
      setAuthenticated(true);
    },
    [mode],
  );

  const signOut = useCallback(() => {
    if (mode === 'supabase') supabaseSignOut();
    removeKey(STORAGE_KEYS.adminSession);
    setAuthenticated(false);
  }, [mode]);

  // Quitter l'administration ferme l'accès : y revenir redemande l'identifiant,
  // même sans avoir rechargé la page.
  const inAdmin = path.startsWith('/admin');
  useEffect(() => {
    if (!inAdmin && authenticated) signOut();
  }, [inAdmin, authenticated, signOut]);

  const value = useMemo(
    () => ({ authenticated, mode, signIn, signOut }),
    [authenticated, mode, signIn, signOut],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth doit être utilisé dans <AdminAuthProvider>');
  return ctx;
}
