import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseAdminClient, getSupabasePublicClient } from "../supabase/server";
import type { Address, Order, Product, UserProfile } from "../types";
import type { Store } from "./types";

/**
 * Supabase-backed store.
 *
 * Two clients, chosen by what the call actually needs:
 *
 *  - `client()` uses the service role and bypasses RLS, so every entry point
 *    that reaches it must already have established who the caller is and
 *    whether they may do what they are asking. RLS in supabase/schema.sql is
 *    the second line of defence.
 *  - `reader()` prefers the service role but falls back to the anonymous
 *    client, which RLS limits to active products. That means the storefront
 *    browses and prices carts with only the publishable key configured; the
 *    service-role key is needed the moment someone places an order.
 */

type Row = Record<string, unknown>;

function client(): SupabaseClient {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is missing. Add it to your server environment — " +
        "orders and admin actions cannot run without it.",
    );
  }
  return admin;
}

function reader(): SupabaseClient {
  const admin = getSupabaseAdminClient();
  if (admin) return admin;

  const anon = getSupabasePublicClient();
  if (!anon) throw new Error("Supabase is not configured.");
  return anon;
}

function toProduct(row: Row): Product {
  return {
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    short: row.short as string,
    description: row.description as string,
    category: row.category as Product["category"],
    padCount: Number(row.pad_count ?? 0),
    length: (row.length as string) ?? "",
    size: (row.size as string) ?? "",
    packs: Number(row.packs ?? 1),
    mrp: Number(row.mrp ?? 0),
    price: Number(row.price ?? 0),
    bulkPrice: row.bulk_price == null ? undefined : Number(row.bulk_price),
    bulkMinQty: row.bulk_min_qty == null ? undefined : Number(row.bulk_min_qty),
    features: (row.features as string[]) ?? [],
    popularity: Number(row.popularity ?? 0),
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    stock: Number(row.stock ?? 0),
    active: Boolean(row.active),
    badge: (row.badge as string) ?? undefined,
    theme: row.theme as Product["theme"],
  };
}

function fromProduct(p: Product): Row {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    short: p.short,
    description: p.description,
    category: p.category,
    pad_count: p.padCount,
    length: p.length,
    size: p.size,
    packs: p.packs,
    mrp: p.mrp,
    price: p.price,
    bulk_price: p.bulkPrice ?? null,
    bulk_min_qty: p.bulkMinQty ?? null,
    features: p.features,
    popularity: p.popularity,
    rating: p.rating,
    review_count: p.reviewCount,
    stock: p.stock,
    active: p.active,
    badge: p.badge ?? null,
    theme: p.theme,
    updated_at: new Date().toISOString(),
  };
}

function toOrder(row: Row): Order {
  return {
    id: row.id as string,
    reference: row.reference as string,
    userId: (row.user_id as string) ?? null,
    status: row.status as Order["status"],
    customerName: row.customer_name as string,
    mobile: row.mobile as string,
    email: row.email as string,
    address: row.address as Address,
    notes: (row.notes as string) ?? undefined,
    lines: row.lines as Order["lines"],
    totals: row.totals as Order["totals"],
    courier: (row.courier as string) ?? "Delhivery",
    trackingId: (row.tracking_id as string) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function fromOrder(o: Order): Row {
  return {
    id: o.id,
    reference: o.reference,
    user_id: o.userId,
    status: o.status,
    customer_name: o.customerName,
    mobile: o.mobile,
    email: o.email,
    address: o.address,
    notes: o.notes ?? null,
    lines: o.lines,
    totals: o.totals,
    courier: o.courier,
    tracking_id: o.trackingId ?? null,
    created_at: o.createdAt,
    updated_at: o.updatedAt,
  };
}

function toAddress(row: Row): Address {
  return {
    id: row.id as string,
    label: (row.label as string) ?? undefined,
    fullName: row.full_name as string,
    mobile: row.mobile as string,
    line1: row.line1 as string,
    line2: (row.line2 as string) ?? undefined,
    city: row.city as string,
    state: row.state as string,
    pincode: row.pincode as string,
  };
}

export const supabaseStore: Store = {
  kind: "supabase",

  async listProducts({ includeInactive = false } = {}) {
    // Without the service key this sees only active rows, which is exactly
    // what `includeInactive: false` asks for anyway.
    let query = reader().from("products").select("*").order("popularity", { ascending: false });
    if (!includeInactive) query = query.eq("active", true);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []).map(toProduct);
  },

  async getProductById(id) {
    const { data, error } = await reader().from("products").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toProduct(data) : null;
  },

  async getProductBySlug(slug) {
    const { data, error } = await reader().from("products").select("*").eq("slug", slug).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toProduct(data) : null;
  },

  async saveProduct(product) {
    const { data, error } = await client()
      .from("products")
      .upsert(fromProduct(product))
      .select()
      .single();
    if (error) throw new Error(error.message);
    return toProduct(data);
  },

  async deleteProduct(id) {
    const { error } = await client().from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },

  async createOrder(order) {
    const { data, error } = await client().from("orders").insert(fromOrder(order)).select().single();
    if (error) throw new Error(error.message);
    // Best-effort stock decrement; a failure here must not lose the order.
    await Promise.all(
      order.lines.map((line) =>
        client().rpc("decrement_stock", { p_product_id: line.productId, p_qty: line.qty }),
      ),
    ).catch(() => undefined);
    return toOrder(data);
  },

  async getOrder(id) {
    const { data, error } = await client()
      .from("orders")
      .select("*")
      .or(`id.eq.${id},reference.eq.${id}`)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toOrder(data) : null;
  },

  async listOrders() {
    const { data, error } = await client()
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return (data ?? []).map(toOrder);
  },

  async listOrdersForUser(userId) {
    const { data, error } = await client()
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(toOrder);
  },

  async updateOrder(id, patch) {
    const update: Row = { updated_at: new Date().toISOString() };
    if (patch.status) update.status = patch.status;
    if (patch.trackingId !== undefined) update.tracking_id = patch.trackingId;

    const { data, error } = await client()
      .from("orders")
      .update(update)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? toOrder(data) : null;
  },

  async getProfile(userId) {
    const { data, error } = await client()
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return null;
    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name ?? "",
      mobile: data.mobile ?? "",
      role: (data.role as UserProfile["role"]) ?? "customer",
      createdAt: data.created_at,
    };
  },

  async saveProfile(profile) {
    const { error } = await client().from("profiles").upsert({
      id: profile.id,
      email: profile.email,
      full_name: profile.fullName,
      mobile: profile.mobile,
      role: profile.role,
    });
    if (error) throw new Error(error.message);
    return profile;
  },

  async listAddresses(userId) {
    const { data, error } = await client()
      .from("addresses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(toAddress);
  },

  async saveAddress(userId, address) {
    const row: Row = {
      user_id: userId,
      label: address.label ?? null,
      full_name: address.fullName,
      mobile: address.mobile,
      line1: address.line1,
      line2: address.line2 ?? null,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    };
    if (address.id) row.id = address.id;

    const { data, error } = await client().from("addresses").upsert(row).select().single();
    if (error) throw new Error(error.message);
    return toAddress(data);
  },

  async deleteAddress(userId, addressId) {
    const { error } = await client()
      .from("addresses")
      .delete()
      .eq("id", addressId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
  },
};
