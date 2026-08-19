"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Field, FormError, TextInput } from "@/components/ui/Field";

function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/account";
  return value;
}

export function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();
  const { notify } = useToast();

  const next = safeNext(params.get("next"));
  const [form, setForm] = useState({ fullName: "", email: "", mobile: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setErrors({});
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        setErrors(data.errors ?? {});
        setError(data.error ?? "Could not create your account.");
        return;
      }

      if (data.needsEmailConfirmation) {
        notify("Check your inbox to confirm your email, then sign in.", "info");
        router.push("/login");
        return;
      }

      await refresh();
      notify("Welcome to Femi! Your account is ready.");
      router.push(next);
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

      <Field label="Full name" htmlFor="signup-name" error={errors.fullName}>
        <TextInput
          id="signup-name"
          autoComplete="name"
          required
          value={form.fullName}
          onChange={update("fullName")}
          invalid={Boolean(errors.fullName)}
          placeholder="Your name"
        />
      </Field>

      <Field label="Email" htmlFor="signup-email" error={errors.email}>
        <TextInput
          id="signup-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={update("email")}
          invalid={Boolean(errors.email)}
          placeholder="you@example.com"
        />
      </Field>

      <Field
        label="Mobile number"
        htmlFor="signup-mobile"
        error={errors.mobile}
        hint="10-digit Indian mobile number — we use it to confirm your order on WhatsApp."
      >
        <TextInput
          id="signup-mobile"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={10}
          required
          value={form.mobile}
          onChange={(event) =>
            setForm((current) => ({ ...current, mobile: event.target.value.replace(/\D/g, "") }))
          }
          invalid={Boolean(errors.mobile)}
          placeholder="9XXXXXXXXX"
        />
      </Field>

      <Field
        label="Password"
        htmlFor="signup-password"
        error={errors.password}
        hint="At least 8 characters, with a letter and a number."
      >
        <TextInput
          id="signup-password"
          type="password"
          autoComplete="new-password"
          required
          value={form.password}
          onChange={update("password")}
          invalid={Boolean(errors.password)}
          placeholder="••••••••"
        />
      </Field>

      <Button type="submit" size="lg" loading={loading} className="mt-1 w-full">
        Create my account
      </Button>
    </form>
  );
}
