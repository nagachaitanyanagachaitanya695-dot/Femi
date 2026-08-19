"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";

export function SignOutButton() {
  const { signOut } = useAuth();
  const { notify } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="danger"
      loading={loading}
      onClick={async () => {
        setLoading(true);
        await signOut();
        notify("You have been signed out.", "info");
        router.push("/");
        router.refresh();
      }}
    >
      Sign out
    </Button>
  );
}
