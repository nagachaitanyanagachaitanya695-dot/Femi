import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60dvh] flex-col items-center justify-center py-16 text-center">
      <span aria-hidden className="grid size-16 place-items-center rounded-full bg-femi-50 text-3xl">
        🌸
      </span>
      <h1 className="mt-6 font-display text-4xl leading-tight text-ink sm:text-5xl">
        We could not find that page
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
        The link may be old, or the product may no longer be listed. Everything we stock is on the
        shop page.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/products" size="lg">
          Browse products
        </ButtonLink>
        <ButtonLink href="/" variant="secondary" size="lg">
          Back home
        </ButtonLink>
      </div>
    </div>
  );
}
