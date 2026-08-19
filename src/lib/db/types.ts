import type { Address, Order, OrderStatus, Product, UserProfile } from "../types";

/** A local credential record. Only ever used by the built-in auth backend. */
export interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  mobile: string;
  role: "customer" | "admin";
  passwordHash: string;
  createdAt: string;
}

export interface OtpRecord {
  email: string;
  codeHash: string;
  purpose: "login" | "reset" | "verify";
  expiresAt: string;
  attempts: number;
}

/**
 * The storage contract the app is written against. Two implementations exist:
 * a JSON file store (default, zero-config) and a Supabase store (production).
 */
export interface Store {
  readonly kind: "file" | "supabase";

  /* ---- catalogue ---- */
  listProducts(opts?: { includeInactive?: boolean }): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  getProductBySlug(slug: string): Promise<Product | null>;
  saveProduct(product: Product): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  /* ---- orders ---- */
  createOrder(order: Order): Promise<Order>;
  getOrder(id: string): Promise<Order | null>;
  listOrders(): Promise<Order[]>;
  listOrdersForUser(userId: string): Promise<Order[]>;
  updateOrder(
    id: string,
    patch: { status?: OrderStatus; trackingId?: string | null },
  ): Promise<Order | null>;

  /* ---- profiles + addresses ---- */
  getProfile(userId: string): Promise<UserProfile | null>;
  saveProfile(profile: UserProfile): Promise<UserProfile>;
  listAddresses(userId: string): Promise<Address[]>;
  saveAddress(userId: string, address: Address): Promise<Address>;
  deleteAddress(userId: string, addressId: string): Promise<void>;
}

/** Extra operations only the built-in (non-Supabase) auth backend needs. */
export interface CredentialStore {
  findUserByEmail(email: string): Promise<UserRecord | null>;
  findUserById(id: string): Promise<UserRecord | null>;
  createUser(user: UserRecord): Promise<UserRecord>;
  updateUser(id: string, patch: Partial<UserRecord>): Promise<UserRecord | null>;
  putOtp(record: OtpRecord): Promise<void>;
  getOtp(email: string, purpose: OtpRecord["purpose"]): Promise<OtpRecord | null>;
  clearOtp(email: string, purpose: OtpRecord["purpose"]): Promise<void>;
  bumpOtpAttempts(email: string, purpose: OtpRecord["purpose"]): Promise<void>;
}
