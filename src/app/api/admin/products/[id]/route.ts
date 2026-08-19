import { fail, handler, json } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/current-user";
import { getStore } from "@/lib/db";

type Context = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, context: Context) {
  return handler(async () => {
    await requireAdmin();
    const { id } = await context.params;

    const store = getStore();
    if (!(await store.getProductById(id))) return fail("Product not found.", 404);

    await store.deleteProduct(id);
    return json({ ok: true });
  })(request, undefined);
}
