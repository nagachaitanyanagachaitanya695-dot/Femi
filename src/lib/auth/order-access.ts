import "server-only";

import { cookies } from "next/headers";

import { seal, unseal } from "./signing";

export const ORDER_ACCESS_COOKIE = "femi_orders";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 60; // 60 days
const MAX_TRACKED_ORDERS = 20;

interface OrderGrant {
  /** Order ids and references this browser is allowed to view. */
  ids: string[];
}

/**
 * Lets a guest see the order they just placed.
 *
 * A customer who checks out without an account still needs their confirmation
 * page — including after the trip out to WhatsApp and back. Rather than making
 * order references guessable keys, the server hands the browser a signed,
 * http-only cookie naming exactly which orders it may read. It cannot be
 * edited to name someone else's order, because the signature would not match.
 */
export async function grantOrderAccess(...identifiers: string[]): Promise<void> {
  const store = await cookies();
  const existing = unseal<OrderGrant>(store.get(ORDER_ACCESS_COOKIE)?.value);

  const ids = [...new Set([...identifiers, ...(existing?.ids ?? [])])].slice(
    0,
    MAX_TRACKED_ORDERS,
  );

  store.set(ORDER_ACCESS_COOKIE, seal({ ids } satisfies OrderGrant), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

/** True when this browser was given access to the order by the server. */
export async function hasOrderAccess(...identifiers: string[]): Promise<boolean> {
  const store = await cookies();
  const grant = unseal<OrderGrant>(store.get(ORDER_ACCESS_COOKIE)?.value);
  if (!grant?.ids?.length) return false;

  return identifiers.some((identifier) => identifier && grant.ids.includes(identifier));
}
