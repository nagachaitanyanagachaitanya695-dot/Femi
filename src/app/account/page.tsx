import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AddressBook } from "@/components/account/AddressBook";
import { ProfileForm } from "@/components/account/ProfileForm";
import { SignOutButton } from "@/components/account/SignOutButton";
import { OrderList } from "@/components/account/OrderList";
import { ButtonLink } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getStore } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const store = getStore();
  const [addresses, orders] = await Promise.all([
    store.listAddresses(user.id),
    store.listOrdersForUser(user.id),
  ]);

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-femi-600 uppercase">
            Your account
          </p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-ink sm:text-5xl">
            Hello, {user.fullName || "there"}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {user.role === "admin" && (
            <ButtonLink href="/admin" variant="secondary">
              Admin dashboard
            </ButtonLink>
          )}
          <SignOutButton />
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:items-start">
        <ProfileForm user={user} />
        <AddressBook initialAddresses={addresses} />
      </div>

      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl text-ink">Recent orders</h2>
          <Link href="/account/orders" className="focus-ring text-sm font-semibold text-femi-600 underline">
            View all
          </Link>
        </div>
        <div className="mt-5">
          <OrderList orders={orders.slice(0, 3)} />
        </div>
      </section>
    </div>
  );
}
