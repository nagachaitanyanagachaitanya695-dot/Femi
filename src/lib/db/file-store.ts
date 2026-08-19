import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { products as seedProducts } from "../catalog";
import type { Address, Order, OrderStatus, Product, UserProfile } from "../types";
import type { CredentialStore, OtpRecord, Store, UserRecord } from "./types";

/**
 * Zero-config JSON file store.
 *
 * This is what runs when no Supabase project is configured, so the site is
 * usable the moment you clone it. It is a *development* backend: a single JSON
 * file, an in-process write queue, no replication. On a serverless host the
 * filesystem is ephemeral — configure Supabase before taking real orders.
 */

interface DbShape {
  products: Product[];
  orders: Order[];
  users: UserRecord[];
  profiles: UserProfile[];
  addresses: (Address & { id: string; userId: string })[];
  otps: OtpRecord[];
}

const DATA_DIR = process.env.FEMI_DATA_DIR ?? path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "femi-db.json");

function emptyDb(): DbShape {
  return {
    products: seedProducts.map((p) => ({ ...p })),
    orders: [],
    users: [],
    profiles: [],
    addresses: [],
    otps: [],
  };
}

let cache: DbShape | null = null;
/** Serialises read-modify-write cycles within this process. */
let queue: Promise<unknown> = Promise.resolve();

async function load(): Promise<DbShape> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<DbShape>;
    cache = { ...emptyDb(), ...parsed };
  } catch {
    cache = emptyDb();
    await persist(cache);
  }
  return cache;
}

async function persist(db: DbShape): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DATA_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
  await fs.rename(tmp, DATA_FILE);
}

function transact<T>(fn: (db: DbShape) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await load();
    const result = await fn(db);
    await persist(db);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

async function read<T>(fn: (db: DbShape) => T): Promise<T> {
  return fn(await load());
}

export const fileStore: Store & CredentialStore = {
  kind: "file",

  /* ---- catalogue ---- */
  listProducts: ({ includeInactive = false } = {}) =>
    read((db) => db.products.filter((p) => includeInactive || p.active).map((p) => ({ ...p }))),

  getProductById: (id) => read((db) => db.products.find((p) => p.id === id) ?? null),

  getProductBySlug: (slug) => read((db) => db.products.find((p) => p.slug === slug) ?? null),

  saveProduct: (product) =>
    transact((db) => {
      const index = db.products.findIndex((p) => p.id === product.id);
      if (index >= 0) db.products[index] = product;
      else db.products.push(product);
      return product;
    }),

  deleteProduct: (id) =>
    transact((db) => {
      db.products = db.products.filter((p) => p.id !== id);
    }),

  /* ---- orders ---- */
  createOrder: (order) =>
    transact((db) => {
      db.orders.unshift(order);
      // Decrement stock so the admin dashboard reflects reality.
      for (const line of order.lines) {
        const product = db.products.find((p) => p.id === line.productId);
        if (product) product.stock = Math.max(0, product.stock - line.qty);
      }
      return order;
    }),

  getOrder: (id) =>
    read((db) => db.orders.find((o) => o.id === id || o.reference === id) ?? null),

  listOrders: () => read((db) => db.orders.map((o) => ({ ...o }))),

  listOrdersForUser: (userId) =>
    read((db) => db.orders.filter((o) => o.userId === userId).map((o) => ({ ...o }))),

  updateOrder: (id, patch) =>
    transact((db) => {
      const order = db.orders.find((o) => o.id === id || o.reference === id);
      if (!order) return null;
      if (patch.status) order.status = patch.status as OrderStatus;
      if (patch.trackingId !== undefined) order.trackingId = patch.trackingId;
      order.updatedAt = new Date().toISOString();
      return { ...order };
    }),

  /* ---- profiles + addresses ---- */
  getProfile: (userId) => read((db) => db.profiles.find((p) => p.id === userId) ?? null),

  saveProfile: (profile) =>
    transact((db) => {
      const index = db.profiles.findIndex((p) => p.id === profile.id);
      if (index >= 0) db.profiles[index] = { ...db.profiles[index], ...profile };
      else db.profiles.push(profile);
      return profile;
    }),

  listAddresses: (userId) =>
    read((db) =>
      db.addresses
        .filter((a) => a.userId === userId)
        .map(
          (a): Address => ({
            id: a.id,
            label: a.label,
            fullName: a.fullName,
            mobile: a.mobile,
            line1: a.line1,
            line2: a.line2,
            city: a.city,
            state: a.state,
            pincode: a.pincode,
          }),
        ),
    ),

  saveAddress: (userId, address) =>
    transact((db) => {
      const id = address.id ?? randomUUID();
      const record = { ...address, id, userId };
      const index = db.addresses.findIndex((a) => a.id === id && a.userId === userId);
      if (index >= 0) db.addresses[index] = record;
      else db.addresses.push(record);
      return { ...address, id };
    }),

  deleteAddress: (userId, addressId) =>
    transact((db) => {
      db.addresses = db.addresses.filter((a) => !(a.id === addressId && a.userId === userId));
    }),

  /* ---- credentials (built-in auth backend only) ---- */
  findUserByEmail: (email) =>
    read((db) => db.users.find((u) => u.email === email.toLowerCase()) ?? null),

  findUserById: (id) => read((db) => db.users.find((u) => u.id === id) ?? null),

  createUser: (user) =>
    transact((db) => {
      db.users.push(user);
      db.profiles.push({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        mobile: user.mobile,
        role: user.role,
        createdAt: user.createdAt,
      });
      return user;
    }),

  updateUser: (id, patch) =>
    transact((db) => {
      const user = db.users.find((u) => u.id === id);
      if (!user) return null;
      Object.assign(user, patch);
      const profile = db.profiles.find((p) => p.id === id);
      if (profile) {
        if (patch.fullName) profile.fullName = patch.fullName;
        if (patch.mobile) profile.mobile = patch.mobile;
        if (patch.role) profile.role = patch.role;
      }
      return { ...user };
    }),

  putOtp: (record) =>
    transact((db) => {
      db.otps = db.otps.filter((o) => !(o.email === record.email && o.purpose === record.purpose));
      db.otps.push(record);
    }),

  getOtp: (email, purpose) =>
    read((db) => db.otps.find((o) => o.email === email && o.purpose === purpose) ?? null),

  clearOtp: (email, purpose) =>
    transact((db) => {
      db.otps = db.otps.filter((o) => !(o.email === email && o.purpose === purpose));
    }),

  bumpOtpAttempts: (email, purpose) =>
    transact((db) => {
      const otp = db.otps.find((o) => o.email === email && o.purpose === purpose);
      if (otp) otp.attempts += 1;
    }),
};
