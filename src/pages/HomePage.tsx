import { FeaturedProducts } from '@/src/components/home/FeaturedProducts';
import { GroupingSection } from '@/src/components/home/GroupingSection';
import { Hero } from '@/src/components/home/Hero';
import { Rayons } from '@/src/components/home/Rayons';
import { Reviews } from '@/src/components/home/Reviews';
import { InstallerApp } from '@/src/components/pwa/InstallerApp';
import { HowItWorks } from '@/src/components/home/HowItWorks';
import { PremierGroupage } from '@/src/components/home/PremierGroupage';
import { SheinTeaser } from '@/src/components/home/SheinTeaser';
import { TrustRow } from '@/src/components/home/TrustRow';
import { BRAND, SITE_URL } from '@/src/config/site';
import { useProducts } from '@/src/hooks/useProducts';
import { useSeo } from '@/src/lib/seo';

export function HomePage() {
  const { products, loading } = useProducts();

  useSeo({
    title: `${BRAND.name} — Mode, beauté et commandes groupées à Saint-Louis`,
    description:
      'Voiles et abayas, parfums, soins du corps, sacs, chaussures, maquillage et tenues de nuit, commandés pour vous à Saint-Louis. Et le service de commande groupée SHEIN quand vous cherchez autre chose : montant confirmé en FCFA avant tout paiement.',
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
      <PremierGroupage />
      <TrustRow />
      {/* L'étendue de la boutique, avant les nouveautés : une visiteuse doit
          voir tout de suite qu'on ne vend pas que des voiles. */}
      <Rayons products={products} />
      <FeaturedProducts products={products} loading={loading} />
      <HowItWorks />
      <GroupingSection />
      <Reviews />
      <SheinTeaser />
      <InstallerApp />
    </>
  );
}
