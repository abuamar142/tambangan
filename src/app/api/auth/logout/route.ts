import { ok } from "@/lib/api-utils";
import { clearSessionCookie } from "@/lib/auth/session";

export async function POST() {
  await clearSessionCookie();
  return ok({ ok: true });
}
