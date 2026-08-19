import { site } from "@/lib/site";

const ITEMS = [
  { icon: "🚚", title: "Discreet delivery", copy: `Plain packaging, shipped with ${site.courier.name}.` },
  { icon: "💬", title: "Order on WhatsApp", copy: "Confirm your order and payment in chat." },
  { icon: "↩︎", title: "Easy replacement", copy: "Damaged pack? We replace it, no fuss." },
  { icon: "🇮🇳", title: "Made for India", copy: "Priced in ₹, delivered pan-India." },
];

export function TrustStrip() {
  return (
    <div className="border-y border-femi-100 bg-white">
      <ul className="container-page grid grid-cols-2 gap-x-6 gap-y-5 py-6 lg:grid-cols-4">
        {ITEMS.map((item) => (
          <li key={item.title} className="flex items-start gap-3">
            <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-femi-50 text-base">
              {item.icon}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink">{item.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink-soft">{item.copy}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
