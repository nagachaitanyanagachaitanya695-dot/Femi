"use client";

import type { ReactNode } from "react";

import { AuthProvider } from "./AuthProvider";
import { CartProvider } from "./CartProvider";
import { ToastProvider } from "./ToastProvider";

export function SiteProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
