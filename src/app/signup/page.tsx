import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";
import { getCurrentUser } from "@/lib/auth/current-user";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create an account",
  robots: { index: false, follow: false },
};

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/account");

  return (
    <AuthShell
      title="Create your Femi account"
      subtitle="It takes a minute, and it means your addresses and order history are saved for next time."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="focus-ring font-semibold text-femi-600 underline">
            Sign in
          </Link>
        </>
      }
    >
      <Suspense fallback={<div className="skeleton h-80 rounded-2xl" />}>
        <SignupForm />
      </Suspense>
    </AuthShell>
  );
}
