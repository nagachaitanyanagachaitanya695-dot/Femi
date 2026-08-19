import type { Metadata } from "next";
import Link from "next/link";

import { AuthShell } from "@/components/auth/AuthShell";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
};

/**
 * Landing page for the Supabase password-reset link. Opening the link signs
 * the visitor in with a recovery session; this form completes the change.
 */
export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Choose a new password"
      subtitle="You opened a password reset link. Pick a new password to finish."
      footer={
        <Link href="/login" className="focus-ring font-semibold text-femi-600 underline">
          Back to sign in
        </Link>
      }
    >
      <NewPasswordForm />
    </AuthShell>
  );
}
