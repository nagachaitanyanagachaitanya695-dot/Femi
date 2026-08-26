import type { Category, Product } from "./types";

/**
 * Seed catalogue.
 *
 * This is the source of truth when no database is configured, and the seed
 * data used by `supabase/seed.sql`. Prices here are the ones the server trusts
 * — the browser never gets to decide what an item costs.
 */

const YELLOW = { base: "#F3B21B", band: "#7FC241", tab: "#1F5132", ink: "#231404" };
const NAVY = { base: "#F6C223", band: "#8CC63F", tab: "#232E77", ink: "#232E77" };
const PLUM = { base: "#E7A81A", band: "#7FC241", tab: "#4A1F2B", ink: "#3A1B10" };
/**
 * Every Femi pack is the same gold foil with a green technology band; only the
 * tab colour changes between lines. An earlier ROSE here was pink through and
 * through — base, band and tab — which made the value pack look like a product
 * that does not exist. Teal keeps it in the family while staying distinct from
 * the green, navy and plum tabs above.
 */
const TEAL = { base: "#EFAF1E", band: "#7FC241", tab: "#155E63", ink: "#123B3E" };

export const categories: Category[] = [
  {
    slug: "everyday",
    name: "Everyday",
    blurb: "Large 290mm pads for regular flow days.",
    theme: NAVY,
  },
  {
    slug: "heavy-flow",
    name: "Heavy flow",
    blurb: "XL 320mm pads with extra coverage.",
    theme: YELLOW,
  },
  {
    slug: "overnight",
    name: "Overnight",
    blurb: "XXL 410mm pads for long, undisturbed nights.",
    theme: PLUM,
  },
  {
    slug: "value-packs",
    name: "Value packs",
    blurb: "Combos and multi-packs at a better price per pad.",
    theme: TEAL,
  },
];

const SHARED_FEATURES = [
  "Ultra-thin, soft cotton-finish top sheet",
  "Breathable back sheet",
  "Leak guards along both edges",
  "Wings with a secure adhesive grip",
  "Individually wrapped for travel",
];

