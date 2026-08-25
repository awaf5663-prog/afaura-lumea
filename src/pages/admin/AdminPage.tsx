import { Database, LogOut, RefreshCw, ShieldAlert } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/src/components/ui/Button';
import { useAdminAuth } from '@/src/hooks/useAdminAuth';
import { useSettings } from '@/src/hooks/useSettings';
import { cn } from '@/src/lib/cn';
import { formatDate, formatFcfa } from '@/src/lib/format';
import { useRouter } from '@/src/lib/router';
import { useSeo } from '@/src/lib/seo';
import { db, isSupabaseConfigured } from '@/src/services';
import type { Order, Product, SheinRequest } from '@/src/types';
import { AdminLogin } from './AdminLogin';
import { AdminOrders } from './AdminOrders';
import { AdminProducts } from './AdminProducts';
import { AdminSettings } from './AdminSettings';
import { AdminShein } from './AdminShein';

const TABS = [
  { id: 'apercu', label: 'Aperçu' },
  { id: 'commandes', label: 'Commandes' },
  { id: 'shein', label: 'SHEIN' },
  { id: 'produits', label: 'Produits' },
  { id: 'reglages', label: 'Réglages' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function AdminPage() {
  const { authenticated, signOut, mode } = useAdminAuth();
  const { settings, refresh: refreshSettings } = useSettings();
  const { search, navigate } = useRouter();

  const [tab, setTab] = useState<TabId>((search.get('onglet') as TabId) ?? 'apercu');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<SheinRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useSeo({ title: 'Administration', description: 'Espace administrateur.', noIndex: true });

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [p, o, s] = await Promise.all([db.listProducts(), db.listOrders(), db.listSheinRequests()]);
      setProducts(p);
      setOrders(o);
      setRequests(s);
      await refreshSettings();
    } finally {
      setLoading(false);
    }
  }, [refreshSettings]);

  useEffect(() => {
    if (authenticated) void loadAll();
  }, [authenticated, loadAll]);

  if (!authenticated) return <AdminLogin />;

  const changeTab = (next: TabId) => {
    setTab(next);
    navigate(`/admin?onglet=${next}`, { keepScroll: true });
  };

  const pendingPayments = orders.filter((o) => o.paymentStatus !== 'confirmed').length;
  const openRequests = requests.filter((r) => !['delivered', 'cancelled'].includes(r.status)).length;
  const confirmedRevenue = orders
    .filter((o) => o.paymentStatus === 'confirmed')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="container-page py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Administration</p>
          <h1 className="mt-2 text-[30px]">Tableau de bord</h1>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" icon={<RefreshCw className="size-4" />} onClick={() => void loadAll()}>
            Actualiser
          </Button>
          <Button size="sm" variant="ghost" icon={<LogOut className="size-4" />} onClick={signOut}>
            Quitter
          </Button>
        </div>
      </header>

      <div
        className={cn(
          'mt-5 flex items-start gap-2.5 rounded-[--radius-md] px-4 py-3 text-[12.5px] leading-relaxed',
          isSupabaseConfigured() ? 'bg-cream text-graphite' : 'bg-blush/60 text-graphite',
        )}
      >
        {isSupabaseConfigured() ? <Database className="mt-0.5 size-4 shrink-0" /> : <ShieldAlert className="mt-0.5 size-4 shrink-0" />}
        {isSupabaseConfigured() ? (
          <span>
            Connecté à Supabase : les données sont partagées entre appareils et protégées par les
            règles RLS du projet.
          </span>
        ) : (
          <span>
            <strong className="font-medium">Mode local.</strong> Produits, commandes et demandes sont
            enregistrés dans ce navigateur uniquement — parfait pour démarrer, mais à basculer sur
            Supabase (voir README) pour partager les données entre appareils et sécuriser cet espace.
          </span>
        )}
      </div>

      <nav className="no-scrollbar mt-6 flex gap-2 overflow-x-auto border-b border-line pb-3">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => changeTab(item.id)}
            className={cn(
              'press shrink-0 rounded-full px-4 py-2 text-[13.5px] transition-colors',
              tab === item.id ? 'bg-ink text-ivory' : 'bg-cream text-graphite',
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        {loading && <p className="text-[13px] text-stone">Chargement…</p>}

        {tab === 'apercu' && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Commandes" value={String(orders.length)} hint={`${pendingPayments} paiement(s) à vérifier`} />
            <Stat label="Demandes SHEIN" value={String(requests.length)} hint={`${openRequests} en cours`} />
            <Stat label="Produits en vente" value={String(products.filter((p) => p.status === 'active').length)} hint={`${products.length} au total`} />
            <Stat
              label="Encaissé confirmé"
              value={formatFcfa(confirmedRevenue)}
              hint="Commandes marquées payées"
            />
            <div className="rounded-[--radius-lg] border border-line bg-white p-5 sm:col-span-2">
              <p className="eyebrow">Prochain groupage</p>
              <p className="mt-2 text-[18px]">
                {settings?.nextGroupingDate
                  ? formatDate(settings.nextGroupingDate)
                  : 'Aucune date définie'}
              </p>
              <button
                type="button"
                onClick={() => changeTab('reglages')}
                className="mt-2 text-[13px] text-mauve underline underline-offset-2"
              >
                Modifier la date
              </button>
            </div>
          </div>
        )}

        {tab === 'commandes' && (
          <AdminOrders orders={orders} reload={loadAll} />
        )}
        {tab === 'shein' && <AdminShein requests={requests} reload={loadAll} />}
        {tab === 'produits' && <AdminProducts products={products} reload={loadAll} />}
        {tab === 'reglages' && <AdminSettings />}
      </div>

      {mode === 'local' && tab === 'reglages' && (
        <p className="mt-8 text-[12px] text-stone">
          Rappel : en mode local, ces réglages ne s'appliquent qu'à ce navigateur.
        </p>
      )}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-[--radius-lg] border border-line bg-white p-5">
      <p className="eyebrow">{label}</p>
      <p className="mt-2 font-display text-[28px] leading-none">{value}</p>
      <p className="mt-2 text-[12.5px] text-stone">{hint}</p>
    </div>
  );
}
