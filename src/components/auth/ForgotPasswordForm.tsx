"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Field, FormError, TextInput } from "@/components/ui/Field";

export function ForgotPasswordForm() {
  const router = useRouter();
  const { notify } = useToast();

  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const request = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not send a reset code.");
        return;
      }
      setDevCode(data.devCode ?? null);
      setStep("verify");
      notify("If that email is registered, we have sent a reset code.", "info");
    } catch {
      setError("Network problem. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/password/reset", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not reset your password.");
        return;
      }
      notify("Password updated. You are signed in.");
      router.push("/account");
      router.refresh();
    } catch {
      setError("Network problem. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={step === "request" ? request : verify} className="grid gap-4" noValidate>
      <FormError message={error} />

      <Field label="Email" htmlFor="reset-email">
        <TextInput
          id="reset-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          readOnly={step === "verify"}
          placeholder="you@example.com"
        />
      </Field>

      {step === "verify" && (
        <>
          <Field
            label="6-digit code"
            htmlFor="reset-code"
            hint={devCode ? `Development mode — your code is ${devCode}` : "Valid for 10 minutes."}
          >
            <TextInput
              id="reset-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="text-center text-xl tracking-[0.5em]"
            />
          </Field>
          <Field
            label="New password"
            htmlFor="reset-password"
            hint="At least 8 characters, with a letter and a number."
          >
            <TextInput
              id="reset-password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </Field>
        </>
      )}

      <Button type="submit" size="lg" loading={loading} className="w-full">
        {step === "request" ? "Send reset code" : "Set new password"}
      </Button>
    </form>
  );
}
