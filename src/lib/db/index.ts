import "server-only";

import { isSupabaseConfigured } from "../supabase/config";
import { fileStore } from "./file-store";
import { supabaseStore } from "./supabase-store";
import type { CredentialStore, Store } from "./types";

/** The active store: Supabase when configured, otherwise the local file store. */
export function getStore(): Store {
  return isSupabaseConfigured() ? supabaseStore : fileStore;
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
