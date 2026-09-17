-- ═══════════════════════════════════════════════════════════════════
--  Catalogue Afaura Luméa
--
--  Généré par scripts/generate-supabase-seed.mjs — ne pas modifier à la
--  main : relancer le script après avoir changé src/data/seed.ts.
--
--  À exécuter APRÈS schema.sql, dans le SQL editor du projet Supabase.
--  Réexécutable sans risque : les articles déjà présents sont mis à jour,
--  et les photos déjà téléversées depuis l'admin ne sont jamais écrasées.
-- ═══════════════════════════════════════════════════════════════════

-- Catégories du catalogue : Abaya, Pièce unique, Viscose premium, Jersey liquide, Modal imprimé, Modal simple, Satin imprimé, Dentelle, Jersey, Jersey frisé, Hijab tape, Voile rayures, Modal fulani, Modal nayra, Silk imprimé, Organza dégradé, Voile imprimé, Rentrée, Packs, Robes, Lips gloss, Gommages, Parfums, Maquillage, Bougies, Sacs, Sous-vêtements & pyjamas, Chaussures, Combinaisons, Gels de douche, Laits corporels, Soins du visage, Accessoires beauté

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'jersey', 'jersey', 'Jersey', 'Le hijab du quotidien. Maille jersey souple, tombé net, aucune épingle nécessaire. Choisissez votre teinte dans le nuancier ci-dessous.',
  2500, null, 'jersey',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  false, false,
  false, 'modal36'
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'jersey-frise', 'jersey-frise', 'Jersey frisé', 'Jersey à bord frisé : la maille est terminée par des volants qui tiennent la forme et habillent le visage sans épingle. Faites défiler les photos pour voir le tombé et le détail du frisé, puis choisissez votre numéro de teinte dans le nuancier ci-dessous.',
  3500, null, 'jersey_frise',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  false, false,
  false, 'frise36'
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'satin-imprime', 'satin-imprime', 'Satin imprimé', 'Satin fluide au léger reflet, en dégradés et pailletés. Faites défiler les photos pour voir les modèles, puis choisissez le vôtre.',
  3500, null, 'satin_imprime',
  '[]'::jsonb, '[{"name":"Modèle","options":["Dégradé vert & bleu","Sable pailleté","Noir pailleté","Vert d''eau","Dégradé vert & rouille"],"soldOutOptions":[]}]'::jsonb, '{}'::jsonb, null, 'active',
  false, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'voile-mj', 'voile-mj', 'Jersey liquide', 'Notre voile le plus fluide : un mélange de modal et de jersey. Il a la douceur et le tombé du modal, avec le maintien du jersey — il ne glisse pas et ne demande pas d''épingle. 170 × 60 cm. Faites défiler les photos pour voir le tombé, puis choisissez votre numéro de teinte dans le nuancier ci-dessous : 23 coloris, dont quatre portent un nom chez notre fournisseur — White, Cream, Black et Navy. Une autre teinte vous tente ? Elle peut se commander : dites-nous laquelle, nous vérifions auprès de notre fournisseur et vous confirmons avant tout paiement.',
  5000, null, 'voile_mj',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  false, false,
  true, 'jersey23'
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'modal-simple', 'modal-simple', 'Modal simple', 'Modal uni, doux et respirant, très léger à porter. Un drapé souple qui reste impeccable toute la journée. Choisissez votre teinte dans le nuancier ci-dessous.',
  4500, null, 'modal_simple',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  false, false,
  true, 'modal34'
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'modal-imprime', 'modal-imprime', 'Modal imprimé', 'Le confort du modal avec un imprimé travaillé. Faites défiler les photos pour voir les modèles, puis choisissez celui qui vous plaît. Vendu à l''unité.',
  5000, null, 'modal_imprime',
  '[]'::jsonb, '[{"name":"Modèle","options":["Zébré bordeaux","Pois sur brun","Pois sur blanc","Aquarelle","Léopard"],"soldOutOptions":[]}]'::jsonb, '{}'::jsonb, null, 'active',
  false, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'voile-leopard', 'voile-leopard', 'Voile léopard', 'Grand foulard léger en voile de polyester, imprimé en numérique. Il se porte en hijab comme en écharpe, sur une tenue unie qu''il suffit à habiller. Choisissez votre coloris ci-dessus : les photos suivent votre choix. D''autres couleurs arrivent — dites-nous celle que vous cherchez, nous confirmons avant paiement.',
  2000, null, 'voile_imprime',
  '[]'::jsonb, '[{"name":"Coloris","options":["Bleu","Gris","Marron","Blanc & noir","Kaki clair — zébré","Kaki","Gris foncé","Gris rose","Café","Noir","Gris clair","Marron clair","Brun rose"],"soldOutOptions":[]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'dentelle', 'dentelle', 'Dentelle', 'Hijab bordé de dentelle, pour les occasions : cérémonies, fêtes, invitations. Choisissez votre teinte dans le nuancier ci-dessous.',
  5000, null, 'dentelle',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  false, false,
  false, 'dentelle12'
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'voile-rayures', 'voile-rayures', 'Voile rayures', 'Un voile teint en rayures fondues : deux ou trois teintes qui se répondent sur toute la longueur. Faites défiler les photos pour voir les coloris portés, puis choisissez le vôtre. D''autres teintes existent hors des photos : dites-nous celle que vous cherchez, nous confirmons avant paiement.',
  5000, null, 'voile_rayures',
  '[]'::jsonb, '[{"name":"Coloris","options":["Bleu marine","Bleu canard & rouille","Gris & rose","Kaki & vert olive","Anthracite","Bleu & bleu ciel","Lilas","Orange & violet"],"soldOutOptions":[]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'modal-fulani', 'modal-fulani', 'Modal fulani', 'Modal au grain froissé, teint en nuances fondues : le relief reste visible dans le tissu et le dessin change d''un numéro à l''autre. Doux et mat. Choisissez votre numéro de teinte ci-dessus — le nuancier du fournisseur en compte davantage que ce que nos photos nomment, demandez-nous celui qui vous manque.',
  5000, null, 'modal_fulani',
  '[]'::jsonb, '[{"name":"Teinte","options":["#2 Charcoal black","#3 Navy","#6 Olive grass","#7 Brown","#10 Purple","#11 Sand"],"soldOutOptions":[]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'modal-nayra', 'modal-nayra', 'Modal nayra', 'Un modal dégradé : la couleur part soutenue à un bout et s''éclaircit jusqu''à l''autre, si bien que le drapé change de teinte selon la façon dont vous le posez. Tombé souple, fini mat. Faites défiler les photos pour voir les dégradés, puis choisissez le vôtre.',
  5000, null, 'modal_nayra',
  '[]'::jsonb, '[{"name":"Dégradé","options":["Gris-bleu & sable","Bordeaux & rose","Violet & crème","Orange & brun"],"soldOutOptions":[]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'silk-imprime', 'silk-imprime', 'Silk imprimé', 'Voile satiné à imprimé marbré : la lumière y accroche et le motif se déplie sur toute la longueur, comme une peinture. Pour les tenues où l''on veut être vue. Faites défiler les photos pour voir les imprimés ; il en existe d''autres que ceux montrés, demandez-nous.',
  5000, null, 'silk_imprime',
  '[]'::jsonb, '[{"name":"Imprimé","options":["Marbré bordeaux","Léopard brun","Marbré doré"],"soldOutOptions":[]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'organza-degrade', 'organza-degrade', 'Organza dégradé', 'Organza léger et légèrement brillant, teint en dégradé. Plus transparent que nos modals : il se porte volontiers en deuxième voile, sur une sous-cagoule ou un hijab uni, pour les cérémonies. Faites défiler les photos pour voir les dégradés, puis choisissez le vôtre.',
  5500, null, 'organza_degrade',
  '[]'::jsonb, '[{"name":"Dégradé","options":["Rose & nude","Gris & noir","Prune","Brun","Rouge & noir"],"soldOutOptions":[]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'piece-unique', 'piece-unique', 'Pièce unique', 'Des modèles rares, reçus à l''unité. Faites défiler les photos pour les voir un par un, puis choisissez celui que vous voulez : chaque modèle n''existe qu''en un seul exemplaire.',
  5000, null, 'piece_unique',
  '[]'::jsonb, '[{"name":"Modèle","options":["Noir fleuri","Crème fleuri","Taupe fleuri","Fauve","Écru & or"],"soldOutOptions":[]}]'::jsonb, '{}'::jsonb, null, 'active',
  false, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'voile-viscose', 'voile-viscose', 'Voile viscose premium', 'Ce n''est pas du modal : la viscose est une autre matière, nettement plus légère et plus aérienne. Le voile se pose presque sans poids, avec un tombé long et un léger effet froissé — parfait pour les journées chaudes. Faites défiler les photos pour voir le rendu, puis choisissez votre numéro de teinte dans le nuancier ci-dessous.',
  5000, null, 'voile_viscose',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  false, false,
  false, 'modal36'
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'abaya', 'abaya', 'Abaya', 'Abayas longues, coupe ample et ouverte, à porter sur une tenue. Chaque modèle a son propre tissu et son propre imprimé. Faites défiler les photos pour les voir un par un, puis choisissez le vôtre — la coupe et la longueur vous sont confirmées sur WhatsApp avant la validation de la commande.',
  15000, null, 'abaya',
  '[]'::jsonb, '[{"name":"Modèle","options":["Noir & blanc plissé","Bleu zébré","Rose cachemire","Beige léopard satiné","Noir uni","Marbré brun & écru","Bleu délavé","Prune plissé","Kaki marbré","Léopard fauve"],"soldOutOptions":[],"photoOptions":["Noir & blanc plissé","Bleu zébré","Rose cachemire","Beige léopard satiné","Noir uni","Marbré brun & écru","Bleu délavé","Prune plissé","Kaki marbré","Léopard fauve","Léopard fauve"]}]'::jsonb, '{}'::jsonb, null, 'active',
  false, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'hijab-tape', 'hijab-tape', 'Hijab tape', 'Les bandes adhésives double face qui remplacent les épingles : on colle, le voile reste en place toute la journée, et rien ne marque ni n''abîme le tissu. Un sachet contient plusieurs bandes.',
  2000, null, 'hijab_tape',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  false, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'bics-souligneurs', 'bics-souligneurs', 'Bics et souligneurs', 'Trois façons de commander, chacune à son prix.
