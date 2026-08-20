import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  // Guests are welcome. Signing in is offered, not required.
  const user = await getCurrentUser();
  const addresses = user ? await getStore().listAddresses(user.id) : [];

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">Checkout</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
        Confirm your details, then send the order to us on WhatsApp. We reply with payment details
        and confirm your order in the same chat.
      </p>
      <div className="mt-8">
        <CheckoutForm user={user} savedAddresses={addresses} />
      </div>
    </div>
  );
}
