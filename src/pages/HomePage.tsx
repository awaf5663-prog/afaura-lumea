import { FeaturedProducts } from '@/src/components/home/FeaturedProducts';
import { GroupingSection } from '@/src/components/home/GroupingSection';
import { Hero } from '@/src/components/home/Hero';
import { HowItWorks } from '@/src/components/home/HowItWorks';
import { SheinTeaser } from '@/src/components/home/SheinTeaser';
import { TrustRow } from '@/src/components/home/TrustRow';
import { BRAND, SITE_URL } from '@/src/config/site';
import { useProducts } from '@/src/hooks/useProducts';
import { useSeo } from '@/src/lib/seo';

export function HomePage() {
  const { products, loading } = useProducts();

  useSeo({
    title: `${BRAND.name} — Hijabs à Saint-Louis & commandes SHEIN groupées`,
    description:
      'Voiles, hijabs et abayas sur commande à Saint-Louis, et service de commande groupée SHEIN : vous transmettez vos articles, nous confirmons le montant en FCFA et regroupons l’acheminement.',
    image: products[0]?.images[0],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Store',
      name: BRAND.name,
      description: BRAND.pitch,
      url: SITE_URL,
      areaServed: 'Sénégal',
      currenciesAccepted: 'XOF',
    },
  });

  return (
    <>
      <Hero />
      <TrustRow />
      <FeaturedProducts products={products} loading={loading} />
      <HowItWorks />
      <GroupingSection />
      <SheinTeaser />
    </>
  );
}