• Lot de 6 stylos et souligneurs, coloris rose.
• Bic bleu, à l''unité — stylo gel, encre à séchage rapide, pointe 0,5 mm.
• Bic rouge, à l''unité — le même, en rouge.
Les bics se commandent à la pièce : la photo montre la boîte de 6, mais vous n''en prenez qu''un si vous voulez.',
  550, null, 'rentree',
  '[]'::jsonb, '[{"name":"Modèle","options":["Lot de 6 stylos et souligneurs","Bic bleu","Bic rouge"]}]'::jsonb, '{"Modèle":{"Lot de 6 stylos et souligneurs":550,"Bic bleu":100,"Bic rouge":100}}'::jsonb, null, 'draft',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'crayon-criterium', 'crayon-criterium', 'Crayons critérium', 'Coffret transparent refermable, compté sur la photo :
• 6 crayons critérium en coloris pastel — trois en 0,5 mm, trois en 0,7 mm ;
• 6 étuis de mines HB — trois en 0,5 mm, trois en 0,7 mm, 60 mines par étui ;
• 3 gommes dégradées, plus des recharges de gomme pour les crayons.
La boîte se commande entière.',
  1000, null, 'rentree',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'classeur', 'classeur', 'Classeur à soufflets', 'Classeur à compartiments pour trier cours, feuilles et documents, coloris rose. Planche d''étiquettes de couleur fournie.',
  1000, null, 'rentree',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'protec-ordinateur', 'protec-ordinateur', 'Protection de clavier', 'Film souple à poser sur le clavier de l’ordinateur, coloris rose translucide, contre la poussière et les éclaboussures. Précisez le modèle de votre ordinateur au moment de commander.',
  1000, null, 'rentree',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'coque-telephone', 'coque-telephone', 'Coque de téléphone', 'Coque transparente, motif squelette et fleurs. Choisissez le modèle de votre téléphone ci-dessous — nous confirmons la disponibilité avant paiement. Si le vôtre n''est pas dans la liste, prenez « Autre modèle » et dites-le nous sur WhatsApp.',
  1500, null, 'rentree',
  '[]'::jsonb, '[{"name":"Modèle de téléphone","options":["iPhone 11","iPhone 11 Pro Max","iPhone 12","iPhone 12 Pro Max","iPhone 13","iPhone 13 Pro Max","iPhone 14","iPhone 14 Pro Max","iPhone 15","iPhone 15 Pro Max","iPhone 16","iPhone 16 Pro Max","Samsung Galaxy A","Tecno","Infinix","Xiaomi / Redmi","Autre modèle"]}]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'adaptateur-usb', 'adaptateur-usb', 'Adaptateur USB', 'Adaptateur pour brancher une clé USB ou un disque sur téléphone et tablette, coloris lilas. Précisez le type de prise de votre appareil au moment de commander.',
  3000, null, 'rentree',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'gourde', 'gourde', 'Gourde', 'Gourde isotherme pour la journée de cours. Plusieurs coloris : précisez celui que vous souhaitez, nous confirmons la disponibilité.',
  3500, null, 'rentree',
  '[]'::jsonb, '[{"name":"Couleur","options":["Rose","Blanc","Noir"]}]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'bloc-note', 'bloc-note', 'Bloc-notes', 'Carnet à spirale, couverture rigide gravée, coloris rose. Pour les cours, les listes ou le planning de la semaine.',
  4000, null, 'rentree',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'miroir', 'miroir', 'Miroir', 'Petit miroir à poser, cadre ondulé, coloris rose poudré. Pour le bureau, la chambre ou la table de chevet.',
  400, null, 'rentree',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'sac-ordinateur', 'sac-ordinateur', 'Sac ordinateur', 'Housse matelassée pour ordinateur portable. Précisez la taille de votre écran au moment de commander.',
  10000, null, 'rentree',
  '[]'::jsonb, '[{"name":"Couleur","options":["Blanc","Noir","Rose"]}]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'mini-gourde', 'mini-gourde', 'Mini-gourde', 'Petite gourde isotherme à emporter. Plusieurs coloris : précisez celui que vous souhaitez, nous confirmons la disponibilité.',
  0, null, 'rentree',
  '[]'::jsonb, '[{"name":"Couleur","options":["Crème","Rose poudré","Lilas"]}]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'robe-bordeaux', 'robe-bordeaux', 'Robe longue bordeaux', 'Robe longue en maille souple, décolleté V et manches chauve-souris en voile. Buste et taille froncés, jupe fluide jusqu''au sol.',
  11000, null, 'robes',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'robe-bleu-ciel', 'robe-bleu-ciel', 'Robe cintrée bleu ciel', 'Robe mi-longue près du corps, col croisé et manches longues, taille marquée par un drapé. Se porte au bureau comme en soirée.',
  11000, null, 'robes',
  '[]'::jsonb, '[{"name":"Couleur","options":["Bleu ciel","Noir","Rouge","Bleu roi","Vert forêt"]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'robe-rayures', 'robe-rayures', 'Robe longue à rayures', 'Robe longue à fines rayures, col bateau et manches courtes légèrement évasées. Taille froncée sur le côté, coupe droite.',
  11000, null, 'robes',
  '[]'::jsonb, '[{"name":"Couleur","options":["Marine rayé","Noir rayé","Bordeaux rayé","Marron rayé"]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'robe-rose', 'robe-rose', 'Robe longue rose', 'Robe longue sans manches, col rond, taille froncée et bas évasé qui s''ouvre en sirène.
