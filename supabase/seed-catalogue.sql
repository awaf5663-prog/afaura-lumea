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

-- Catégories du catalogue : Abaya, Pièce unique, Viscose premium, Voile MJ, Modal imprimé, Modal simple, Satin imprimé, Dentelle, Jersey, Jersey frisé, Hijab tape, Rentrée, Packs, Robes

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, option_prices, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'jersey', 'jersey', 'Jersey', 'Le hijab du quotidien. Maille jersey souple, tombé net, aucune épingle nécessaire. Choisissez votre teinte dans le nuancier ci-dessous.',
  1500, null, 'jersey',
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
  2000, null, 'jersey_frise',
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
  'voile-mj', 'voile-mj', 'Voile MJ', 'Notre voile le plus fluide : un mélange de modal et de jersey. Il a la douceur et le tombé du modal, avec le maintien du jersey — il ne glisse pas et ne demande pas d''épingle. 170 × 60 cm. Faites défiler les photos pour voir le tombé, puis choisissez votre numéro de teinte dans le nuancier ci-dessous.',
  4500, null, 'voile_mj',
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
  'modal-simple', 'modal-simple', 'Modal simple', 'Modal uni, doux et respirant, très léger à porter. Un drapé souple qui reste impeccable toute la journée. Choisissez votre teinte dans le nuancier ci-dessous.',
  4500, null, 'modal_simple',
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
  'modal-imprime', 'modal-imprime', 'Modal imprimé', 'Le confort du modal avec un imprimé travaillé. Faites défiler les photos pour voir les modèles, puis choisissez celui qui vous plaît. Vendu à l''unité.',
  5500, null, 'modal_imprime',
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
  'piece-unique', 'piece-unique', 'Pièce unique', 'Des modèles rares, reçus à l''unité. Faites défiler les photos pour les voir un par un, puis choisissez celui que vous voulez : chaque modèle n''existe qu''en un seul exemplaire.',
  6000, null, 'piece_unique',
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
  6500, null, 'voile_viscose',
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
  1000, null, 'hijab_tape',
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
  '[]'::jsonb, '[{"name":"Modèle","options":["Lot de 6 stylos et souligneurs","Bic bleu","Bic rouge"]}]'::jsonb, '{"Modèle":{"Lot de 6 stylos et souligneurs":550,"Bic bleu":100,"Bic rouge":100}}'::jsonb, null, 'active',
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
  'classeur', 'classeur', 'Classeur à soufflets', 'Classeur à compartiments pour trier cours, feuilles et documents, coloris rose. Planche d''étiquettes de couleur fournie.',
  1000, null, 'rentree',
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
  'protec-ordinateur', 'protec-ordinateur', 'Protection de clavier', 'Film souple à poser sur le clavier de l’ordinateur, coloris rose translucide, contre la poussière et les éclaboussures. Précisez le modèle de votre ordinateur au moment de commander.',
  1000, null, 'rentree',
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
  'coque-telephone', 'coque-telephone', 'Coque de téléphone', 'Coque transparente, motif squelette et fleurs. Choisissez le modèle de votre téléphone ci-dessous — nous confirmons la disponibilité avant paiement. Si le vôtre n''est pas dans la liste, prenez « Autre modèle » et dites-le nous sur WhatsApp.',
  1500, null, 'rentree',
  '[]'::jsonb, '[{"name":"Modèle de téléphone","options":["iPhone 11","iPhone 11 Pro Max","iPhone 12","iPhone 12 Pro Max","iPhone 13","iPhone 13 Pro Max","iPhone 14","iPhone 14 Pro Max","iPhone 15","iPhone 15 Pro Max","iPhone 16","iPhone 16 Pro Max","Samsung Galaxy A","Tecno","Infinix","Xiaomi / Redmi","Autre modèle"]}]'::jsonb, '{}'::jsonb, null, 'active',
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
  'gourde', 'gourde', 'Gourde', 'Gourde isotherme pour la journée de cours. Plusieurs coloris : précisez celui que vous souhaitez, nous confirmons la disponibilité.',
  3500, null, 'rentree',
  '[]'::jsonb, '[{"name":"Couleur","options":["Rose","Blanc","Noir"]}]'::jsonb, '{}'::jsonb, null, 'active',
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
  'miroir', 'miroir', 'Miroir', 'Petit miroir à poser, cadre ondulé, coloris rose poudré. Pour le bureau, la chambre ou la table de chevet.',
  400, null, 'rentree',
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
