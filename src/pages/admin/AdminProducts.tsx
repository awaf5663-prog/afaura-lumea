import { Crop, ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { FormRow, Input, Label, Select, Textarea } from '@/src/components/ui/Field';
import { Sheet } from '@/src/components/ui/Sheet';
import { COLOR_CHARTS } from '@/src/config/colorCharts';

/**
 * Lignes à remplir pour une abaya.
 *
 * Les intitulés reprennent exactement ceux du tableau « Product Chart » de
 * SHEIN (Shoulder, Bust, Length, Sleeve Length) : les chiffres se recopient
 * un pour un, sans conversion ni interprétation. Seuls les intitulés sont
 * fournis — les valeurs viennent de la fiche de l'article ou du mètre ruban
 * de la boutique, jamais d'une estimation.
 */
const MESURES_ABAYA = [
  'Épaules',
  'Poitrine',
  'Longueur',
  'Longueur de manche',
];
import { CATEGORIES } from '@/src/data/seed';
import { useToast } from '@/src/hooks/useToast';
import { formatFcfa } from '@/src/lib/format';
import { compressImage, rognerCapture } from '@/src/lib/image';
import { uid } from '@/src/lib/orderNumber';
import { findPhotoGroup, photoOptionsOf } from '@/src/lib/variants';
import { ecrireVariantes, lireVariantes } from '@/src/lib/variantText';
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
  measurements: [],
  createdAt: new Date().toISOString(),
});

