import { Plus, Star, Trash2 } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { FormRow, Input, Label, Select, Textarea } from '@/src/components/ui/Field';
import { uid } from '@/src/lib/orderNumber';
import type { Product, Review } from '@/src/types';

/**
 * Avis clientes — saisie par la boutique.
 *
 * Il n'existe pas de formulaire public : un avis n'arrive ici que parce
 * qu'une cliente l'a réellement écrit sur WhatsApp et a accepté qu'il soit
 * publié. Rien n'est généré, rien n'est complété automatiquement. Un avis
 * inventé se retourne toujours contre la boutique qui l'a écrit.
 */
export function ReviewEditor({
  reviews,
  products,
  onChange,
}: {
  reviews: Review[];
  products: Product[];
  onChange: (next: Review[]) => void;
}) {
  const patch = (index: number, champs: Partial<Review>) =>
    onChange(reviews.map((r, i) => (i === index ? { ...r, ...champs } : r)));

  const ajouter = () =>
    onChange([
      ...reviews,
      {
        id: uid(),
        customerName: '',
        city: 'Saint-Louis',
        rating: 5,
        text: '',
        productId: '',
        date: new Date().toISOString().slice(0, 10),
        published: true,
      },
    ]);

  return (
    <div>
      <p className="text-[12px] leading-relaxed text-stone">
        Recopiez ici les avis que vos clientes vous ont envoyés, avec leur accord. Un avis non
        publié reste enregistré mais n'apparaît pas sur le site.
      </p>

      <div className="mt-4 grid gap-4">
        {reviews.map((review, index) => (
          <div key={review.id} className="rounded-[--radius-md] border border-line bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-[13.5px]">
                <input
                  type="checkbox"
                  className="size-4 accent-[#8e2961]"
                  checked={review.published}
                  onChange={(e) => patch(index, { published: e.target.checked })}
                />
                Publié sur le site
              </label>
              <button
                type="button"
                onClick={() => onChange(reviews.filter((_, i) => i !== index))}
                className="press inline-flex items-center gap-1.5 text-[12.5px] text-stone"
              >
                <Trash2 className="size-3.5" /> Retirer
              </button>
            </div>

            <div className="mt-3 grid gap-x-3 sm:grid-cols-2">
              <FormRow>
                <Label htmlFor={`av-nom-${index}`}>Prénom de la cliente</Label>
                <Input
                  id={`av-nom-${index}`}
                  value={review.customerName}
                  placeholder="Aïcha"
                  onChange={(e) => patch(index, { customerName: e.target.value })}
                />
              </FormRow>
              <FormRow>
                <Label htmlFor={`av-ville-${index}`} hint="facultatif">
                  Ville
                </Label>
                <Input
                  id={`av-ville-${index}`}
                  value={review.city}
                  placeholder="Saint-Louis"
                  onChange={(e) => patch(index, { city: e.target.value })}
                />
              </FormRow>
            </div>

            <div className="grid gap-x-3 sm:grid-cols-3">
              <FormRow>
                <Label htmlFor={`av-note-${index}`}>Note</Label>
                <Select
                  id={`av-note-${index}`}
                  value={String(review.rating)}
                  onChange={(e) => patch(index, { rating: Number(e.target.value) })}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} étoile{n > 1 ? 's' : ''}
                    </option>
                  ))}
                </Select>
              </FormRow>
              <FormRow>
                <Label htmlFor={`av-date-${index}`}>Date</Label>
                <Input
                  id={`av-date-${index}`}
                  type="date"
                  value={review.date.slice(0, 10)}
                  onChange={(e) => patch(index, { date: e.target.value })}
                />
              </FormRow>
              <FormRow>
                <Label htmlFor={`av-produit-${index}`} hint="vide = avis sur la boutique">
                  Article concerné
                </Label>
                <Select
                  id={`av-produit-${index}`}
                  value={review.productId}
                  onChange={(e) => patch(index, { productId: e.target.value })}
                >
                  <option value="">La boutique en général</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </FormRow>
            </div>

            <FormRow>
              <Label htmlFor={`av-texte-${index}`}>Ce qu'elle a écrit</Label>
              <Textarea
                id={`av-texte-${index}`}
                rows={3}
                value={review.text}
                placeholder="Recopiez son message, sans le réécrire."
                onChange={(e) => patch(index, { text: e.target.value })}
              />
            </FormRow>

            <p className="flex items-center gap-1 text-[12px] text-stone">
              {Array.from({ length: review.rating }, (_, i) => (
                <Star key={i} className="size-3.5 fill-current text-mauve" strokeWidth={0} />
              ))}
            </p>
          </div>
        ))}
      </div>

      <Button size="sm" variant="secondary" icon={<Plus className="size-4" />} className="mt-4" onClick={ajouter}>
        Ajouter un avis
      </Button>
    </div>
  );
}
