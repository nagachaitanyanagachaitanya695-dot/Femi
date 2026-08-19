import { handler, json } from "@/lib/api";
import { requireUser } from "@/lib/auth/current-user";
import { getStore } from "@/lib/db";

type Context = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, context: Context) {
  return handler(async () => {
    const user = await requireUser();
    const { id } = await context.params;
    await getStore().deleteAddress(user.id, id);
    return json({ ok: true });
  })(request, undefined);
}