export function AdminProducts({ products, reload }: { products: Product[]; reload: () => Promise<void> }) {
  const { notify } = useToast();
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [variantText, setVariantText] = useState('');

  const openEditor = (product: Product) => {
    setEditing({ ...product });
    setVariantText(ecrireVariantes(product.variants, product.optionPrices));
  };

  /*
   * Ce que le site comprendra du champ « Variantes », relu à chaque frappe.
   *
   * L'accord photo ↔ modèle est la seule chose qu'on ne peut pas deviner en
   * lisant le texte : il dépend du nombre de photos. Autant le dire ici, au
   * moment où elle tape, plutôt que de la laisser découvrir sur la fiche que
   * la galerie ne suit pas.
   */
  const apercu = useMemo(() => {
    if (!editing) return null;
    const { groups, optionPrices } = lireVariantes(variantText);
    if (groups.length === 0) return null;
    const groupePhoto = findPhotoGroup({ ...editing, variants: groups });
    return {
      groups,
      optionPrices,
      photos: editing.images.length,
      groupePhoto,
      correspondance: groupePhoto ? photoOptionsOf(groupePhoto) : [],
    };
  }, [editing, variantText]);

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim()) return notify('Le nom est obligatoire.', 'error');
    if (!Number.isFinite(editing.price) || editing.price <= 0)
      return notify('Le prix doit être supérieur à 0.', 'error');

    /*
     * Un article peut se vendre en plusieurs conditionnements : « Lot de 4 »
     * et « Lot de 12 » n'ont pas le même prix. On les saisit dans le même
     * champ, entre parenthèses, plutôt que d'ajouter un deuxième tableau à
     * remplir. Le montant retenu à la commande reste celui que la base relit.
     *
     * Même lecture que l'aperçu affiché sous le champ : c'est la même
     * fonction, donc ce qu'elle montre est exactement ce qui sera enregistré.
     */
    const { groups, optionPrices } = lireVariantes(variantText);

    const variants = groups.map((group) => {
      /*
       * `photoOptions` (quelle photo montre quel modèle) ne s'édite pas dans
       * ce champ texte : on le reprend tel quel sur le groupe existant, sinon
       * modifier un simple libellé casserait la synchronisation galerie ↔
       * modèle. On l'abandonne s'il ne colle plus — nombre de photos changé,
       * ou modèle renommé ou supprimé.
       */
      const previous = editing.variants.find((g) => g.name === group.name)?.photoOptions;
      const valid =
        previous &&
        previous.length === editing.images.length &&
        previous.every((option) => group.options.includes(option));
      return valid ? { ...group, photoOptions: previous } : group;
    });

    setSaving(true);
    try {
      await db.saveProduct({
        ...editing,
        name: editing.name.trim(),
        slug: editing.slug.trim() || slugify(editing.name),
        variants,
        optionPrices,
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

  /*
   * Les captures téléversées avant que le rognage existe gardent leurs bandes
   * noires et le bandeau de l'application. Ce bouton les reprend sur place,
   * sans rien re-téléverser. Rien n'est enregistré tant qu'on n'a pas cliqué
   * sur « Enregistrer » : la boutique voit d'abord le résultat.
   */
  const [recadrage, setRecadrage] = useState(false);
  const recadrerPhotos = async () => {
    if (!editing) return;
    setRecadrage(true);
    try {
      const avant = editing.images;
      const apres = await Promise.all(avant.map((src) => rognerCapture(src)));
      const changees = apres.filter((src, i) => src !== avant[i]).length;
      setEditing({ ...editing, images: apres });
      notify(
        changees === 0
          ? 'Aucune bande à retirer sur ces photos.'
          : `${changees} photo${changees > 1 ? 's' : ''} recadrée${changees > 1 ? 's' : ''}. Vérifiez, puis enregistrez.`,
      );
    } catch {
      notify("Le recadrage n'a pas abouti.", 'error');
    } finally {
      setRecadrage(false);
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
                  step={1}
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
                  step={1}
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
                placeholder={
                  'Modèle: Noir fleuri, Fauve (épuisé)\nFormat: Lot de 4 (550), Lot de 12 (1200)'
                }
              />
              <p className="mt-1.5 text-[12px] leading-relaxed text-stone">
                Ajoutez <span className="font-medium">(épuisé)</span> après un modèle vendu : il
                reste visible, barré, mais ne peut plus être commandé.
                <br />
                Un <span className="font-medium">nombre entre parenthèses</span> donne son propre
                prix à l'option : <span className="font-medium">Lot de 12 (1200)</span>. Les autres
                gardent le prix de l'article. La vignette affiche alors « dès… ».
              </p>

              {apercu && (
                <div className="mt-3 rounded-[--radius-md] border border-line bg-cream/70 p-3.5">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-stone">
                    Ce que la fiche fera
                  </p>

                  {/* L'accord photo ↔ modèle, dit dans les deux sens. */}
                  {apercu.groupePhoto ? (
                    <>
                      <p className="mt-2 text-[12.5px] leading-relaxed text-graphite">
                        <span className="font-medium text-mauve">
                          Chaque photo choisit son modèle.
                        </span>{' '}
                        La cliente fait défiler la galerie ou appuie sur une photo, et le modèle —
                        donc son prix — suit.
                      </p>
                      <ul className="mt-2 space-y-1">
                        {apercu.correspondance.map((option, index) => {
                          const prix = apercu.optionPrices[apercu.groupePhoto!.name]?.[option];
                          return (
                            <li
                              key={`${option}-${index}`}
                              className="flex items-center gap-2.5 text-[12.5px] text-graphite"
                            >
                              {editing.images[index] ? (
                                <img
                                  src={editing.images[index]}
                                  alt=""
                                  className="size-9 shrink-0 rounded-[--radius-xs] bg-white object-cover"
                                />
                              ) : (
                                <span className="size-9 shrink-0 rounded-[--radius-xs] bg-white" />
                              )}
                              <span className="min-w-0 flex-1">{option}</span>
                              <span className="shrink-0 text-right tabular-nums">
                                {formatFcfa(typeof prix === 'number' ? prix : editing.price)}
                                {typeof prix !== 'number' && (
                                  <span className="block text-[11px] text-stone">
                                    prix de l'article
                                  </span>
                                )}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  ) : (
                    <p className="mt-2 text-[12.5px] leading-relaxed text-graphite">
                      {apercu.photos === 0
                        ? "Ajoutez des photos : avec autant de photos que de modèles dans un groupe, appuyer sur une photo choisira le modèle."
                        : `Les photos ne choisissent pas le modèle : ${apercu.photos} photo${
                            apercu.photos > 1 ? 's' : ''
                          } pour ${apercu.groups
                            .map((g) => `${g.options.length} dans « ${g.name} »`)
                            .join(', ')}. Il en faut autant des deux côtés.`}
                    </p>
                  )}

                  {/* Les prix des autres groupes, ceux qui ne suivent pas les photos. */}
                  {apercu.groups
                    .filter((group) => group.name !== apercu.groupePhoto?.name)
                    .filter((group) => apercu.optionPrices[group.name])
                    .map((group) => (
                      <p
                        key={group.name}
                        className="mt-2 text-[12.5px] leading-relaxed text-graphite"
                      >
                        <span className="font-medium">{group.name}</span> :{' '}
                        {group.options
                          .map((option) => {
                            const prix = apercu.optionPrices[group.name]?.[option];
                            return typeof prix === 'number'
                              ? `${option} ${formatFcfa(prix)}`
                              : `${option} ${formatFcfa(editing.price)}`;
                          })
                          .join(' · ')}
                      </p>
                    ))}
                </div>
              )}
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

              {editing.images.length > 0 && (
                <div className="mt-2.5">
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<Crop className="size-4" />}
                    disabled={recadrage}
                    onClick={() => void recadrerPhotos()}
                  >
                    {recadrage ? 'Recadrage…' : 'Retirer les bandes de capture'}
                  </Button>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-stone">
                    Une capture d'écran garde la barre d'état, les bandes noires et le bouton de
                    l'application autour de la photo. Ce bouton ne garde que la photo. Les nouvelles
                    photos sont recadrées toutes seules ; celui-ci sert à reprendre les anciennes.
                    Vérifiez le résultat avant d'enregistrer.
                  </p>
                </div>
              )}
            </FormRow>

            <div className="flex flex-wrap gap-5 pt-1">
              <label className="inline-flex items-center gap-2 text-[14px]">
                <input
                  type="checkbox"
                  className="size-4 accent-[#8e2961]"
                  checked={editing.isNew ?? false}
                  onChange={(e) => setEditing({ ...editing, isNew: e.target.checked })}
                />
                Badge « Nouveau »
              </label>
              <label className="inline-flex items-center gap-2 text-[14px]">
                <input
                  type="checkbox"
                  className="size-4 accent-[#8e2961]"
                  checked={editing.isPopular ?? false}
                  onChange={(e) => setEditing({ ...editing, isPopular: e.target.checked })}
                />
                Badge « Populaire »
              </label>
              <label className="inline-flex items-start gap-2 text-[14px]">
                <input
                  type="checkbox"
                  className="mt-1 size-4 accent-[#8e2961]"
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

            {/* ── Mesures de la pièce ───────────────────────── */}
            <div className="mt-8 border-t border-line pt-6">
              <h3 className="text-[16px]">Mesures de la pièce</h3>
              <p className="mt-1 text-[12px] leading-relaxed text-stone">
                Mesurez l'article à plat, en centimètres. Tant que rien n'est saisi, la fiche
                n'affiche aucun tableau — mieux vaut pas de mesure qu'une mesure approximative
                sur laquelle une cliente choisirait sa taille.
              </p>

              <div className="mt-4 grid gap-2">
                {(editing.measurements ?? []).map((m, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      aria-label="Mesure"
                      placeholder="Longueur totale"
                      value={m.label}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          measurements: (editing.measurements ?? []).map((x, i) =>
                            i === index ? { ...x, label: e.target.value } : x,
                          ),
                        })
                      }
                    />
                    <Input
                      aria-label="Valeur"
                      placeholder="140 cm"
                      value={m.value}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          measurements: (editing.measurements ?? []).map((x, i) =>
                            i === index ? { ...x, value: e.target.value } : x,
                          ),
                        })
                      }
                    />
                    <button
                      type="button"
                      aria-label="Retirer cette mesure"
                      onClick={() =>
                        setEditing({
                          ...editing,
                          measurements: (editing.measurements ?? []).filter((_, i) => i !== index),
                        })
                      }
                      className="press shrink-0 rounded-[--radius-sm] border border-line px-3 text-stone"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Plus className="size-4" />}
                  onClick={() =>
                    setEditing({
                      ...editing,
                      measurements: [...(editing.measurements ?? []), { label: '', value: '' }],
                    })
                  }
                >
                  Ajouter une mesure
                </Button>
                {(editing.measurements ?? []).length === 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        measurements: MESURES_ABAYA.map((label) => ({ label, value: '' })),
                      })
                    }
                  >
                    Modèle abaya
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
