import { useEffect } from 'react';
import { BRAND, SITE_URL } from '@/src/config/site';

interface SeoOptions {
  title: string;
  description: string;
  image?: string;
  /** Données structurées JSON-LD (schema.org). */
  jsonLd?: Record<string, unknown>;
  noIndex?: boolean;
}

function upsertMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

/** Met à jour le <head> pour la page courante (titre, description, Open Graph, JSON-LD). */
export function useSeo({ title, description, image, jsonLd, noIndex }: SeoOptions) {
  useEffect(() => {
    const fullTitle = title.includes(BRAND.name) ? title : `${title} — ${BRAND.name}`;
    document.title = fullTitle;

    upsertMeta('meta[name="description"]', 'name', 'description', description);
    upsertMeta('meta[name="robots"]', 'name', 'robots', noIndex ? 'noindex,nofollow' : 'index,follow');
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
    upsertMeta('meta[property="og:site_name"]', 'property', 'og:site_name', BRAND.name);
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', window.location.href);
    upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    if (image) {
      const absolute = image.startsWith('http') ? image : `${SITE_URL}${image}`;
      upsertMeta('meta[property="og:image"]', 'property', 'og:image', absolute);
      upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', absolute);
    }

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + window.location.pathname;

    const scriptId = 'lumea-jsonld';
    document.getElementById(scriptId)?.remove();
    if (jsonLd) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
    return () => {
      document.getElementById(scriptId)?.remove();
    };
  }, [title, description, image, noIndex, JSON.stringify(jsonLd)]);
}
