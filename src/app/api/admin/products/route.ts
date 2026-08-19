import { fail, handler, json, readJson } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/current-user";
import { getStore } from "@/lib/db";
import type { CategorySlug, Product } from "@/lib/types";
import { clean, cleanMultiline } from "@/lib/validation";

export const dynamic = "force-dynamic";

const CATEGORIES: CategorySlug[] = ["everyday", "heavy-flow", "overnight", "value-packs"];

export const GET = handler(async () => {
  await requireAdmin();
  const products = await getStore().listProducts({ includeInactive: true });
  return json({ products });
});

/** Create or update a product. Admin-only; every field is re-validated here. */
export const POST = handler(async (request) => {
  await requireAdmin();
  const body = await readJson(request);
  const store = getStore();

  const id = clean(body.id, 60);
  if (!id) return fail("A product id is required.", 422);

  const existing = await store.getProductById(id);
  const number = (value: unknown, fallback: number) => {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : fallback;
  };

  const category = CATEGORIES.includes(body.category as CategorySlug)
    ? (body.category as CategorySlug)
    : (existing?.category ?? "everyday");

  const slug =
    clean(body.slug, 80)
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "") || existing?.slug || id;

  const clash = await store.getProductBySlug(slug);
  if (clash && clash.id !== id) return fail("Another product already uses that URL slug.", 409);

  const price = number(body.price, existing?.price ?? 0);
  const mrp = number(body.mrp, existing?.mrp ?? price);
  if (price <= 0) return fail("Price must be greater than zero.", 422);
  if (mrp < price) return fail("MRP cannot be lower than the selling price.", 422);

  const bulkPrice = body.bulkPrice === "" || body.bulkPrice == null ? undefined : number(body.bulkPrice, 0);
  if (bulkPrice !== undefined && bulkPrice > price) {
    return fail("Bulk price must be lower than the regular price.", 422);
  }

  const product: Product = {
    id,
    slug,
    name: clean(body.name, 120) || existing?.name || "Untitled product",
    short: clean(body.short, 160) || existing?.short || "",
    description: cleanMultiline(body.description, 2000) || existing?.description || "",
    category,
    padCount: number(body.padCount, existing?.padCount ?? 0),
    length: clean(body.length, 40) || existing?.length || "",
    size: clean(body.size, 20) || existing?.size || "",
    packs: Math.max(1, number(body.packs, existing?.packs ?? 1)),
    mrp,
    price,
    bulkPrice,
    bulkMinQty: bulkPrice === undefined ? undefined : Math.max(2, number(body.bulkMinQty, 5)),
    features: Array.isArray(body.features)
      ? body.features.map((f: unknown) => clean(f, 120)).filter(Boolean).slice(0, 12)
      : (existing?.features ?? []),
    popularity: number(body.popularity, existing?.popularity ?? 50),
    rating: existing?.rating ?? 4.7,
    reviewCount: existing?.reviewCount ?? 0,
    stock: number(body.stock, existing?.stock ?? 0),
    active: body.active === undefined ? (existing?.active ?? true) : Boolean(body.active),
    badge: clean(body.badge, 40) || undefined,
    theme: existing?.theme ?? { base: "#F3B21B", band: "#7FC241", tab: "#1F5132", ink: "#231404" },
  };

  const saved = await store.saveProduct(product);
  return json({ product: saved }, { status: existing ? 200 : 201 });
});