Coloris vus sur le visuel : rose, noir, bleu jean, bleu ciel, vert d''eau, bleu marine. La liste n''y tenait pas en entier — demandez le vôtre, nous confirmons la disponibilité.',
  11000, null, 'robes',
  '[]'::jsonb, '[{"name":"Couleur","options":["Rose","Noir","Bleu jean","Bleu ciel","Vert d''eau","Bleu marine"]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'robe-blanche', 'robe-blanche', 'Robe mi-longue blanche', 'Robe mi-longue drapée, manches courtes tombantes et taille croisée. Bas légèrement évasé, coupe près du corps.',
  11000, null, 'robes',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'pack-8-tops-flare', 'pack-8-tops-flare', 'Pack 8 — Tops drapés & flare', 'Trois tenues : top asymétrique drapé à pan tombant, et pantalon flare taille haute à boucle dorée.
(1) Bold & Sleek — noir. Existe aussi en crème et bordeaux.
(2) Soft & Flow — blanc. Existe aussi en marron, crème, bordeaux et noir.
(3) Wild & Chic — top léopard, pantalon crème. Existe aussi en noir, crème, orange et marron.
Choisissez la tenue ci-dessus. Pour un coloris absent des photos, dites-le nous : nous confirmons la disponibilité avant paiement.',
  0, null, 'packs',
  '[]'::jsonb, '[{"name":"Tenue","options":["Bold & Sleek","Soft & Flow","Wild & Chic"]}]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'pack-8-tshirts-jupes', 'pack-8-tshirts-jupes', 'Pack 8 — T-shirts, flare & jupes', 'Trois tenues : haut ajusté drapé, avec pantalon flare ou jupe sirène.
