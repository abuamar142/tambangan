import { z } from "zod";
import { currentUser, err, ok } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

const bodySchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6).max(100),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return err("Perlu login", 401);

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return err("Password lama dan password baru wajib diisi (min 6 karakter)");
  const { oldPassword, newPassword } = parsed.data;

  const [row] = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);
  if (!row) return err("User tidak ditemukan", 404);

  const valid = await verifyPassword(oldPassword, row.passwordHash);
  if (!valid) return err("Password lama salah");

  if (oldPassword === newPassword) return err("Password baru harus berbeda dari password lama");

  const newHash = await hashPassword(newPassword);
  await db.update(users).set({ passwordHash: newHash }).where(eq(users.id, user.id));

  return ok({ message: "Password berhasil diubah" });
}
