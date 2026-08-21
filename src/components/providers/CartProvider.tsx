"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { CartLine, OrderTotals, PricedLine } from "@/lib/types";

const STORAGE_KEY = "femi.cart.v1";
const MAX_QTY = 20;

interface CartApi {
  items: CartLine[];
  lines: PricedLine[];
  totals: OrderTotals;
  count: number;
  ready: boolean;
  pricing: boolean;
  /** The server could not be reached for prices. Totals shown may be stale. */
  pricingFailed: boolean;
  add: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  qtyOf: (productId: string) => number;
}

const EMPTY_TOTALS: OrderTotals = {
  subtotal: 0,
  savings: 0,
  deliveryFee: 0,
  total: 0,
  freeDeliveryApplied: false,
};

const CartContext = createContext<CartApi | null>(null);

export function useCart(): CartApi {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>.");
  return context;
}

function readStoredCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => {
        const record = (item ?? {}) as Record<string, unknown>;
        const qty = Math.floor(Number(record.qty));
        return {
          productId: typeof record.productId === "string" ? record.productId : "",
          qty: Number.isFinite(qty) ? Math.min(Math.max(qty, 0), MAX_QTY) : 0,
        };
      })
      .filter((line) => line.productId && line.qty > 0);
  } catch {
    return [];
  }
}

/**
 * Cart contents live in localStorage so they survive a reload and the trip out
 * to WhatsApp. Money does not: line prices and totals are fetched from
 * /api/cart/price, so the numbers on screen are the server's numbers.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [lines, setLines] = useState<PricedLine[]>([]);
  const [totals, setTotals] = useState<OrderTotals>(EMPTY_TOTALS);
  const [ready, setReady] = useState(false);
  const [pricing, setPricing] = useState(false);
  const [pricingFailed, setPricingFailed] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    setItems(readStoredCart());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage can be unavailable (private mode, quota). The cart still works
      // for this session; it simply will not persist.
    }
  }, [items, ready]);

  useEffect(() => {
    if (!ready) return;

    if (items.length === 0) {
      setLines([]);
      setTotals(EMPTY_TOTALS);
      setPricing(false);
      setPricingFailed(false);
      return;
    }

    const id = ++requestId.current;
    setPricing(true);

    fetch("/api/cart/price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("price"))))
      .then((data: { lines: PricedLine[]; totals: OrderTotals }) => {
        if (id !== requestId.current) return;
        setLines(data.lines);
        setTotals(data.totals);
        setPricingFailed(false);
      })
      .catch(() => {
        // Deliberately keep whatever was last shown rather than emptying the
        // cart. Wiping it here used to disable the checkout button outright,
        // so one failed pricing call locked the customer out of ordering —
        // even though the server re-prices the order from ids and quantities
        // and never trusts these numbers anyway.
        if (id === requestId.current) setPricingFailed(true);
      })
      .finally(() => {
        if (id === requestId.current) setPricing(false);
      });
  }, [items, ready]);

  const add = useCallback((productId: string, qty = 1) => {
    setItems((current) => {
      const existing = current.find((line) => line.productId === productId);
      if (!existing) return [...current, { productId, qty: Math.min(qty, MAX_QTY) }];
      return current.map((line) =>
        line.productId === productId
          ? { ...line, qty: Math.min(line.qty + qty, MAX_QTY) }
          : line,
      );
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setItems((current) =>
      qty <= 0
        ? current.filter((line) => line.productId !== productId)
        : current.map((line) =>
            line.productId === productId ? { ...line, qty: Math.min(qty, MAX_QTY) } : line,
          ),
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((current) => current.filter((line) => line.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const qtyOf = useCallback(
    (productId: string) => items.find((line) => line.productId === productId)?.qty ?? 0,
    [items],
  );

  const count = useMemo(() => items.reduce((sum, line) => sum + line.qty, 0), [items]);

  const value = useMemo(
    () => ({
      items, lines, totals, count, ready, pricing, pricingFailed,
      add, setQty, remove, clear, qtyOf,
    }),
    [items, lines, totals, count, ready, pricing, pricingFailed, add, setQty, remove, clear, qtyOf],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
