"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

/**
 * Hands a freshly placed order off to WhatsApp.
 *
 * Checkout cannot do this itself: by the time the order comes back from the
 * server the customer's tap is over, and window.open is then treated as a
 * pop-up and blocked on mobile. A top-level navigation carries no such
 * restriction, so the redirect happens here instead, once the confirmation
 * page — which the customer can return to — is already in their history.
 *
 * The button on the page stays the real fallback: if anything stops this,
 * the order is saved and one tap still sends it.
 */
export function SendToWhatsApp({ url }: { url: string }) {
  const params = useSearchParams();

  useEffect(() => {
    if (params.get("send") !== "1") return;

    // A short pause lets the confirmation render, so the customer sees their
    // order reference before WhatsApp takes over.
    const timer = window.setTimeout(() => {
      // Clearing the flag is deliberately left until here. Doing it up front
      // changed the search params, which re-ran this effect — and the cleanup
      // then cancelled the redirect before it ever fired.
      window.history.replaceState(null, "", window.location.pathname);
      window.location.href = url;
    }, 800);

    return () => window.clearTimeout(timer);
  }, [params, url]);

  return null;
}
