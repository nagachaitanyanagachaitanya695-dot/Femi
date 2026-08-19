import type { OrderStatus } from "@/lib/types";

const STYLES: Record<OrderStatus, string> = {
  pending: "bg-gold-soft text-[#6b4a10]",
  confirmed: "bg-femi-100 text-femi-700",
  packed: "bg-femi-100 text-femi-700",
  shipped: "bg-[#dbeafe] text-[#1e40af]",
  delivered: "bg-leaf/12 text-leaf",
  cancelled: "bg-[#f1e4e8] text-[#7a3b52]",
};

export function StatusPill({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase ${STYLES[status]}`}
    >
      {status}
    </span>
  );
}