(1) Bold & Sleek — t-shirt drapé noir ou bordeaux, pantalon flare crème, bordeaux ou noir ; jupe assortie disponible.
(2) Soft & Flow — haut col montant blanc ou noir, jupe sirène léopard, marron ou noire.
(3) Sweet & Feminine — haut blanc, rose ou fleuri, jupe sirène léopard, fleurie ou rose.
Choisissez la tenue ci-dessus. Pour un coloris absent des photos, dites-le nous : nous confirmons la disponibilité avant paiement.',
  0, null, 'packs',
  '[]'::jsonb, '[{"name":"Tenue","options":["Bold & Sleek","Soft & Flow","Sweet & Feminine"]}]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'pack-7', 'pack-7', 'Pack 7 — Chemises & jean', 'Trois tenues autour du jean.
(1) Soft Pink Chic — chemise rayée rose froncée, jean large brodé de fleurs. Chemise aussi en beige, blanc et rose.
(2) Sunny Yellow Vibes — chemise jaune, débardeur blanc, bermuda en jean. Chemise aussi en rayé rose et rayé noir.
(3) Clean & Sweet — haut rose à col carré, jean large brodé. Haut aussi en blanc, bleu ciel et noir.
Choisissez la tenue ci-dessus. Pour un coloris absent des photos, dites-le nous : nous confirmons la disponibilité avant paiement.',
  0, null, 'packs',
  '[]'::jsonb, '[{"name":"Tenue","options":["Soft Pink Chic","Sunny Yellow Vibes","Clean & Sweet"]}]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'pack-5-ensembles', 'pack-5-ensembles', 'Pack 5 — Ensembles chic', 'Trois ensembles assortis, deux pièces chacun.
