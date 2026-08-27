import { Star } from 'lucide-react';
import { useSettings } from '@/src/hooks/useSettings';
import { formatDate } from '@/src/lib/format';
import type { Review } from '@/src/types';

/** Avis publiés, du plus récent au plus ancien. */
export function usePublishedReviews(productId?: string): Review[] {
  const { settings } = useSettings();
  return (settings?.reviews ?? [])
    .filter((r) => r.published && r.text.trim() && r.customerName.trim())
    .filter((r) => (productId ? r.productId === productId : true))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

function Etoiles({ note }: { note: number }) {
  return (
    <p className="flex gap-0.5" aria-label={`${note} sur 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={i < note ? 'size-3.5 fill-current text-mauve' : 'size-3.5 text-line'}
          strokeWidth={i < note ? 0 : 1.6}
        />
      ))}
    </p>
  );
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <figure className="rounded-[--radius-md] border border-line bg-white p-5">
      <Etoiles note={review.rating} />
      <blockquote className="mt-3 text-[14px] leading-relaxed text-graphite">
        « {review.text} »
      </blockquote>
      <figcaption className="mt-3 text-[12.5px] text-stone">
        {review.customerName}
        {review.city ? ` · ${review.city}` : ''}
        {review.date ? ` · ${formatDate(review.date)}` : ''}
      </figcaption>
    </figure>
  );
}

/**
 * Bloc d'avis de la page d'accueil.
 *
 * Rien ne s'affiche tant qu'aucun avis n'a été recueilli : une section vide,
 * ou pire un avis inventé, vaut moins que pas de section du tout.
 */
export function Reviews({ limit = 3 }: { limit?: number }) {
  const reviews = usePublishedReviews();
  if (reviews.length === 0) return null;

  return (
    <section className="container-page py-16">
      <p className="eyebrow">Elles ont commandé</p>
      <h2 className="mt-2 text-[28px] sm:text-[34px]">Ce qu'en disent nos clientes</h2>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.slice(0, limit).map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  );
}
