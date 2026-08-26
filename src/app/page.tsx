import { Benefits } from "@/components/home/Benefits";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { Faq } from "@/components/home/Faq";
import { Hero } from "@/components/home/Hero";
import { PackFilm } from "@/components/home/PackFilm";
import { Testimonials } from "@/components/home/Testimonials";
import { TrustStrip } from "@/components/home/TrustStrip";
import { WhatsAppSteps } from "@/components/home/WhatsAppSteps";
import { ProductCard } from "@/components/product/ProductCard";
import { ButtonLink } from "@/components/ui/Button";
import { Section, SectionHeading } from "@/components/ui/Section";
import { categories } from "@/lib/catalog";
import { listProductsForDisplay } from "@/lib/db";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await listProductsForDisplay();
  const featured = [...products].sort((a, b) => b.popularity - a.popularity).slice(0, 4);

  // The three packs that float in the 3D hero.
  const heroPacks = [...products]
    .filter((product, index, all) => all.findIndex((p) => p.size === product.size) === index)
    .slice(0, 3)
    .map((product) => ({
      theme: product.theme,
      size: product.size,
      length: product.length,
      padCount: product.padCount,
    }));

  return (
    <>
      {/* The film opens the shop and holds the whole screen; the rest of the
          page follows once the reader has scrolled through it. */}
      {site.packFilm.enabled && <PackFilm />}
      <Hero packs={heroPacks} />
      <TrustStrip />

      <Section>
        <SectionHeading
          eyebrow="Bestsellers"
          title="Featured products"
          description="The packs our customers reorder most."
          action={
            <ButtonLink href="/products" variant="secondary">
              View all products
            </ButtonLink>
          }
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Section>

      <Section className="pt-0">
        <CategoryGrid categories={categories} products={products} />
      </Section>

      <Section className="pt-0">
        <Benefits />
      </Section>

      <Section className="pt-0">
        <WhatsAppSteps />
      </Section>

      <Section className="pt-0">
        <Testimonials />
      </Section>

      <Section id="faq" className="pt-0">
        <Faq />
      </Section>
    </>
  );
}
