import { SectionHeading } from "@/components/ui/Section";

const BENEFITS = [
  {
    icon: "🪶",
    title: "Comfortable",
    copy: "Ultra-thin with a soft cotton-finish top sheet, so the pad stays light against your skin all day.",
  },
  {
    icon: "🛡️",
    title: "Reliable protection",
    copy: "Leak guards along both edges and a secure wing grip, in lengths up to 410mm for the heaviest nights.",
  },
  {
    icon: "🌿",
    title: "Skin-friendly materials",
    copy: "A breathable back sheet and a cottony surface, with every pad individually wrapped.",
  },
  {
    icon: "📦",
    title: "Convenient delivery",
    copy: "Order in a minute, confirm on WhatsApp, and track your parcel from pick-up to your door.",
  },
];

export function Benefits() {
  return (
    <>
      <SectionHeading
        align="center"
        eyebrow="Why Femi"
        title="Designed around how the day actually goes"
        description="Small details that add up: a slimmer core, a softer surface and packs that fit in the pocket of a bag."
      />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map((benefit) => (
          <div
            key={benefit.title}
            className="group rounded-card border border-femi-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-femi-200 hover:shadow-lift"
          >
            <span
              aria-hidden
              className="grid size-12 place-items-center rounded-2xl bg-femi-50 text-2xl transition-transform duration-300 group-hover:scale-110"
            >
              {benefit.icon}
            </span>
            <h3 className="mt-5 font-display text-xl text-ink">{benefit.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{benefit.copy}</p>
          </div>
        ))}
      </div>
    </>
  );
}
