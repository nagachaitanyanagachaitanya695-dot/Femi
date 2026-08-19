"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Field, FormError, TextInput } from "@/components/ui/Field";

type Mode = "password" | "otp";

/** Only ever allow same-origin, path-only redirects back after signing in. */
function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/account";
  return value;
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();
  const { notify } = useToast();

  const next = safeNext(params.get("next"));
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const finish = async () => {
    await refresh();
    notify("Signed in. Welcome back!");
    router.push(next);
    router.refresh();
  };

  const submitPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not sign you in.");
        return;
      }
      await finish();
    } catch {
      setError("Network problem. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const requestCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not send a code.");
        return;
      }
      setCodeSent(true);
      setDevCode(data.devCode ?? null);
      notify("If that email is registered, a 6-digit code is on its way.", "info");
    } catch {
      setError("Network problem. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "That code is not valid.");
        return;
      }
      await finish();
    } catch {
      setError("Network problem. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-5">
      <div role="tablist" aria-label="Sign-in method" className="grid grid-cols-2 gap-1 rounded-full bg-femi-50 p-1">
        {(["password", "otp"] as Mode[]).map((option) => (
          <button
            key={option}
            role="tab"
            type="button"
            aria-selected={mode === option}
            onClick={() => {
              setMode(option);
              setError(null);
            }}
            className={`focus-ring rounded-full px-4 py-2 text-sm font-semibold transition ${
              mode === option ? "bg-white text-femi-700 shadow-soft" : "text-ink-soft"
            }`}
          >
            {option === "password" ? "Password" : "Email OTP"}
          </button>
        ))}
      </div>

      <FormError message={error} />

      {mode === "password" ? (
        <form onSubmit={submitPassword} className="grid gap-4" noValidate>
          <Field label="Email" htmlFor="login-email">
            <TextInput
              id="login-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </Field>
          <Field label="Password" htmlFor="login-password">
            <TextInput
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
            />
          </Field>
          <Button type="submit" size="lg" loading={loading} className="w-full">
            Sign in
          </Button>
          <Link
            href="/forgot-password"
            className="focus-ring text-center text-sm font-medium text-femi-600 underline"
          >
            Forgot your password?
          </Link>
        </form>
      ) : (
        <form onSubmit={codeSent ? submitCode : requestCode} className="grid gap-4" noValidate>
          <Field label="Email" htmlFor="otp-email">
            <TextInput
              id="otp-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              readOnly={codeSent}
            />
          </Field>

          {codeSent && (
            <Field
              label="6-digit code"
              htmlFor="otp-code"
              hint={devCode ? `Development mode — your code is ${devCode}` : "Valid for 10 minutes."}
            >
              <TextInput
                id="otp-code"
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
          )}

          <Button type="submit" size="lg" loading={loading} className="w-full">
            {codeSent ? "Verify and sign in" : "Send me a code"}
          </Button>

          {codeSent && (
            <button
              type="button"
              onClick={() => {
                setCodeSent(false);
                setCode("");
                setDevCode(null);
              }}
              className="focus-ring text-sm font-medium text-ink-soft underline"
            >
              Use a different email
            </button>
          )}
        </form>
      )}
    </div>
  );
}
