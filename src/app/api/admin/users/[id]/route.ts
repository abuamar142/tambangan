import { requireAdmin, ok, err } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

const resetSchema = z.object({
  password: z.string().min(4),
});

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return err("Unauthorized", 403);

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (isNaN(id)) return err("Invalid ID");

  const body = await _req.json();
  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.flatten().fieldErrors.password?.[0] ?? "Invalid");

  const hash = bcrypt.hashSync(parsed.data.password, 10);
  const updated = await db
    .update(users)
    .set({ passwordHash: hash })
    .where(eq(users.id, id))
    .returning({ id: users.id, username: users.username });

  if (updated.length === 0) return err("User not found", 404);
  return ok({ user: updated[0], message: "Password reset successfully" });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return err("Unauthorized", 403);

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (isNaN(id)) return err("Invalid ID");
  if (id === admin.id) return err("Cannot delete yourself");

  const deleted = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning({ id: users.id });

  if (deleted.length === 0) return err("User not found", 404);
  return ok({ message: "User deleted" });
}
