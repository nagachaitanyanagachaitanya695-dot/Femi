import type { OrderStatus } from "@/lib/types";

const FLOW: { status: OrderStatus; label: string; hint: string }[] = [
  { status: "pending", label: "Pending", hint: "Waiting for us to confirm on WhatsApp" },
  { status: "confirmed", label: "Confirmed", hint: "Order and payment confirmed" },
  { status: "packed", label: "Packed", hint: "Your parcel is ready to ship" },
  { status: "shipped", label: "Shipped", hint: "Handed to the courier" },
  { status: "delivered", label: "Delivered", hint: "Parcel delivered" },
];

export function OrderStatusTrail({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <p className="rounded-2xl border border-femi-200 bg-femi-50 px-4 py-3 text-sm font-medium text-femi-700">
        This order was cancelled. Message us on WhatsApp if that looks wrong.
      </p>
    );
  }

  const currentIndex = FLOW.findIndex((step) => step.status === status);

  return (
    <ol className="grid gap-0 sm:grid-flow-col sm:auto-cols-fr">
      {FLOW.map((step, index) => {
        const done = index <= currentIndex;
        const current = index === currentIndex;
        return (
          <li key={step.status} className="relative flex gap-3 pb-6 sm:block sm:pb-0">
            <div className="flex flex-col items-center sm:flex-row">
              <span
                aria-hidden
                className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold transition ${
                  done ? "bg-femi-500 text-white" : "bg-femi-100 text-femi-400"
                }`}
              >
                {done ? "✓" : index + 1}
              </span>
              {index < FLOW.length - 1 && (
                <span
                  aria-hidden
                  className={`w-0.5 flex-1 sm:h-0.5 sm:w-full ${done ? "bg-femi-300" : "bg-femi-100"}`}
                />
              )}
            </div>
            <div className="pb-2 sm:mt-3 sm:pr-4">
              <p className={`text-sm font-semibold ${current ? "text-femi-700" : "text-ink"}`}>
                {step.label}
              </p>
              <p className="mt-0.5 text-xs leading-snug text-ink-faint">{step.hint}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
