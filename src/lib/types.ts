export type CategorySlug = "everyday" | "heavy-flow" | "overnight" | "value-packs";

export interface Category {
  slug: CategorySlug;
  name: string;
  blurb: string;
  /** Pack colours used by the 3D / CSS pack renderer. */
  theme: PackTheme;
}

export interface PackTheme {
  /** Main packaging colour. */
  base: string;
  /** Accent band colour. */
  band: string;
  /** Right-hand "open" tab colour. */
  tab: string;
  /** Ink colour used for the logo + copy printed on the pack. */
  ink: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  /** One-line description used on cards. */
  short: string;
  /** Long description used on the product page. */
  description: string;
  category: CategorySlug;
  /** Number of pads inside the pack. */
  padCount: number;
  /** Pad length, e.g. "320mm". */
  length: string;
  /** Size label, e.g. "XL". */
  size: string;
  /** How many retail packs the listing contains (2 = twin pack). */
  packs: number;
  /** Printed maximum retail price, in rupees. */
  mrp: number;
  /** Our selling price, in rupees. */
  price: number;
  /** Optional bulk price applied automatically at `bulkMinQty` or more. */
  bulkPrice?: number;
  bulkMinQty?: number;
  /** Feature bullets — packaging features only, never health claims. */
  features: string[];
  /** Sort weight for "popularity". Higher = more popular. */
  popularity: number;
  rating: number;
  reviewCount: number;
  stock: number;
  active: boolean;
  badge?: string;
  theme: PackTheme;
}

export interface CartLine {
  productId: string;
  qty: number;
}

/** A cart line after server-side pricing has been applied. */
export interface PricedLine {
  productId: string;
  slug: string;
  name: string;
  size: string;
  length: string;
  padCount: number;
  qty: number;
  unitPrice: number;
  unitMrp: number;
  lineTotal: number;
  bulkApplied: boolean;
}

export interface OrderTotals {
  subtotal: number;
  savings: number;
  deliveryFee: number;
  total: number;
  freeDeliveryApplied: boolean;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
];

export interface Address {
  id?: string;
  label?: string;
  fullName: string;
  mobile: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  /** Short human-friendly reference shared over WhatsApp, e.g. FEMI-8KQ2M4. */
  reference: string;
  userId: string | null;
  status: OrderStatus;
  customerName: string;
  mobile: string;
  email: string;
  address: Address;
  notes?: string;
  lines: PricedLine[];
  totals: OrderTotals;
  courier: string;
  trackingId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  mobile: string;
  role: "customer" | "admin";
  createdAt: string;
}
