-- =============================================================================
-- Femi — sample catalogue
--
-- Mirrors src/lib/catalog.ts, which is what the app serves when no database is
-- configured. Run this after schema.sql so a fresh Supabase project has the
-- same products the local file store ships with.
--
-- Safe to re-run: existing rows are updated, stock and prices included.
-- =============================================================================

insert into public.products (
  id, slug, name,
  short,
  description,
  category, pad_count, length, size, packs,
  mrp, price, bulk_price, bulk_min_qty,
  features,
  popularity, rating, review_count, stock, active, badge,
  theme
) values
  (
    'femi-ultra-soft-xl-10', 'femi-ultra-soft-pads-xl-10', 'Femi Ultra Soft Pads — 10 Pads',
    'XL 320mm · ultra-thin soft cotton finish · night + day',
    'Our everyday hero in XL. Each pad is 320mm long with a soft cotton-finish top sheet and a breathable back sheet, so it stays light against the skin through a full day at work or college. Wings hold the pad in place, and leak guards run along both edges for extra coverage. Comes in a resealable pack of 10 individually wrapped pads.',
    'heavy-flow', 10, '320mm', 'XL', 1,
    229, 189, null, null,
    array['Ultra-thin, soft cotton-finish top sheet', 'Breathable back sheet', 'Leak guards along both edges', 'Wings with a secure adhesive grip', 'Individually wrapped for travel', 'Anion strip in the core layer', 'Resealable ''open'' flap on the pack'],
    96, 4.7, 412, 140, true, 'Bestseller',
    '{"base": "#F3B21B", "band": "#7FC241", "tab": "#1F5132", "ink": "#231404"}'::jsonb
  ),
  (
    'femi-ultra-soft-xl-20', 'femi-ultra-soft-pads-xl-20', 'Femi Ultra Soft Pads — 20 Pads',
    'XL 320mm · two packs of 10 · better price per pad',
    'The same XL 320mm ultra-thin pad, in a twin pack of two sealed 10-pad packs. Ideal if you would rather order once a cycle than every few days — keep one pack at home and one in your bag.',
    'heavy-flow', 20, '320mm', 'XL', 2,
    458, 359, null, null,
    array['Ultra-thin, soft cotton-finish top sheet', 'Breathable back sheet', 'Leak guards along both edges', 'Wings with a secure adhesive grip', 'Individually wrapped for travel', 'Two sealed packs of 10', 'Lower price per pad than the single pack'],
    88, 4.7, 268, 90, true, 'Save ₹99',
    '{"base": "#F3B21B", "band": "#7FC241", "tab": "#1F5132", "ink": "#231404"}'::jsonb
  ),
  (
    'femi-ultra-soft-l-9', 'femi-ultra-soft-pads-l-9', 'Femi Ultra Soft Pads — 9 Pads',
    'L 290mm · ultra-thin soft cottony pads · everyday',
    'A slimmer 290mm Large pad for regular days and for the tail end of a cycle. Ultra-thin and cottony soft, with a breathable back sheet and wings. Nine individually wrapped pads per pack — the Lumi pack you may have seen in stores.',
    'everyday', 9, '290mm', 'L', 1,
    199, 169, null, null,
    array['Ultra-thin, soft cotton-finish top sheet', 'Breathable back sheet', 'Leak guards along both edges', 'Wings with a secure adhesive grip', 'Individually wrapped for travel', 'Slimmer profile for regular days'],
    82, 4.6, 197, 160, true, null,
    '{"base": "#F6C223", "band": "#8CC63F", "tab": "#232E77", "ink": "#232E77"}'::jsonb
  ),
  (
    'femi-xl-night-5', 'femi-xl-night-pads-5', 'Femi XL Night Pads — 5 Pads',
    'XXL 410mm · extra-long overnight coverage',
    'Our longest pad at 410mm, shaped with a wider back so it stays put while you sleep. Five individually wrapped pads per pack — enough for the heaviest nights of a cycle. Order five packs or more and the price drops automatically.',
    'overnight', 5, '410mm', 'XXL', 1,
    249, 209, 199, 5,
    array['Ultra-thin, soft cotton-finish top sheet', 'Breathable back sheet', 'Leak guards along both edges', 'Wings with a secure adhesive grip', 'Individually wrapped for travel', '410mm extra-long back coverage', '₹199 per pack on 5 packs or more'],
    91, 4.8, 356, 120, true, '5+ packs ₹199',
    '{"base": "#E7A81A", "band": "#7FC241", "tab": "#4A1F2B", "ink": "#3A1B10"}'::jsonb
  ),
  (
    'femi-xl-night-10', 'femi-xl-night-pads-10', 'Femi XL Night Pads — 10 Pads',
    'XXL 410mm · two packs of 5 · overnight',
    'Two sealed packs of our 410mm XXL overnight pad, ten pads in total. A full cycle of night cover for most people, at a lower price per pad than buying single packs.',
    'overnight', 10, '410mm', 'XXL', 2,
    498, 399, null, null,
    array['Ultra-thin, soft cotton-finish top sheet', 'Breathable back sheet', 'Leak guards along both edges', 'Wings with a secure adhesive grip', 'Individually wrapped for travel', 'Two sealed packs of 5', '410mm extra-long back coverage'],
    79, 4.8, 143, 70, true, 'Save ₹99',
    '{"base": "#E7A81A", "band": "#7FC241", "tab": "#4A1F2B", "ink": "#3A1B10"}'::jsonb
  ),
  (
    'femi-xl-night-20', 'femi-xl-night-pads-20', 'Femi XL Night Pads — 20 Pads',
    'XXL 410mm · four packs of 5 · stock-up size',
    'Four sealed packs of the 410mm XXL overnight pad — twenty pads in total. The most economical way to buy our night range, and it ships free.',
    'overnight', 20, '410mm', 'XXL', 4,
    996, 769, null, null,
    array['Ultra-thin, soft cotton-finish top sheet', 'Breathable back sheet', 'Leak guards along both edges', 'Wings with a secure adhesive grip', 'Individually wrapped for travel', 'Four sealed packs of 5', 'Free delivery'],
    64, 4.8, 61, 45, true, 'Best value',
    '{"base": "#E7A81A", "band": "#7FC241", "tab": "#4A1F2B", "ink": "#3A1B10"}'::jsonb
  ),
  (
    'femi-combo-pack', 'femi-combo-pack', 'Femi Combo Pack — 24 Pads',
    'L 290mm + XL 320mm + XXL 410mm · one full cycle',
    'One pack of each size — 9 × L 290mm for regular days, 10 × XL 320mm for heavy days and 5 × XXL 410mm for nights. Twenty-four pads in total: a complete cycle in a single box, and the easiest way to find the size that suits you.',
    'value-packs', 24, '290mm + 320mm + 410mm', 'L + XL + XXL', 3,
    677, 549, null, null,
    array['Ultra-thin, soft cotton-finish top sheet', 'Breathable back sheet', 'Leak guards along both edges', 'Wings with a secure adhesive grip', 'Individually wrapped for travel', 'One sealed pack of each size', 'Covers a full cycle, day and night', 'Free delivery'],
    94, 4.9, 508, 85, true, 'Most loved',
    '{"base": "#F0A9BE", "band": "#F7DDE5", "tab": "#B03A62", "ink": "#4A1526"}'::jsonb
  );

on conflict (id) do update set
  slug         = excluded.slug,
  name         = excluded.name,
  short        = excluded.short,
  description  = excluded.description,
  category     = excluded.category,
  pad_count    = excluded.pad_count,
  length       = excluded.length,
  size         = excluded.size,
  packs        = excluded.packs,
  mrp          = excluded.mrp,
  price        = excluded.price,
  bulk_price   = excluded.bulk_price,
  bulk_min_qty = excluded.bulk_min_qty,
  features     = excluded.features,
  popularity   = excluded.popularity,
  rating       = excluded.rating,
  review_count = excluded.review_count,
  stock        = excluded.stock,
  active       = excluded.active,
  badge        = excluded.badge,
  theme        = excluded.theme,
  updated_at   = now();

-- Make yourself an admin (replace with the email you signed up with):
--   update public.profiles set role = 'admin' where email = 'you@example.com';
