"use client";

import { useState } from "react";

import { useAuth, type SessionUser } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Field, FormError, TextInput } from "@/components/ui/Field";
import type { AuthUser } from "@/lib/auth/current-user";

export function ProfileForm({ user }: { user: AuthUser }) {
  const { setUser } = useAuth();
  const { notify } = useToast();

  const [fullName, setFullName] = useState(user.fullName);
  const [mobile, setMobile] = useState(user.mobile);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setErrors({});
    setLoading(true);
    try {
      const response = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, mobile }),
      });
      const data = await response.json();
      if (!response.ok) {
        setErrors(data.errors ?? {});
        setError(data.error ?? "Could not save your details.");
        return;
      }
      setUser(data.user as SessionUser);
      notify("Profile updated.");
    } catch {
      setError("Network problem. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSavingPassword(true);
    try {
      const response = await fetch("/api/auth/password/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not update your password.");
        return;
      }
      setPassword("");
      notify("Password updated.");
    } catch {
      setError("Network problem. Please try again.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <section className="rounded-card border border-femi-100 bg-white p-6">
      <h2 className="font-display text-xl text-ink">Your details</h2>
      <FormError message={error} />

      <form onSubmit={saveProfile} className="mt-5 grid gap-4" noValidate>
        <Field label="Full name" htmlFor="profile-name" error={errors.fullName}>
          <TextInput
            id="profile-name"
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            invalid={Boolean(errors.fullName)}
          />
        </Field>
        <Field label="Mobile number" htmlFor="profile-mobile" error={errors.mobile}>
          <TextInput
            id="profile-mobile"
            inputMode="numeric"
            maxLength={10}
            value={mobile}
            onChange={(event) => setMobile(event.target.value.replace(/\D/g, ""))}
            invalid={Boolean(errors.mobile)}
          />
        </Field>
        <Field label="Email" htmlFor="profile-email" hint="Contact us if you need to change this.">
          <TextInput id="profile-email" value={user.email} readOnly disabled />
        </Field>
        <Button type="submit" loading={loading} className="justify-self-start">
          Save details
        </Button>
      </form>

      <form onSubmit={savePassword} className="mt-8 grid gap-4 border-t border-femi-100 pt-6" noValidate>
        <Field
          label="New password"
          htmlFor="profile-password"
          hint="At least 8 characters, with a letter and a number."
        >
          <TextInput
            id="profile-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
          />
        </Field>
        <Button
          type="submit"
          variant="secondary"
          loading={savingPassword}
          disabled={password.length < 8}
          className="justify-self-start"
        >
          Change password
        </Button>
      </form>
    </section>
  );
}
