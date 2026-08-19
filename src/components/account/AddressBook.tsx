"use client";

import { useState } from "react";

import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Field, FormError, Select, TextInput } from "@/components/ui/Field";
import type { Address } from "@/lib/types";
import { INDIAN_STATES } from "@/lib/validation";

const BLANK = {
  label: "Home",
  fullName: "",
  mobile: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
};

export function AddressBook({ initialAddresses }: { initialAddresses: Address[] }) {
  const { notify } = useToast();
  const [addresses, setAddresses] = useState(initialAddresses);
  const [form, setForm] = useState(BLANK);
  const [open, setOpen] = useState(initialAddresses.length === 0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update =
    (key: keyof typeof BLANK) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((current) => ({ ...current, [key]: event.target.value }));

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setErrors({});
    setLoading(true);
    try {
      const response = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrors(data.errors ?? {});
        setError(data.error ?? "Could not save that address.");
        return;
      }
      setAddresses((current) => [data.address as Address, ...current]);
      setForm(BLANK);
      setOpen(false);
      notify("Address saved.");
    } catch {
      setError("Network problem. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id?: string) => {
    if (!id) return;
    const response = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    if (!response.ok) {
      notify("Could not remove that address.", "error");
      return;
    }
    setAddresses((current) => current.filter((address) => address.id !== id));
    notify("Address removed.", "info");
  };

  return (
    <section className="rounded-card border border-femi-100 bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl text-ink">Delivery addresses</h2>
        <Button variant="ghost" size="sm" onClick={() => setOpen((value) => !value)}>
          {open ? "Cancel" : "Add address"}
        </Button>
      </div>

      {addresses.length > 0 && (
        <ul className="mt-5 grid gap-3">
          {addresses.map((address) => (
            <li key={address.id} className="rounded-2xl border border-femi-100 p-4 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">
                    {address.label ?? "Saved"} · {address.fullName}
                  </p>
                  <p className="mt-1 text-ink-soft">
                    {[address.line1, address.line2, address.city, address.state, address.pincode]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  <p className="mt-1 text-xs text-ink-faint">{address.mobile}</p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(address.id)}
                  className="focus-ring shrink-0 text-xs font-medium text-ink-faint underline hover:text-femi-600"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <form onSubmit={save} className="mt-6 grid gap-4 border-t border-femi-100 pt-6" noValidate>
          <FormError message={error} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Label" htmlFor="addr-label">
              <TextInput id="addr-label" value={form.label} onChange={update("label")} maxLength={40} />
            </Field>
            <Field label="Full name" htmlFor="addr-name" error={errors.fullName}>
              <TextInput
                id="addr-name"
                value={form.fullName}
                onChange={update("fullName")}
                invalid={Boolean(errors.fullName)}
                required
              />
            </Field>
            <Field label="Mobile" htmlFor="addr-mobile" error={errors.mobile}>
              <TextInput
                id="addr-mobile"
                inputMode="numeric"
                maxLength={10}
                value={form.mobile}
                onChange={(event) =>
                  setForm((current) => ({ ...current, mobile: event.target.value.replace(/\D/g, "") }))
                }
                invalid={Boolean(errors.mobile)}
                required
              />
            </Field>
            <Field label="PIN code" htmlFor="addr-pin" error={errors.pincode}>
              <TextInput
                id="addr-pin"
                inputMode="numeric"
                maxLength={6}
                value={form.pincode}
                onChange={(event) =>
                  setForm((current) => ({ ...current, pincode: event.target.value.replace(/\D/g, "") }))
                }
                invalid={Boolean(errors.pincode)}
                required
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address" htmlFor="addr-line1" error={errors.line1}>
                <TextInput
                  id="addr-line1"
                  value={form.line1}
                  onChange={update("line1")}
                  invalid={Boolean(errors.line1)}
                  required
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Landmark (optional)" htmlFor="addr-line2">
                <TextInput id="addr-line2" value={form.line2} onChange={update("line2")} />
              </Field>
            </div>
            <Field label="City" htmlFor="addr-city" error={errors.city}>
              <TextInput
                id="addr-city"
                value={form.city}
                onChange={update("city")}
                invalid={Boolean(errors.city)}
                required
              />
            </Field>
            <Field label="State" htmlFor="addr-state" error={errors.state}>
              <Select
                id="addr-state"
                value={form.state}
                onChange={update("state")}
                invalid={Boolean(errors.state)}
                required
              >
                <option value="">Select a state</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <Button type="submit" loading={loading} className="justify-self-start">
            Save address
          </Button>
        </form>
      )}

      {addresses.length === 0 && !open && (
        <p className="mt-5 text-sm text-ink-soft">
          No saved addresses yet. Add one now, or save it while checking out.
        </p>
      )}
    </section>
  );
}
