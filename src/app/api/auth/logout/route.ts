import { handler, json } from "@/lib/api";
import { signOut } from "@/lib/auth/service";

export const POST = handler(async () => {
  await signOut();
  return json({ ok: true });
});