(1) Chemise blanche à nouer, pantalon large coffee brown.
(2) Chemise marron à carreaux, pantalon large noir.
(3) Ensemble bleu : top et jupe fluide fendue.
Choisissez l''ensemble ci-dessus. Pour un coloris absent des photos, dites-le nous : nous confirmons la disponibilité avant paiement.',
  0, null, 'packs',
  '[]'::jsonb, '[{"name":"Ensemble","options":["Chemise blanche + pantalon marron","Chemise à carreaux + pantalon noir","Ensemble bleu top + jupe"]}]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'pack-5-tshirts', 'pack-5-tshirts', 'Pack 5 — T-shirts sport', 'Cinq trios de t-shirts imprimés, esprit varsity et sport américain.
(1) NY Varsity — New York marine, 80 rose, Brooklyn blanc.
(2) Legendary 01 — 01 rose, California crème, Chicago noir.
(3) Vintage Sport — 01 bordeaux, 98 marron, 23 léopard.
(4) Athletic Chic — Los Angeles 91 noir, California 08 rose, Hawaii 86 blanc.
(5) Retro Racing — Switch 07 noir, Speedway 23 rose, Racing 07 noir.
Choisissez le trio ci-dessus. Pour un modèle absent des photos, dites-le nous : nous confirmons la disponibilité avant paiement.',
  0, null, 'packs',
  '[]'::jsonb, '[{"name":"Trio","options":["NY Varsity","Legendary 01","Vintage Sport","Athletic Chic","Retro Racing"]}]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'gloss-romantic', 'gloss-romantic', 'Gloss Romantic', 'Gloss à lèvres brillant, texture légère et confortable. Applicateur mousse, flacon transparent à capuchon doré. Disponible tout de suite en boutique.',
  1000, null, 'lips',
  '[]'::jsonb, '[{"name":"Teinte","options":["Rose subtil","Transparent","Nude naturel","Marron élégant"]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'gloss-nyx', 'gloss-nyx', 'Gloss NYX Lip', 'Gloss à lèvres NYX, effet brillance naturelle et hydratation intense. Teintes subtiles qui se portent tous les jours. Disponible tout de suite en boutique.',
  1000, null, 'lips',
  '[]'::jsonb, '[{"name":"Teinte","options":["Transparent","Rose subtil","Marron élégant"]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'gloss-olibolla', 'gloss-olibolla', 'Glossy Lip Balm Olibolla', 'Baume à lèvres brillant Olibolla : hydrate, nourrit et repulpe. Neuf teintes, du transparent au brun profond. Disponible tout de suite en boutique.',
  1000, null, 'lips',
  '[]'::jsonb, '[{"name":"Teinte","options":["01 Clear","02 Milky","03 Pink","04 Rose","05 Mauve","06 Nude","07 Red","08 Berry","09 Brown"]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'gloss-lip-oil', 'gloss-lip-oil', 'Huile à lèvres teintée', 'Huile à lèvres teintée, enrichie en vitamines : hydratation intense et brillance naturelle. Six couleurs, de la plus discrète à la plus vive. Disponible tout de suite en boutique.',
  1000, null, 'lips',
  '[]'::jsonb, '[{"name":"Teinte","options":["01 Nude rosé","02 Lilas","03 Pêche","04 Corail","05 Rose bonbon","06 Violet"]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'gloss-victoria', 'gloss-victoria', 'Lip Oil soin', 'Huile à lèvres traitante Victoria''s Spirit : répare, protège et fait briller. Trois soins au choix, aux extraits naturels. Disponible tout de suite en boutique.',
  1000, null, 'lips',
  '[]'::jsonb, '[{"name":"Soin","options":["Cannabis Sativa Seed Oil","Cocoa Butter","Hydratant"]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'box-gloss', 'box-gloss', 'Box gloss lips', 'Coffret de trois glosses, choisis un par un dans toute la gamme : baumes brillants, huiles teintées ou soins. 2 500 FCFA les trois, au lieu de 3 000 FCFA à l''unité. Disponible tout de suite en boutique.',
  2500, 3000, 'lips',
  '[]'::jsonb, '[{"name":"Gloss 1","options":["Romantic — Rose subtil","Romantic — Transparent","Romantic — Nude naturel","Romantic — Marron élégant","NYX — Transparent","NYX — Rose subtil","NYX — Marron élégant","Olibolla — 01 Clear","Olibolla — 02 Milky","Olibolla — 03 Pink","Olibolla — 04 Rose","Olibolla — 05 Mauve","Olibolla — 06 Nude","Olibolla — 07 Red","Olibolla — 08 Berry","Olibolla — 09 Brown","Huile teintée — 01 Nude rosé","Huile teintée — 02 Lilas","Huile teintée — 03 Pêche","Huile teintée — 04 Corail","Huile teintée — 05 Rose bonbon","Huile teintée — 06 Violet","Lip Oil soin — Cannabis Sativa Seed Oil","Lip Oil soin — Cocoa Butter","Lip Oil soin — Hydratant"]},{"name":"Gloss 2","options":["Romantic — Rose subtil","Romantic — Transparent","Romantic — Nude naturel","Romantic — Marron élégant","NYX — Transparent","NYX — Rose subtil","NYX — Marron élégant","Olibolla — 01 Clear","Olibolla — 02 Milky","Olibolla — 03 Pink","Olibolla — 04 Rose","Olibolla — 05 Mauve","Olibolla — 06 Nude","Olibolla — 07 Red","Olibolla — 08 Berry","Olibolla — 09 Brown","Huile teintée — 01 Nude rosé","Huile teintée — 02 Lilas","Huile teintée — 03 Pêche","Huile teintée — 04 Corail","Huile teintée — 05 Rose bonbon","Huile teintée — 06 Violet","Lip Oil soin — Cannabis Sativa Seed Oil","Lip Oil soin — Cocoa Butter","Lip Oil soin — Hydratant"]},{"name":"Gloss 3","options":["Romantic — Rose subtil","Romantic — Transparent","Romantic — Nude naturel","Romantic — Marron élégant","NYX — Transparent","NYX — Rose subtil","NYX — Marron élégant","Olibolla — 01 Clear","Olibolla — 02 Milky","Olibolla — 03 Pink","Olibolla — 04 Rose","Olibolla — 05 Mauve","Olibolla — 06 Nude","Olibolla — 07 Red","Olibolla — 08 Berry","Olibolla — 09 Brown","Huile teintée — 01 Nude rosé","Huile teintée — 02 Lilas","Huile teintée — 03 Pêche","Huile teintée — 04 Corail","Huile teintée — 05 Rose bonbon","Huile teintée — 06 Violet","Lip Oil soin — Cannabis Sativa Seed Oil","Lip Oil soin — Cocoa Butter","Lip Oil soin — Hydratant"]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'gommage-tree-hut', 'gommage-tree-hut', 'Gommage Tree Hut', 'Gommage au sucre et au karité, pot de 510 g. Exfolie en douceur et laisse la peau nourrie. Quatre parfums au choix.',
  0, null, 'gommage',
  '[]'::jsonb, '[{"name":"Parfum","options":["Cotton Candy","Moroccan Rose","Pink Champagne","Watermelon"]}]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'gommage-bosuya', 'gommage-bosuya', 'Gommage Bosuya', 'Gommage au sucre et sel de bain, pot de 350 g. Exfoliation délicate, extraits naturels hydratants. Six parfums au choix.',
  7500, null, 'gommage',
  '[]'::jsonb, '[{"name":"Parfum","options":["Pastèque","Riz","Rose","Café","Coco","Orange"]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'anticernes-sheglam', 'anticernes-sheglam', 'Anti-cernes Hideaway', 'Anti-cernes fluide à applicateur mousse : couvre les cernes et unifie sans marquer. Quatorze teintes, du plus clair au plus foncé.',
  6000, null, 'maquillage',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'bougies-latte', 'bougies-latte', 'Bougie parfumée Latte', 'Bougie parfumée en verre, coulée en deux couches comme un café glacé. Huit parfums au choix.',
  1500, null, 'bougie',
  '[]'::jsonb, '[{"name":"Parfum","options":["Pink Coconut Matcha Latte","Matcha Latte","Lemon Matcha Latte","Sakura Latte","Lavender Latte","Taro Latte","Caramel Latte","The Iced Coffee"]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'sac-leopard-brun', 'sac-leopard-brun', 'Sac cabas léopard', 'Grand cabas souple en suédine imprimée léopard, ceinturé d''une lanière rose à boucle dorée. Anses longues, porté à l''épaule.',
  14000, null, 'sac',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'sac-bordeaux', 'sac-bordeaux', 'Sac épaule bordeaux', 'Petit sac d''épaule arrondi, cuir grainé, fermeture zippée et bandoulière réglable.',
  16000, null, 'sac',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'sac-ailes', 'sac-ailes', 'Sac cabas à ailes', 'Grand cabas à soufflets ouverts, qui lui donnent cette silhouette en ailes. Une patte sanglée et son fermoir doré ferment le devant ; les anses passent à l’épaule. Assez grand pour un ordinateur portable. Choisissez votre coloris ci-dessus : les photos suivent votre choix. D’autres couleurs arrivent — dites-nous celle que vous cherchez, nous confirmons avant paiement.',
  14000, null, 'sac',
  '[]'::jsonb, '[{"name":"Coloris","options":["Kaki","Écru & noir","Bordeaux","Noir suédine","Noir cuir"],"soldOutOptions":[]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'sac-cabas-brun', 'sac-cabas-brun', 'Sac cabas brun', 'Cabas en cuir grainé souple, plis latéraux et anses longues. Se porte à la main comme à l’épaule.',
  15500, null, 'sac',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'short-nuit', 'short-nuit', 'Short taille repliée', 'Short court en coton doux, ceinture large à revers. Se porte pour dormir ou à la maison.',
  0, null, 'lingerie',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'pyjama-noir-rose', 'pyjama-noir-rose', 'Ensemble pyjama noir liseré rose', 'Haut cache-cœur manches longues à nouer, liseré rose, et pantalon large à taille élastique et cordon. Deux pièces.',
  16000, null, 'lingerie',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'pyjama-pois', 'pyjama-pois', 'Ensemble pyjama à pois', 'Haut cache-cœur manches longues à pois blancs, taille froncée, et pantalon large assorti à ceinture rose. Deux pièces.',
  16000, null, 'lingerie',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'pyjama-raye-rose', 'pyjama-raye-rose', 'Ensemble pyjama rayé rose', 'Haut manches longues à rayures roses, noué devant sur un débardeur blanc, et pantalon évasé assorti. Deux pièces.',
  16000, null, 'lingerie',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'shorts-lot-trois', 'shorts-lot-trois', 'Lot de trois shorts', 'Trois shorts courts à taille haute large : noir uni, gris chiné et imprimé léopard rose.',
  11500, null, 'lingerie',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'bonnet-satin', 'bonnet-satin', 'Bonnet de nuit en satin', 'Bonnet doublé satin à bord élastique, pour protéger les cheveux pendant la nuit. Trois motifs au choix.',
  0, null, 'lingerie',
  '[]'::jsonb, '[{"name":"Motif","options":["Noir à nœuds roses","Rose à pois blancs","Marine à pois roses"]}]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'sandales-leopard', 'sandales-leopard', 'Sandales plates à boucle', 'Sandales plates à bride croisée et boucle dorée, semelle rembourrée. Précisez votre pointure à la commande : nous confirmons sa disponibilité avant tout paiement.',
  14000, null, 'chaussure',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'combinaison-rayee', 'combinaison-rayee', 'Combinaison rayée bretelle nouée', 'Combinaison longue à rayures, bustier droit et fine bretelle à nouer derrière la nuque, jambes évasées. Maille imprimée effet crochet.',
  0, null, 'combinaison',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'shorts-lot-quatre', 'shorts-lot-quatre', 'Lot de quatre shorts', 'Quatre shorts courts à ceinture repliée : rayé rose, imprimé cerises, noir uni et rose à pois.',
  0, null, 'lingerie',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  true, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'coffret-parfums-dignife', 'coffret-parfums-dignife', 'Coffret trois parfums', 'Coffret de trois eaux de parfum de 30 mL, présentées dans un écrin noir. Trois flacons, trois senteurs.',
  12500, null, 'parfum',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'bonnet-douche', 'bonnet-douche', 'Bonnets de douche satin — lot de deux', 'Deux bonnets de douche doublés, bord élastique froncé, imprimés de petits nœuds. Gardent les cheveux au sec.',
  3000, null, 'lingerie',
  '[]'::jsonb, '[{"name":"Coloris","options":["Blanc à nœuds bruns","Rose poudré","Beige","Blanc bord brun"]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'gel-douche-eos', 'gel-douche-eos', 'Gel douche Cashmere', 'Gel douche au beurre de karité, 473 mL. Nettoie en douceur, pH équilibré, pensé pour les peaux sensibles.',
  0, null, 'gel_douche',
  '[]'::jsonb, '[{"name":"Parfum","options":["Crème de pistache","Grenade & framboise","Fresh & Cozy","Pink Champagne"]}]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'lait-corps-eos', 'lait-corps-eos', 'Lait corporel 24H', 'Lait hydratant au beurre de karité, 473 mL. Sept huiles et beurres nourrissants, hydratation 24 heures.',
  0, null, 'lait_corps',
  '[]'::jsonb, '[{"name":"Senteur","options":["Vanilla Cashmere","Pomegranate Raspberry","Pink Champagne","Jasmine Peach","Strawberry Dream","Crème Pistachio","Fresh & Cozy","Coconut Waters","Beach Waves","Sans parfum"]}]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'bandeau-spa', 'bandeau-spa', 'Bandeau spa et manchettes', 'Bandeau matelassé et paire de manchettes en éponge, pour dégager le visage et garder les poignets au sec pendant le soin.',
  5000, null, 'accessoire_beaute',
  '[]'::jsonb, '[{"name":"Coloris","options":["Vache noir et blanc","Léopard","Chocolat","Taupe","Rose vif","Beige"]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'nettoyant-effaclar', 'nettoyant-effaclar', 'Gel moussant purifiant Effaclar', 'Gel nettoyant moussant pour le visage, tube de 200 mL. Pour les peaux grasses et sensibles.',
  0, null, 'soin_visage',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'baume-cicaplast', 'baume-cicaplast', 'Baume réparateur Cicaplast B5+', 'Baume apaisant pour le visage et le corps, texture légère et non collante. Deux contenances.',
  0, null, 'soin_visage',
  '[]'::jsonb, '[{"name":"Contenance","options":["40 mL","15 mL"]}]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'solaire-eucerin', 'solaire-eucerin', 'Crème solaire visage SPF 50+', 'Gel-crème solaire visage, fini sec et ultra léger, pour peaux grasses. Deux contenances.',
  0, null, 'soin_visage',
  '[]'::jsonb, '[{"name":"Contenance","options":["50 mL","20 mL"]}]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'parfum-miss-milk', 'parfum-miss-milk', 'Parfum Miss Milk', 'Eau de parfum 50 mL. Un lacté vanillé, doux et poudré, dans un flacon à bouchon ciselé.',
  6000, null, 'parfum',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'coffret-mini-parfums', 'coffret-mini-parfums', 'Coffret mini parfums', 'Trois flacons vaporisateurs dans un écrin noué, chacun sa senteur. Prêt à offrir.',
  12000, null, 'parfum',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'bougie-fruitee', 'bougie-fruitee', 'Petite bougie fruitée', 'Bougie parfumée coulée en forme de fruit, dans sa boîte dorée à couvercle. Quatre parfums au choix, au même prix.',
  1500, null, 'bougie',
  '[]'::jsonb, '[{"name":"Parfum","options":["Framboise","Mandarine","Myrtille","Fleur violette"]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'gommage-dove', 'gommage-dove', 'Gommage Dove', 'Gommage hydratant pour le corps, pot de 280 g. Exfolie en douceur et nourrit la peau. Trois parfums au choix, au même prix.',
  11500, null, 'gommage',
  '[]'::jsonb, '[{"name":"Parfum","options":["Grenade & lait","Coco & sucre brun","Citron vert & baies"]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'brume-vanilla', 'brume-vanilla', 'Brume parfumée Vanilla', 'Brume parfumée vaporisateur, 50 mL. Une vanille ambrée, douce et persistante.',
  7500, null, 'parfum',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'brume-heritage', 'brume-heritage', 'Heritage Fragrance Mist', 'Brume parfumée pour le corps, 90 mL. Amber Rose : une rose ambrée, portée par un flacon noué de satin.',
  3500, null, 'parfum',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'brume-vanilla-blackberry', 'brume-vanilla-blackberry', 'Brume parfumée Vanilla Blackberry', 'Brume parfumée vaporisateur, 50 mL. Mûre et vanille, sur un fond de fleur blanche.',
  5000, null, 'parfum',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'body-splash', 'body-splash', 'Body Splash', 'Brume corporelle vaporisateur, 250 mL. Deux senteurs au choix, au même prix.',
  8000, null, 'parfum',
  '[]'::jsonb, '[{"name":"Senteur","options":["Bare Vanilla","Lovely Sunny"]}]'::jsonb, '{}'::jsonb, null, 'active',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'choco-musk', 'choco-musk', 'Choco Musk', 'Eau de parfum vaporisateur 50 mL, 80 % vol. Un musc chocolaté et vanillé, tenace et enveloppant. Trois saveurs au choix, au même prix.',
  0, null, 'parfum',
  '[]'::jsonb, '[{"name":"Saveur","options":["Original","Marshmallow","Pistache"]}]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'parfum-miel-bebe', 'parfum-miel-bebe', 'Eau de parfum Miel Bébé', 'Eau de parfum 30 mL. Un sillage de miel et d''agrumes, réchauffé de cannelle.',
  0, null, 'parfum',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'parfum-cherry-blossom', 'parfum-cherry-blossom', 'Eau de parfum Cherry Blossom', 'Eau de parfum 30 mL. Un floral léger de fleur de cerisier, livré dans son étui.',
  0, null, 'parfum',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'parfum-lait-de-coco', 'parfum-lait-de-coco', 'Eau de parfum Lait de Coco', 'Eau de parfum 30 mL. Coco crémeuse et cacao, adoucis de bois et de zeste de citron vert.',
  0, null, 'parfum',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'parfum-creme-vanille', 'parfum-creme-vanille', 'Eau de parfum Crème Vanille', 'Eau de parfum 30 mL. Vanille gourmande sur un fond de beurre de karité.',
  0, null, 'parfum',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'parfum-victoria-key', 'parfum-victoria-key', 'Coffret brumes Victoria’s Key', 'Coffret de quatre brumes parfumées Victoria’s Key, en flacons vaporisateurs.',
  0, null, 'parfum',
  '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, null, 'draft',
  true, false,
  false, null
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  category = excluded.category,
  variants = excluded.variants,
  option_prices = excluded.option_prices,
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;
