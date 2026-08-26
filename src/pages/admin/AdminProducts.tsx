import { ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { FormRow, Input, Label, Select, Textarea } from '@/src/components/ui/Field';
import { Sheet } from '@/src/components/ui/Sheet';
import { COLOR_CHARTS } from '@/src/config/colorCharts';
import { CATEGORIES } from '@/src/data/seed';
import { useToast } from '@/src/hooks/useToast';
import { formatFcfa } from '@/src/lib/format';
import { compressImage } from '@/src/lib/image';
import { uid } from '@/src/lib/orderNumber';
import { db } from '@/src/services';
import type { Product } from '@/src/types';

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const blank = (): Product => ({
  id: uid(),
  slug: '',
  name: '',
  description: '',
  price: 0,
  compareAtPrice: null,
  category: CATEGORIES[0].id,
  images: [],
  variants: [],
  stock: null,
  status: 'active',
  isNew: false,
  isPopular: false,
  otherColorsAvailable: false,
  colorChartId: null,
  createdAt: new Date().toISOString(),
});

export function AdminProducts({ products, reload }: { products: Product[]; reload: () => Promise<void> }) {
  const { notify } = useToast();
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [variantText, setVariantText] = useState('');

  const openEditor = (product: Product) => {
    setEditing({ ...product });
    setVariantText(
      product.variants
        .map((group) => {
          const options = group.options.map((option) =>
            (group.soldOutOptions ?? []).includes(option) ? `${option} (épuisé)` : option,
          );
          return `${group.name}: ${options.join(', ')}`;
        })
        .join('\n'),
    );
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim()) return notify('Le nom est obligatoire.', 'error');
    if (!Number.isFinite(editing.price) || editing.price <= 0)
      return notify('Le prix doit être supérieur à 0.', 'error');

    const variants = variantText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, rawOptions = ''] = line.split(':');
        const entries = rawOptions
          .split(',')
          .map((option) => option.trim())
          .filter(Boolean);
        // « Noir fleuri (épuisé) » retire le modèle de la vente sans le supprimer.
        const options = entries.map((entry) => entry.replace(/\s*\(épuisé\)\s*$/i, '').trim());
        const soldOutOptions = entries
          .filter((entry) => /\(épuisé\)\s*$/i.test(entry))
          .map((entry) => entry.replace(/\s*\(épuisé\)\s*$/i, '').trim());
        return { name: name.trim(), options, soldOutOptions };
      })
      .filter((group) => group.name && group.options.length > 0);

    setSaving(true);
    try {
      await db.saveProduct({
        ...editing,
        name: editing.name.trim(),
        slug: editing.slug.trim() || slugify(editing.name),
        variants,
      });
      await reload();
      setEditing(null);
      notify('Produit enregistré');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Enregistrement impossible.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (product: Product) => {
    if (!window.confirm(`Supprimer définitivement « ${product.name} » ?`)) return;
    try {
      await db.deleteProduct(product.id);
      await reload();
      notify('Produit supprimé');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Suppression impossible.', 'error');
    }
  };

  const addImage = async (file: File | undefined) => {
    if (!file || !editing) return;
    try {
      const data = await compressImage(file, 1200, 0.78);
      setEditing({ ...editing, images: [...editing.images, data] });
    } catch {
      notify("Cette image n'a pas pu être lue.", 'error');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[24px]">Produits ({products.length})</h2>
        <Button size="sm" icon={<Plus className="size-4" />} onClick={() => openEditor(blank())}>
          Ajouter
        </Button>
      </div>

      <ul className="mt-6 divide-y divide-line rounded-[--radius-lg] border border-line bg-white">
        {products.map((product) => (
          <li key={product.id} className="flex items-center gap-4 p-4">
            <div className="size-14 shrink-0 overflow-hidden rounded-[--radius-xs] bg-cream">
              {product.images[0] && (
                <img src={product.images[0]} alt="" className="size-full object-cover" loading="lazy" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-medium">{product.name}</p>
              <p className="mt-0.5 text-[12.5px] text-stone">
                {formatFcfa(product.price)} ·{' '}
                {product.stock === null ? 'stock non suivi' : `${product.stock} en stock`}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {product.status === 'draft' && <Badge tone="neutral">Brouillon</Badge>}
                {product.status === 'sold_out' && <Badge tone="soldout">Épuisé</Badge>}
                {product.isNew && <Badge tone="new">Nouveau</Badge>}
                {product.isPopular && <Badge tone="popular">Populaire</Badge>}
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => openEditor(product)}
                aria-label={`Modifier ${product.name}`}
                className="press grid size-9 place-items-center rounded-full bg-cream"
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => void remove(product)}
                aria-label={`Supprimer ${product.name}`}
                className="press grid size-9 place-items-center rounded-full bg-cream text-[#8a2f2f]"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Sheet
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.name ? 'Modifier le produit' : 'Nouveau produit'}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" full onClick={() => setEditing(null)}>
              Annuler
            </Button>
            <Button full loading={saving} onClick={() => void save()}>
              Enregistrer
            </Button>
          </div>
        }
      >
        {editing && (
          <div>
            <FormRow>
              <Label htmlFor="p-name">Nom</Label>
              <Input
                id="p-name"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </FormRow>
            <FormRow>
              <Label htmlFor="p-desc">Description</Label>
              <Textarea
                id="p-desc"
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </FormRow>
            <div className="grid gap-x-4 sm:grid-cols-2">
              <FormRow>
                <Label htmlFor="p-price">Prix (FCFA)</Label>
                <Input
                  id="p-price"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={100}
                  value={editing.price || ''}
                  onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                />
              </FormRow>
              <FormRow>
                <Label htmlFor="p-compare" hint="(prix barré, facultatif)">
                  Ancien prix
                </Label>
                <Input
                  id="p-compare"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={100}
                  value={editing.compareAtPrice ?? ''}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      compareAtPrice: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </FormRow>
              <FormRow>
                <Label htmlFor="p-cat">Catégorie</Label>
                <Select
                  id="p-cat"
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                >
                  {CATEGORIES.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </FormRow>
              <FormRow>
                <Label htmlFor="p-status">Statut</Label>
                <Select
                  id="p-status"
                  value={editing.status}
                  onChange={(e) =>
                    setEditing({ ...editing, status: e.target.value as Product['status'] })
                  }
                >
                  <option value="active">En vente</option>
                  <option value="draft">Brouillon (masqué)</option>
                  <option value="sold_out">Épuisé</option>
                </Select>
              </FormRow>
              <FormRow>
                <Label htmlFor="p-stock" hint="(vide = non suivi)">
                  Stock
                </Label>
                <Input
                  id="p-stock"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={editing.stock ?? ''}
                  onChange={(e) =>
                    setEditing({ ...editing, stock: e.target.value === '' ? null : Number(e.target.value) })
                  }
                />
              </FormRow>
              <FormRow>
                <Label htmlFor="p-chart" hint="(numéros de teintes)">
                  Nuancier
                </Label>
                <Select
                  id="p-chart"
                  value={editing.colorChartId ?? ''}
                  onChange={(e) =>
                    setEditing({ ...editing, colorChartId: e.target.value || null })
                  }
                >
                  <option value="">Aucun</option>
                  {COLOR_CHARTS.map((chart) => (
                    <option key={chart.id} value={chart.id}>
                      {chart.label} ({chart.swatches.length})
                    </option>
                  ))}
                </Select>
              </FormRow>
              <FormRow>
                <Label htmlFor="p-slug" hint="(URL)">
                  Identifiant
                </Label>
                <Input
                  id="p-slug"
                  value={editing.slug}
                  placeholder={slugify(editing.name)}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                />
              </FormRow>
            </div>

            <FormRow>
              <Label htmlFor="p-variants" hint="une ligne par groupe">
                Variantes
              </Label>
              <Textarea
                id="p-variants"
                value={variantText}
                onChange={(e) => setVariantText(e.target.value)}
                placeholder={'Modèle: Noir fleuri, Fauve (épuisé)\nTaille: 1m80, 2m00'}
              />
              <p className="mt-1.5 text-[12px] leading-relaxed text-stone">
                Ajoutez <span className="font-medium">(épuisé)</span> après un modèle vendu : il
                reste visible, barré, mais ne peut plus être commandé. Si le groupe a autant
                d'options que de photos, faire défiler la galerie sélectionne le modèle.
              </p>
            </FormRow>

            <FormRow>
              <Label>Photos</Label>
              <div className="flex flex-wrap gap-2">
                {editing.images.map((image, index) => (
                  <div key={index} className="relative size-20 overflow-hidden rounded-[--radius-xs] bg-cream">
                    <img src={image} alt="" className="size-full object-cover" />
                    <button
                      type="button"
                      aria-label="Retirer la photo"
                      onClick={() =>
                        setEditing({ ...editing, images: editing.images.filter((_, i) => i !== index) })
                      }
                      className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-ink/80 text-ivory"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
                <label className="press grid size-20 cursor-pointer place-items-center rounded-[--radius-xs] border border-dashed border-line bg-white text-stone">
                  <ImagePlus className="size-5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => void addImage(e.target.files?.[0])}
                  />
                </label>
              </div>
            </FormRow>

            <div className="flex flex-wrap gap-5 pt-1">
              <label className="inline-flex items-center gap-2 text-[14px]">
                <input
                  type="checkbox"
                  className="size-4 accent-[#8f4b5b]"
                  checked={editing.isNew ?? false}
                  onChange={(e) => setEditing({ ...editing, isNew: e.target.checked })}
                />
                Badge « Nouveau »
              </label>
              <label className="inline-flex items-center gap-2 text-[14px]">
                <input
                  type="checkbox"
                  className="size-4 accent-[#8f4b5b]"
                  checked={editing.isPopular ?? false}
                  onChange={(e) => setEditing({ ...editing, isPopular: e.target.checked })}
                />
                Badge « Populaire »
              </label>
              <label className="inline-flex items-start gap-2 text-[14px]">
                <input
                  type="checkbox"
                  className="mt-1 size-4 accent-[#8f4b5b]"
                  checked={editing.otherColorsAvailable ?? false}
                  onChange={(e) =>
                    setEditing({ ...editing, otherColorsAvailable: e.target.checked })
                  }
                />
                <span>
                  Autres coloris sur demande
                  <span className="mt-0.5 block text-[12px] leading-snug text-stone">
                    La fiche invite la cliente à préciser le coloris qu'elle cherche.
                  </span>
                </span>
              </label>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
