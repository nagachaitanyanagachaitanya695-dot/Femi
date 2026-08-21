/**
 * Raised when the store cannot run because it is misconfigured — a missing
 * service-role key, an unreachable database.
 *
 * Distinct from an ordinary failure so the checkout can tell a customer
 * something useful ("order over WhatsApp instead") rather than a blank
 * "something went wrong", while the real cause goes to the server log only.
 */
export class StoreConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoreConfigError";
  }
}
