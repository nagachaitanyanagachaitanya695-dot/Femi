import "server-only";

import { products as seedProducts } from "../catalog";
import { isSupabaseConfigured } from "../supabase/config";
import type { Product } from "../types";
import { fileStore } from "./file-store";
import { supabaseStore } from "./supabase-store";
import type { CredentialStore, Store } from "./types";

/**
 * The active store: Supabase when configured, otherwise the local file store.
 *
 * FEMI_STORE=file forces the file store even with Supabase credentials
 * present, which is how the shop runs offline during development.
 */
export function getStore(): Store {
  if (process.env.FEMI_STORE === "file") return fileStore;
  return isSupabaseConfigured() ? supabaseStore : fileStore;
}

/**
 * The catalogue for pages people browse.
 *
 * A database that is unreachable — paused, throttled, mid-incident — should
 * not take the whole shop down. Browsing falls back to the catalogue the app
 * ships with, so the storefront stays up and legible.
 *
 * Deliberately not used when pricing an order: an order must be priced from
 * live data or not at all, so those paths still fail and tell the customer to
 * order in chat instead.
 */
export async function listProductsForDisplay(): Promise<Product[]> {
  try {
    return await getStore().listProducts();
  } catch (error) {
    console.error("[femi][db] catalogue unavailable, showing the bundled one:", error);
    return seedProducts.filter((product) => product.active);
  }
}

/** Single product for a page, with the same fallback. */
export async function getProductForDisplay(slug: string): Promise<Product | null> {
  try {
    return await getStore().getProductBySlug(slug);
  } catch (error) {
    console.error("[femi][db] product lookup failed, using the bundled catalogue:", error);
    return seedProducts.find((product) => product.slug === slug && product.active) ?? null;
  }
}

/**
 * The built-in credential store. Only reachable when Supabase is *not*
 * configured — with Supabase, all credential handling belongs to Supabase Auth.
 */
export function getCredentialStore(): CredentialStore {
  if (isSupabaseConfigured()) {
    throw new Error("Credential store is unavailable: Supabase Auth is handling authentication.");
  }
  return fileStore;
}

export { fileStore };
export type { Store, CredentialStore };
