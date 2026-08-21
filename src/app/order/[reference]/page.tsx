import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { WhatsAppIcon } from "@/components/layout/Icons";
import { OrderStatusTrail } from "@/components/order/OrderStatusTrail";
import { SendToWhatsApp } from "@/components/order/SendToWhatsApp";
import { ButtonLink } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth/current-user";
import { hasOrderAccess } from "@/lib/auth/order-access";
import { getStore } from "@/lib/db";
import { formatDate, money } from "@/lib/format";
import { site } from "@/lib/site";
import { buildOrderMessage, whatsappLink } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order confirmation",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ reference: string }> };

export default async function OrderPage({ params }: Props) {
  const { reference } = await params;

  const user = await getCurrentUser();
  const order = await getStore().getOrder(reference);
  if (!order) notFound();

  // Three ways to be allowed in: it is your order, you are an admin, or you
  // are the browser that placed it (a guest, holding a signed grant).
  const isOwner = Boolean(user && order.userId === user.id);
  const isAdmin = user?.role === "admin";
  const isGuestWhoOrdered = await hasOrderAccess(order.id, order.reference);

  if (!isOwner && !isAdmin && !isGuestWhoOrdered) {
    if (!user) redirect(`/login?next=/order/${reference}`);
    notFound();
  }

  const message = buildOrderMessage(order);
  const link = whatsappLink(message);

  return (
    <div className="container-page py-10 sm:py-14">
      <Suspense fallback={null}>
        <SendToWhatsApp url={link} />
      </Suspense>
      <div className="mx-auto max-w-3xl">
        <div className="rounded-card border border-femi-100 bg-gradient-to-br from-femi-50 to-white p-6 text-center sm:p-10">
          <span aria-hidden className="mx-auto grid size-14 place-items-center rounded-full bg-white text-2xl shadow-soft">
            🌸
          </span>
          <h1 className="mt-5 font-display text-3xl leading-tight text-ink sm:text-4xl">
            Order {order.reference} created
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">
            We have saved your order. To finish, send us the WhatsApp message with your order
            details — we reply with payment details and confirm it there.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex h-13 items-center gap-2 rounded-full bg-[#1d7a45] px-7 text-base font-semibold text-white shadow-soft transition hover:bg-[#166035]"
            >
              <WhatsAppIcon className="size-5" />
              {order.status === "pending" ? "Send order on WhatsApp" : "Message us about this order"}
            </a>
            <ButtonLink href="/products" variant="secondary" size="lg">
              Continue shopping
            </ButtonLink>
          </div>

          <p className="mt-5 text-xs leading-relaxed text-ink-faint">
            Opening WhatsApp does not complete payment. Your order is marked{" "}
            <strong className="font-semibold text-ink-soft">{order.status}</strong> until we confirm
            it with you.
          </p>
        </div>

        <div className="mt-8 rounded-card border border-femi-100 bg-white p-6">
          <h2 className="font-display text-xl text-ink">Order status</h2>
          <p className="mt-1 text-sm text-ink-soft">Placed {formatDate(order.createdAt)}</p>
          <div className="mt-6">
            <OrderStatusTrail status={order.status} />
          </div>
          {order.trackingId && (
            <p className="mt-6 rounded-2xl bg-femi-50 px-4 py-3 text-sm text-femi-700">
              {order.courier} tracking ID:{" "}
              <strong className="font-semibold">{order.trackingId}</strong> — track it on the{" "}
              <a
                href={site.courier.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring underline"
              >
                {order.courier} website
              </a>
              .
            </p>
          )}
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-card border border-femi-100 bg-white p-6">
            <h2 className="font-display text-lg text-ink">Items</h2>
            <ul className="mt-4 grid gap-3 text-sm">
              {order.lines.map((line) => (
                <li key={line.productId} className="flex justify-between gap-3">
                  <span className="text-ink-soft">
                    {line.name}
                    <span className="block text-xs text-ink-faint">
                      {line.qty} × {money(line.unitPrice)}
                    </span>
                  </span>
                  <span className="font-medium text-ink tabular-nums">{money(line.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-5 grid gap-2 border-t border-femi-100 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd className="tabular-nums">{money(order.totals.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Delivery</dt>
                <dd className="tabular-nums">
                  {order.totals.deliveryFee === 0 ? "Free" : money(order.totals.deliveryFee)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-femi-100 pt-2 font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{money(order.totals.total)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-card border border-femi-100 bg-white p-6">
            <h2 className="font-display text-lg text-ink">Delivery to</h2>
            <address className="mt-4 text-sm leading-relaxed text-ink-soft not-italic">
              <strong className="block font-semibold text-ink">{order.customerName}</strong>
              {order.address.line1}
              {order.address.line2 && <>, {order.address.line2}</>}
              <br />
              {order.address.city}, {order.address.state} {order.address.pincode}
              <br />
              {order.mobile}
              <br />
              {order.email}
            </address>
            {order.notes && (
              <p className="mt-4 rounded-2xl bg-femi-50 px-4 py-3 text-xs text-femi-700">
                Note: {order.notes}
              </p>
            )}
            <p className="mt-4 text-xs leading-relaxed text-ink-faint">
              Shipping with {order.courier}. {site.courier.note}
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-ink-soft">
          <Link href="/account/orders" className="focus-ring font-semibold text-femi-600 underline">
            See all your orders
          </Link>
        </p>
      </div>
    </div>
  );
}
