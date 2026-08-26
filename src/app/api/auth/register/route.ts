import { eq } from "drizzle-orm";
import { z } from "zod";
import { err, ok } from "@/lib/api-utils";
import { hashPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

const bodySchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_.]+$/, "Username hanya boleh huruf, angka, titik, underscore"),
  password: z.string().min(6).max(72),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return err("Username 3-30 karakter (huruf/angka/._) dan password minimal 6 karakter");
  }

  const { username, password } = parsed.data;
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existing.length > 0) {
    return err("Username sudah dipakai", 409);
  }

  const [user] = await db
    .insert(users)
    .values({ username, passwordHash: await hashPassword(password) })
    .returning({ id: users.id, username: users.username });

  const token = await createSessionToken({ sub: user.id, username: user.username });
  await setSessionCookie(token);
  return ok({ user }, 201);
}
