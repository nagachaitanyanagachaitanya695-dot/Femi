import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product/ProductCard";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { PackViewer3D } from "@/components/three/PackViewer3D";
import { Badge } from "@/components/ui/Badge";
import { getCategory } from "@/lib/catalog";
import { getProductForDisplay, listProductsForDisplay } from "@/lib/db";
import { discountPercent, money, pricePerPad } from "@/lib/format";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductForDisplay(slug);
  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description: product.short,
    openGraph: { title: product.name, description: product.short },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductForDisplay(slug);
  if (!product || !product.active) notFound();

  const all = await listProductsForDisplay();
  const related = all
    .filter((p) => p.id !== product.id)
    .sort((a, b) => {
      const sameCategory = Number(b.category === product.category) - Number(a.category === product.category);
      return sameCategory || b.popularity - a.popularity;
    })
    .slice(0, 3);

  const category = getCategory(product.category);
  const off = discountPercent(product.mrp, product.price);

  return (
    <div className="container-page py-8 sm:py-12">
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-ink-faint">
        <Link href="/" className="focus-ring hover:text-femi-600">Home</Link>
        <span aria-hidden>/</span>
        <Link href="/products" className="focus-ring hover:text-femi-600">Shop</Link>
        {category && (
          <>
            <span aria-hidden>/</span>
            <Link href={`/products?category=${category.slug}`} className="focus-ring hover:text-femi-600">
              {category.name}
            </Link>
          </>
        )}
        <span aria-hidden>/</span>
        <span className="text-ink-soft">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <PackViewer3D product={product} />
          <ul className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
            {[
              { label: "Pack size", value: `${product.padCount} pads` },
              { label: "Length", value: product.length },
              { label: "Size", value: product.size },
            ].map((spec) => (
              <li key={spec.label} className="rounded-2xl border border-femi-100 bg-white px-2 py-3">
                <span className="block text-ink-faint">{spec.label}</span>
                <span className="mt-0.5 block font-semibold text-ink">{spec.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.badge && <Badge tone="gold">{product.badge}</Badge>}
            {off > 0 && <Badge tone="sale">{off}% off</Badge>}
            {product.stock > 0 ? (
              <Badge tone="stock">In stock</Badge>
            ) : (
              <Badge tone="outline">Out of stock</Badge>
            )}
          </div>

          <h1 className="mt-4 font-display text-3xl leading-tight text-ink sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            ★ {product.rating.toFixed(1)} · {product.reviewCount} reviews ·{" "}
            {pricePerPad(product.price, product.padCount)}
          </p>

          <p className="mt-5 text-base leading-relaxed text-ink-soft">{product.description}</p>

          <div className="mt-7">
            <PurchasePanel product={product} />
          </div>

          <section className="mt-8">
            <h2 className="font-display text-xl text-ink">Product information</h2>
            <ul className="mt-4 grid gap-2.5">
              {product.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-ink-soft">
                  <span
                    aria-hidden
                    className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-femi-50 text-[11px] font-bold text-femi-600"
                  >
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <dl className="mt-6 grid gap-3 rounded-card border border-femi-100 bg-white p-5 text-sm sm:grid-cols-2">
              {[
                ["Pads per order", `${product.padCount} pads (${product.packs} pack${product.packs === 1 ? "" : "s"})`],
                ["Pad length", product.length],
                ["Size label", product.size],
                ["MRP", money(product.mrp)],
                ["Our price", money(product.price)],
                ["Category", category?.name ?? "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-femi-50 pb-2 last:border-0">
                  <dt className="text-ink-faint">{label}</dt>
                  <dd className="text-right font-medium text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-ink-faint">{site.disclaimer}</p>
          </section>

          <section className="mt-8 rounded-card border border-femi-100 bg-gradient-to-br from-femi-50 to-white p-6">
            <h2 className="font-display text-xl text-ink">Delivery information</h2>
            <ul className="mt-4 grid gap-3 text-sm text-ink-soft">
              <li>
                <strong className="font-semibold text-ink">Courier:</strong> {site.courier.name}.{" "}
                {site.courier.note}
              </li>
              <li>
                <strong className="font-semibold text-ink">Typical time:</strong>{" "}
                {site.delivery.etaDays} from confirmation, depending on your PIN code.
              </li>
              <li>
                <strong className="font-semibold text-ink">Delivery charge:</strong> ₹
                {site.delivery.fee} — free on orders over ₹{site.delivery.freeAbove}.
              </li>
              <li>
                <strong className="font-semibold text-ink">Packaging:</strong> plain outer packet
                with nothing about the contents printed outside.
              </li>
              <li>
                <strong className="font-semibold text-ink">Questions about a parcel?</strong> Contact{" "}
                <a
                  href={site.courier.site}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring font-semibold text-femi-600 underline"
                >
                  {site.courier.name}
                </a>{" "}
                with your tracking ID, or message us and we will help.
              </li>
            </ul>
          </section>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-2xl text-ink sm:text-3xl">You might also like</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
