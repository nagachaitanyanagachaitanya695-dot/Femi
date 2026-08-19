"use client";

import { useState } from "react";

import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Field, FormError, Select, TextArea, TextInput } from "@/components/ui/Field";
import { money } from "@/lib/format";
import { categories } from "@/lib/catalog";
import type { Product } from "@/lib/types";

type Draft = Partial<Product> & { id: string };

const BLANK: Draft = {
  id: "",
  slug: "",
  name: "",
  short: "",
  description: "",
  category: "everyday",
  padCount: 10,
  length: "290mm",
  size: "L",
  packs: 1,
  mrp: 0,
  price: 0,
  stock: 0,
  active: true,
  popularity: 50,
  badge: "",
};

export function AdminProducts({ initialProducts }: { initialProducts: Product[] }) {
  const { notify } = useToast();
  const [products, setProducts] = useState(initialProducts);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const startNew = () => {
    setError(null);
    setDraft({ ...BLANK, id: `femi-${Date.now().toString(36)}` });
  };

  const edit = (product: Product) => {
    setError(null);
    setDraft({ ...product });
  };

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => (current ? { ...current, [key]: value } : current));

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft) return;
    setError(null);
    setSaving(true);

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not save the product.");
        return;
      }

      const saved = data.product as Product;
      setProducts((current) => {
        const exists = current.some((p) => p.id === saved.id);
        return exists ? current.map((p) => (p.id === saved.id ? saved : p)) : [...current, saved];
      });
      setDraft(null);
      notify(`${saved.name} saved.`);
    } catch {
      setError("Network problem. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (product: Product) => {
    if (!window.confirm(`Delete “${product.name}”? This cannot be undone.`)) return;

    const response = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    if (!response.ok) {
      notify("Could not delete that product.", "error");
      return;
    }
    setProducts((current) => current.filter((p) => p.id !== product.id));
    notify(`${product.name} deleted.`, "info");
  };

  const toggleActive = async (product: Product) => {
    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...product, active: !product.active }),
    });
    const data = await response.json();
    if (!response.ok) {
      notify(data.error ?? "Could not update the product.", "error");
      return;
    }
    const saved = data.product as Product;
    setProducts((current) => current.map((p) => (p.id === saved.id ? saved : p)));
    notify(saved.active ? `${saved.name} is live.` : `${saved.name} is hidden.`, "info");
  };

  return (
    <div className="grid gap-6">
      <div className="flex justify-end">
        <Button onClick={startNew}>Add product</Button>
      </div>

      {draft && (
        <form onSubmit={save} className="rounded-card border border-femi-200 bg-white p-6" noValidate>
          <h2 className="font-display text-xl text-ink">
            {products.some((p) => p.id === draft.id) ? "Edit product" : "New product"}
          </h2>
          <div className="mt-2">
            <FormError message={error} />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Name" htmlFor="p-name">
              <TextInput id="p-name" value={draft.name ?? ""} onChange={(e) => set("name", e.target.value)} required />
            </Field>
            <Field label="URL slug" htmlFor="p-slug" hint="Lowercase words separated by hyphens.">
              <TextInput id="p-slug" value={draft.slug ?? ""} onChange={(e) => set("slug", e.target.value)} required />
            </Field>
            <Field label="Category" htmlFor="p-category">
              <Select
                id="p-category"
                value={draft.category ?? "everyday"}
                onChange={(e) => set("category", e.target.value as Product["category"])}
              >
                {categories.map((category) => (
                  <option key={category.slug} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="MRP (₹)" htmlFor="p-mrp">
              <TextInput
                id="p-mrp"
                inputMode="numeric"
                value={String(draft.mrp ?? 0)}
                onChange={(e) => set("mrp", Number(e.target.value.replace(/\D/g, "")))}
              />
            </Field>
            <Field label="Selling price (₹)" htmlFor="p-price">
              <TextInput
                id="p-price"
                inputMode="numeric"
                value={String(draft.price ?? 0)}
                onChange={(e) => set("price", Number(e.target.value.replace(/\D/g, "")))}
              />
            </Field>
            <Field label="Stock (packs)" htmlFor="p-stock">
              <TextInput
                id="p-stock"
                inputMode="numeric"
                value={String(draft.stock ?? 0)}
                onChange={(e) => set("stock", Number(e.target.value.replace(/\D/g, "")))}
              />
            </Field>

            <Field label="Bulk price (₹, optional)" htmlFor="p-bulk">
              <TextInput
                id="p-bulk"
                inputMode="numeric"
                value={draft.bulkPrice === undefined ? "" : String(draft.bulkPrice)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  set("bulkPrice", raw === "" ? undefined : Number(raw));
                }}
              />
            </Field>
            <Field label="Bulk applies from (qty)" htmlFor="p-bulk-min">
              <TextInput
                id="p-bulk-min"
                inputMode="numeric"
                value={String(draft.bulkMinQty ?? 5)}
                onChange={(e) => set("bulkMinQty", Number(e.target.value.replace(/\D/g, "")))}
              />
            </Field>
            <Field label="Offer badge (optional)" htmlFor="p-badge">
              <TextInput id="p-badge" value={draft.badge ?? ""} onChange={(e) => set("badge", e.target.value)} />
            </Field>

            <Field label="Pads per order" htmlFor="p-pads">
              <TextInput
                id="p-pads"
                inputMode="numeric"
                value={String(draft.padCount ?? 0)}
                onChange={(e) => set("padCount", Number(e.target.value.replace(/\D/g, "")))}
              />
            </Field>
            <Field label="Length" htmlFor="p-length">
              <TextInput id="p-length" value={draft.length ?? ""} onChange={(e) => set("length", e.target.value)} />
            </Field>
            <Field label="Size label" htmlFor="p-size">
              <TextInput id="p-size" value={draft.size ?? ""} onChange={(e) => set("size", e.target.value)} />
            </Field>

            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Short description" htmlFor="p-short">
                <TextInput id="p-short" value={draft.short ?? ""} onChange={(e) => set("short", e.target.value)} />
              </Field>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Full description" htmlFor="p-desc">
                <TextArea
                  id="p-desc"
                  value={draft.description ?? ""}
                  onChange={(e) => set("description", e.target.value)}
                />
              </Field>
            </div>
          </div>

          <label className="mt-4 flex items-center gap-3 text-sm text-ink-soft">
            <input
              type="checkbox"
              className="size-4 accent-femi-500"
              checked={draft.active ?? true}
              onChange={(e) => set("active", e.target.checked)}
            />
            Visible in the store
          </label>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="submit" loading={saving}>
              Save product
            </Button>
            <Button type="button" variant="ghost" onClick={() => setDraft(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-card border border-femi-100 bg-white">
        <table className="w-full min-w-[46rem] text-sm">
          <thead className="border-b border-femi-100 text-left text-xs tracking-wide text-ink-faint uppercase">
            <tr>
              <th scope="col" className="px-5 py-3">Product</th>
              <th scope="col" className="px-5 py-3">Price</th>
              <th scope="col" className="px-5 py-3">Stock</th>
              <th scope="col" className="px-5 py-3">Status</th>
              <th scope="col" className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-femi-50 last:border-0">
                <td className="px-5 py-4">
                  <span className="block font-semibold text-ink">{product.name}</span>
                  <span className="block text-xs text-ink-faint">
                    {product.size} · {product.length} · {product.padCount} pads
                  </span>
                </td>
                <td className="px-5 py-4 tabular-nums">
                  <span className="block font-medium text-ink">{money(product.price)}</span>
                  <span className="block text-xs text-ink-faint line-through">{money(product.mrp)}</span>
                </td>
                <td className="px-5 py-4 tabular-nums">
                  <span className={product.stock < 20 ? "font-semibold text-femi-700" : "text-ink"}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => toggleActive(product)}
                    className={`focus-ring rounded-full px-3 py-1 text-xs font-bold uppercase transition ${
                      product.active ? "bg-leaf/12 text-leaf" : "bg-sand text-ink-faint"
                    }`}
                  >
                    {product.active ? "Live" : "Hidden"}
                  </button>
                </td>
                <td className="px-5 py-4 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => edit(product)}
                    className="focus-ring text-sm font-semibold text-femi-600 underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(product)}
                    className="focus-ring ml-4 text-sm font-medium text-ink-faint underline hover:text-femi-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
