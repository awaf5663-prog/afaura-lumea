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

-- Catégories du catalogue : Abaya, Pièce unique, Viscose premium, Voile MJ, Modal imprimé, Modal simple, Satin imprimé, Dentelle, Jersey, Jersey frisé, Hijab tape

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'jersey', 'jersey', 'Jersey', 'Le hijab du quotidien. Maille jersey souple, tombé net, aucune épingle nécessaire. Choisissez votre teinte dans le nuancier ci-dessous.',
  1500, null, 'jersey',
  '[]'::jsonb, '[]'::jsonb, null, 'active',
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
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'jersey-frise', 'jersey-frise', 'Jersey frisé', 'Jersey à bord frisé : la maille est terminée par des volants qui tiennent la forme et habillent le visage sans épingle. Faites défiler les photos pour voir le tombé et le détail du frisé, puis choisissez votre numéro de teinte dans le nuancier ci-dessous.',
  2000, null, 'jersey_frise',
  '[]'::jsonb, '[]'::jsonb, null, 'active',
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
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'satin-imprime', 'satin-imprime', 'Satin imprimé', 'Satin fluide au léger reflet, en dégradés et pailletés. Faites défiler les photos pour voir les modèles, puis choisissez le vôtre.',
  3500, null, 'satin_imprime',
  '[]'::jsonb, '[{"name":"Modèle","options":["Dégradé vert & bleu","Sable pailleté","Noir pailleté","Vert d''eau","Dégradé vert & rouille"],"soldOutOptions":[]}]'::jsonb, null, 'active',
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
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'voile-mj', 'voile-mj', 'Voile MJ', 'Notre voile le plus fluide : un mélange de modal et de jersey. Il a la douceur et le tombé du modal, avec le maintien du jersey — il ne glisse pas et ne demande pas d''épingle. 170 × 60 cm. Faites défiler les photos pour voir le tombé, puis choisissez votre numéro de teinte dans le nuancier ci-dessous.',
  4500, null, 'voile_mj',
  '[]'::jsonb, '[]'::jsonb, null, 'active',
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
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'modal-simple', 'modal-simple', 'Modal simple', 'Modal uni, doux et respirant, très léger à porter. Un drapé souple qui reste impeccable toute la journée. Choisissez votre teinte dans le nuancier ci-dessous.',
  4500, null, 'modal_simple',
  '[]'::jsonb, '[]'::jsonb, null, 'active',
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
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'modal-imprime', 'modal-imprime', 'Modal imprimé', 'Le confort du modal avec un imprimé travaillé. Faites défiler les photos pour voir les modèles, puis choisissez celui qui vous plaît. Vendu à l''unité.',
  5500, null, 'modal_imprime',
  '[]'::jsonb, '[{"name":"Modèle","options":["Zébré bordeaux","Pois sur brun","Pois sur blanc","Aquarelle","Léopard"],"soldOutOptions":[]}]'::jsonb, null, 'active',
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
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'dentelle', 'dentelle', 'Dentelle', 'Hijab bordé de dentelle, pour les occasions : cérémonies, fêtes, invitations. Choisissez votre teinte dans le nuancier ci-dessous.',
  5000, null, 'dentelle',
  '[]'::jsonb, '[]'::jsonb, null, 'active',
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
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'piece-unique', 'piece-unique', 'Pièce unique', 'Des modèles rares, reçus à l''unité. Faites défiler les photos pour les voir un par un, puis choisissez celui que vous voulez : chaque modèle n''existe qu''en un seul exemplaire.',
  6000, null, 'piece_unique',
  '[]'::jsonb, '[{"name":"Modèle","options":["Noir fleuri","Crème fleuri","Taupe fleuri","Fauve","Écru & or"],"soldOutOptions":[]}]'::jsonb, null, 'active',
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
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'voile-viscose', 'voile-viscose', 'Voile viscose premium', 'Ce n''est pas du modal : la viscose est une autre matière, nettement plus légère et plus aérienne. Le voile se pose presque sans poids, avec un tombé long et un léger effet froissé — parfait pour les journées chaudes. Faites défiler les photos pour voir le rendu, puis choisissez votre numéro de teinte dans le nuancier ci-dessous.',
  6500, null, 'voile_viscose',
  '[]'::jsonb, '[]'::jsonb, null, 'active',
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
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'abaya', 'abaya', 'Abaya', 'Abayas longues, coupe ample et ouverte, à porter sur une tenue. Chaque modèle a son propre tissu et son propre imprimé. Faites défiler les photos pour les voir un par un, puis choisissez le vôtre — la coupe et la longueur vous sont confirmées sur WhatsApp avant la validation de la commande.',
  15000, null, 'abaya',
  '[]'::jsonb, '[{"name":"Modèle","options":["Noir & blanc plissé","Bleu zébré","Rose cachemire","Beige léopard satiné","Noir uni","Marbré brun & écru","Bleu délavé","Prune plissé","Kaki marbré","Léopard fauve"],"soldOutOptions":[],"photoOptions":["Noir & blanc plissé","Bleu zébré","Rose cachemire","Beige léopard satiné","Noir uni","Marbré brun & écru","Bleu délavé","Prune plissé","Kaki marbré","Léopard fauve","Léopard fauve"]}]'::jsonb, null, 'active',
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
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;

insert into products (
  id, slug, name, description, price, compare_at_price, category,
  images, variants, stock, status, is_new, is_popular,
  other_colors_available, color_chart_id
) values (
  'hijab-tape', 'hijab-tape', 'Hijab tape', 'Les bandes adhésives double face qui remplacent les épingles : on colle, le voile reste en place toute la journée, et rien ne marque ni n''abîme le tissu. Un sachet contient plusieurs bandes.',
  1000, null, 'hijab_tape',
  '[]'::jsonb, '[]'::jsonb, null, 'active',
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
  status = excluded.status,
  other_colors_available = excluded.other_colors_available,
  color_chart_id = excluded.color_chart_id;
