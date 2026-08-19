"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { OrderSummary } from "@/components/cart/OrderSummary";
import { WhatsAppIcon } from "@/components/layout/Icons";
import { useCart } from "@/components/providers/CartProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, FormError, Select, TextArea, TextInput } from "@/components/ui/Field";
import type { AuthUser } from "@/lib/auth/current-user";
import { money } from "@/lib/format";
import { site } from "@/lib/site";
import type { Address, Order } from "@/lib/types";
import { INDIAN_STATES } from "@/lib/validation";

const LAST_ORDER_KEY = "femi.lastOrder";

interface FormState {
  fullName: string;
  mobile: string;
  email: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
}

export function CheckoutForm({
  user,
  savedAddresses,
}: {
  user: AuthUser;
  savedAddresses: Address[];
}) {
  const { items, lines, totals, ready, pricing, clear } = useCart();
  const { notify } = useToast();
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    fullName: user.fullName ?? "",
    mobile: user.mobile ?? "",
    email: user.email ?? "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
  });
  const [selectedAddress, setSelectedAddress] = useState<string>(savedAddresses[0]?.id ?? "new");
  const [saveAddress, setSaveAddress] = useState(savedAddresses.length === 0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill from the chosen saved address.
  useEffect(() => {
    const address = savedAddresses.find((a) => a.id === selectedAddress);
    if (!address) return;
    setForm((current) => ({
      ...current,
      fullName: address.fullName || current.fullName,
      mobile: address.mobile || current.mobile,
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    }));
  }, [selectedAddress, savedAddresses]);

  const update =
    (key: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));

  const placeOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setErrors({});
    setSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          // Only ids and quantities go up. The server prices the order itself.
          items: items.map((line) => ({ productId: line.productId, qty: line.qty })),
        }),
      });
      const data = (await response.json()) as {
        order?: Order;
        whatsappUrl?: string;
        error?: string;
        errors?: Record<string, string>;
      };

      if (!response.ok || !data.order || !data.whatsappUrl) {
        setErrors(data.errors ?? {});
        setError(data.error ?? "Could not place your order. Please try again.");
        return;
      }

      if (saveAddress) {
        // Best effort — a failure here must not block the order.
        void fetch("/api/account/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, label: "Home" }),
        });
      }

      // Keep a pointer to the order so the confirmation page still works if the
      // customer comes back from WhatsApp in a fresh tab.
      try {
        window.localStorage.setItem(LAST_ORDER_KEY, data.order.reference);
      } catch {
        // Storage unavailable; the order is safe on the server either way.
      }

      // Open WhatsApp first (still inside the click gesture, so it is not
      // treated as a pop-up), then move to the confirmation page.
      window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
      clear();
      notify("Order created. Send the message on WhatsApp to confirm it.");
      router.push(`/order/${data.order.reference}`);
    } catch {
      setError("Network problem. Your cart is safe — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (ready && items.length === 0) {
    return (
      <EmptyState
        icon="🛒"
        title="Nothing to check out yet"
        description="Add a pack to your cart and come back — your details are saved."
        action={<ButtonLink href="/products" size="lg">Browse products</ButtonLink>}
      />
    );
  }

  return (
    <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start" noValidate>
      <div className="grid gap-6">
        <FormError message={error} />

        <section className="rounded-card border border-femi-100 bg-white p-5 sm:p-6">
          <h2 className="font-display text-xl text-ink">Customer details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="co-name" error={errors.fullName}>
              <TextInput
                id="co-name"
                autoComplete="name"
                required
                value={form.fullName}
                onChange={update("fullName")}
                invalid={Boolean(errors.fullName)}
              />
            </Field>
            <Field label="Mobile number" htmlFor="co-mobile" error={errors.mobile}>
              <TextInput
                id="co-mobile"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={10}
                required
                value={form.mobile}
                onChange={(event) =>
                  setForm((current) => ({ ...current, mobile: event.target.value.replace(/\D/g, "") }))
                }
                invalid={Boolean(errors.mobile)}
                placeholder="9XXXXXXXXX"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Email" htmlFor="co-email" error={errors.email}>
                <TextInput
                  id="co-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={form.email}
                  onChange={update("email")}
                  invalid={Boolean(errors.email)}
                />
              </Field>
            </div>
          </div>
        </section>

        <section className="rounded-card border border-femi-100 bg-white p-5 sm:p-6">
          <h2 className="font-display text-xl text-ink">Delivery address</h2>

          {savedAddresses.length > 0 && (
            <div className="mt-4 grid gap-2">
              {savedAddresses.map((address) => (
                <label
                  key={address.id}
                  className={`focus-ring flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm transition ${
                    selectedAddress === address.id
                      ? "border-femi-400 bg-femi-50"
                      : "border-femi-100 hover:border-femi-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="saved-address"
                    className="mt-1 accent-femi-500"
                    checked={selectedAddress === address.id}
                    onChange={() => setSelectedAddress(address.id ?? "new")}
                  />
                  <span>
                    <span className="block font-semibold text-ink">
                      {address.label ?? "Saved"} · {address.fullName}
                    </span>
                    <span className="mt-0.5 block text-ink-soft">
                      {[address.line1, address.line2, address.city, address.state, address.pincode]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </span>
                </label>
              ))}
              <label
                className={`focus-ring flex cursor-pointer items-center gap-3 rounded-2xl border p-4 text-sm transition ${
                  selectedAddress === "new" ? "border-femi-400 bg-femi-50" : "border-femi-100"
                }`}
              >
                <input
                  type="radio"
                  name="saved-address"
                  className="accent-femi-500"
                  checked={selectedAddress === "new"}
                  onChange={() => setSelectedAddress("new")}
                />
                <span className="font-semibold text-ink">Use a different address</span>
              </label>
            </div>
          )}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Flat / house number and street" htmlFor="co-line1" error={errors.line1}>
                <TextInput
                  id="co-line1"
                  autoComplete="address-line1"
                  required
                  value={form.line1}
                  onChange={update("line1")}
                  invalid={Boolean(errors.line1)}
                  placeholder="Flat 402, Green Meadows, MG Road"
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Area / landmark (optional)" htmlFor="co-line2">
                <TextInput
                  id="co-line2"
                  autoComplete="address-line2"
                  value={form.line2}
                  onChange={update("line2")}
                  placeholder="Near City Hospital"
                />
              </Field>
            </div>
            <Field label="City" htmlFor="co-city" error={errors.city}>
              <TextInput
                id="co-city"
                autoComplete="address-level2"
                required
                value={form.city}
                onChange={update("city")}
                invalid={Boolean(errors.city)}
              />
            </Field>
            <Field label="State" htmlFor="co-state" error={errors.state}>
              <Select
                id="co-state"
                autoComplete="address-level1"
                required
                value={form.state}
                onChange={update("state")}
                invalid={Boolean(errors.state)}
              >
                <option value="">Select a state</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="PIN code" htmlFor="co-pincode" error={errors.pincode}>
              <TextInput
                id="co-pincode"
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={6}
                required
                value={form.pincode}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    pincode: event.target.value.replace(/\D/g, ""),
                  }))
                }
                invalid={Boolean(errors.pincode)}
                placeholder="500001"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Delivery note (optional)" htmlFor="co-notes">
                <TextArea
                  id="co-notes"
                  value={form.notes}
                  onChange={update("notes")}
                  placeholder="Anything the delivery agent should know"
                  maxLength={400}
                />
              </Field>
            </div>
          </div>

          <label className="mt-4 flex items-center gap-3 text-sm text-ink-soft">
            <input
              type="checkbox"
              className="size-4 accent-femi-500"
              checked={saveAddress}
              onChange={(event) => setSaveAddress(event.target.checked)}
            />
            Save this address to my account
          </label>
        </section>
      </div>

      <div className="grid gap-4 lg:sticky lg:top-24">
        <div className="rounded-card border border-femi-100 bg-white p-5 sm:p-6">
          <h2 className="font-display text-xl text-ink">Your order</h2>
          <ul className="mt-4 grid gap-3 text-sm">
            {lines.map((line) => (
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
        </div>

        <OrderSummary totals={totals} pricing={pricing} title="Total to pay" />

        <Button
          type="submit"
          variant="whatsapp"
          size="lg"
          className="w-full"
          loading={submitting}
          disabled={lines.length === 0 || pricing}
        >
          <WhatsAppIcon className="size-5" />
          Place order via WhatsApp
        </Button>

        <p className="text-xs leading-relaxed text-ink-faint">
          Tapping the button opens WhatsApp with your order summary addressed to{" "}
          {site.whatsappDisplay}. <strong className="font-semibold text-ink-soft">Sending the
          message does not pay for the order</strong> — we reply with payment details and confirm it
          in the chat. Your order stays “Pending” until then.
        </p>
      </div>
    </form>
  );
}