export const products: Product[] = [
  {
    id: "femi-ultra-soft-xl-10",
    slug: "femi-ultra-soft-pads-xl-10",
    name: "Femi Ultra Soft Pads — 10 Pads",
    short: "XL 320mm · ultra-thin soft cotton finish · night + day",
    description:
      "Our everyday hero in XL. Each pad is 320mm long with a soft cotton-finish top sheet and a breathable back sheet, so it stays light against the skin through a full day at work or college. Wings hold the pad in place, and leak guards run along both edges for extra coverage. Comes in a resealable pack of 10 individually wrapped pads.",
    category: "heavy-flow",
    padCount: 10,
    length: "320mm",
    size: "XL",
    packs: 1,
    mrp: 229,
    price: 189,
    features: [...SHARED_FEATURES, "Anion strip in the core layer", "Resealable 'open' flap on the pack"],
    popularity: 96,
    rating: 4.7,
    reviewCount: 412,
    stock: 140,
    active: true,
    badge: "Bestseller",
    theme: YELLOW,
  },
  {
    id: "femi-ultra-soft-xl-20",
    slug: "femi-ultra-soft-pads-xl-20",
    name: "Femi Ultra Soft Pads — 20 Pads",
    short: "XL 320mm · two packs of 10 · better price per pad",
    description:
      "The same XL 320mm ultra-thin pad, in a twin pack of two sealed 10-pad packs. Ideal if you would rather order once a cycle than every few days — keep one pack at home and one in your bag.",
    category: "heavy-flow",
    padCount: 20,
    length: "320mm",
    size: "XL",
    packs: 2,
    mrp: 458,
    price: 359,
    features: [...SHARED_FEATURES, "Two sealed packs of 10", "Lower price per pad than the single pack"],
    popularity: 88,
    rating: 4.7,
    reviewCount: 268,
    stock: 90,
    active: true,
    badge: "Save ₹99",
    theme: YELLOW,
  },
  {
    id: "femi-ultra-soft-l-9",
    slug: "femi-ultra-soft-pads-l-9",
    name: "Femi Ultra Soft Pads — 9 Pads",
    short: "L 290mm · ultra-thin soft cottony pads · everyday",
    description:
      "A slimmer 290mm Large pad for regular days and for the tail end of a cycle. Ultra-thin and cottony soft, with a breathable back sheet and wings. Nine individually wrapped pads per pack — the Lumi pack you may have seen in stores.",
    category: "everyday",
    padCount: 9,
    length: "290mm",
    size: "L",
    packs: 1,
    mrp: 199,
    price: 169,
    features: [...SHARED_FEATURES, "Slimmer profile for regular days"],
    popularity: 82,
    rating: 4.6,
    reviewCount: 197,
    stock: 160,
    active: true,
    theme: NAVY,
  },
  {
    id: "femi-xl-night-5",
    slug: "femi-xl-night-pads-5",
    name: "Femi XL Night Pads — 5 Pads",
    short: "XXL 410mm · extra-long overnight coverage",
    description:
      "Our longest pad at 410mm, shaped with a wider back so it stays put while you sleep. Five individually wrapped pads per pack — enough for the heaviest nights of a cycle. Order five packs or more and the price drops automatically.",
    category: "overnight",
    padCount: 5,
    length: "410mm",
    size: "XXL",
    packs: 1,
    mrp: 249,
    price: 209,
    bulkPrice: 199,
    bulkMinQty: 5,
    features: [...SHARED_FEATURES, "410mm extra-long back coverage", "₹199 per pack on 5 packs or more"],
    popularity: 91,
    rating: 4.8,
    reviewCount: 356,
    stock: 120,
    active: true,
    badge: "5+ packs ₹199",
    theme: PLUM,
  },
  {
    id: "femi-xl-night-10",
    slug: "femi-xl-night-pads-10",
    name: "Femi XL Night Pads — 10 Pads",
    short: "XXL 410mm · two packs of 5 · overnight",
    description:
      "Two sealed packs of our 410mm XXL overnight pad, ten pads in total. A full cycle of night cover for most people, at a lower price per pad than buying single packs.",
    category: "overnight",
    padCount: 10,
    length: "410mm",
    size: "XXL",
    packs: 2,
    mrp: 498,
    price: 399,
    features: [...SHARED_FEATURES, "Two sealed packs of 5", "410mm extra-long back coverage"],
    popularity: 79,
    rating: 4.8,
    reviewCount: 143,
    stock: 70,
    active: true,
    badge: "Save ₹99",
    theme: PLUM,
  },
  {
    id: "femi-xl-night-20",
    slug: "femi-xl-night-pads-20",
    name: "Femi XL Night Pads — 20 Pads",
    short: "XXL 410mm · four packs of 5 · stock-up size",
    description:
      "Four sealed packs of the 410mm XXL overnight pad — twenty pads in total. The most economical way to buy our night range, and it ships free.",
    category: "overnight",
    padCount: 20,
    length: "410mm",
    size: "XXL",
    packs: 4,
    mrp: 996,
    price: 769,
    features: [...SHARED_FEATURES, "Four sealed packs of 5", "Free delivery"],
    popularity: 64,
    rating: 4.8,
    reviewCount: 61,
    stock: 45,
    active: true,
    badge: "Best value",
    theme: PLUM,
  },
  {
    id: "femi-combo-pack",
    slug: "femi-combo-pack",
    name: "Femi Combo Pack — 24 Pads",
    short: "L 290mm + XL 320mm + XXL 410mm · one full cycle",
    description:
      "One pack of each size — 9 × L 290mm for regular days, 10 × XL 320mm for heavy days and 5 × XXL 410mm for nights. Twenty-four pads in total: a complete cycle in a single box, and the easiest way to find the size that suits you.",
    category: "value-packs",
    padCount: 24,
    length: "290mm + 320mm + 410mm",
    size: "L + XL + XXL",
    packs: 3,
    mrp: 677,
    price: 549,
    features: [
      ...SHARED_FEATURES,
      "One sealed pack of each size",
      "Covers a full cycle, day and night",
      "Free delivery",
    ],
    popularity: 94,
    rating: 4.9,
    reviewCount: 508,
    stock: 85,
    active: true,
    badge: "Most loved",
    theme: TEAL,
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function findProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function findProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
