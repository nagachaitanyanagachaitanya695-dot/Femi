import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/auth/current-user";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/account");

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to check out, track your orders and keep your delivery addresses handy."
      footer={
        <>
          New to Femi?{" "}
          <Link href="/signup" className="focus-ring font-semibold text-femi-600 underline">
            Create an account
          </Link>
        </>
      }
    >
      <Suspense fallback={<div className="skeleton h-64 rounded-2xl" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
