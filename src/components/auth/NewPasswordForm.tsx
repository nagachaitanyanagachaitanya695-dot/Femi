"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Field, FormError, TextInput } from "@/components/ui/Field";

export function NewPasswordForm() {
  const router = useRouter();
  const { notify } = useToast();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/password/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(
          data.error ??
            "Could not update your password. The reset link may have expired — request a new one.",
        );
        return;
      }
      notify("Password updated.");
      router.push("/account");
      router.refresh();
    } catch {
      setError("Network problem. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
      <FormError message={error} />
      <Field
        label="New password"
        htmlFor="new-password"
        hint="At least 8 characters, with a letter and a number."
      >
        <TextInput
          id="new-password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
        />
      </Field>
      <Button type="submit" size="lg" loading={loading} className="w-full">
        Update password
      </Button>
    </form>
  );
}
