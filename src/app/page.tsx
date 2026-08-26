import { PackFilm } from "@/components/home/PackFilm";

export const dynamic = "force-dynamic";

/**
 * The landing page is the film and nothing else.
 *
 * Everything the shop used to stack underneath it — the hero, the featured
 * products, the categories, the FAQ — now lives on the pages the film's own
 * buttons lead to. Scrolling past the film reaches the end of the page rather
 * than a wall of sections, which is the whole point of it holding the screen.
 * The chrome is dropped for this route in StoreChrome.
 */
export default function HomePage() {
  return <PackFilm />;
}
