import { eq } from "drizzle-orm";
import { z } from "zod";
import { err, ok } from "@/lib/api-utils";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const bodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return err("Isi username dan password");

  const { username, password } = parsed.data;
  const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return err("Username atau password salah", 401);
  }

  const token = await createSessionToken({ sub: user.id, username: user.username });
  await setSessionCookie(token);
  return ok({ user: { id: user.id, username: user.username } });
}
