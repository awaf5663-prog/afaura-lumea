import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { ADMIN_PASSCODE } from '@/src/config/site';
import { STORAGE_KEYS, readJson, removeKey, writeJson } from '@/src/lib/storage';
import { isSupabaseConfigured } from '@/src/services';
import { hasSupabaseSession, supabaseSignIn, supabaseSignOut } from '@/src/services/supabaseAdapter';

interface AdminAuthValue {
  authenticated: boolean;
  /** 'supabase' = véritable authentification serveur ; 'local' = simple garde-fou. */
  mode: 'supabase' | 'local';
  signIn: (identifier: string, secret: string) => Promise<void>;
  signOut: () => void;
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const mode: AdminAuthValue['mode'] = isSupabaseConfigured() ? 'supabase' : 'local';
  const [authenticated, setAuthenticated] = useState(() => {
    const session = Boolean(readJson<{ at: number } | null>(STORAGE_KEYS.adminSession, null));
    // En mode Supabase, la marque locale ne suffit pas : sans jeton, la base
    // refuse toute écriture. Mieux vaut redemander la connexion tout de suite
    // que de laisser saisir une configuration entière qui ne partira jamais.
    return mode === 'supabase' ? session && hasSupabaseSession() : session;
  });

  const signIn = useCallback<AdminAuthValue['signIn']>(
    async (identifier, secret) => {
      if (mode === 'supabase') {
        await supabaseSignIn(identifier, secret);
      } else if (secret !== ADMIN_PASSCODE) {
        throw new Error('Code incorrect.');
      }
      writeJson(STORAGE_KEYS.adminSession, { at: Date.now() });
      setAuthenticated(true);
    },
    [mode],
  );

  const signOut = useCallback(() => {
    if (mode === 'supabase') supabaseSignOut();
    removeKey(STORAGE_KEYS.adminSession);
    setAuthenticated(false);
  }, [mode]);

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
