import { requireAdmin, ok, err } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

const resetSchema = z.object({
  password: z.string().min(4).optional(),
  tambanganId: z.number().int().positive().nullable().optional(),
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
  if (!parsed.success) return err("Invalid data");

  const updates: Record<string, unknown> = {};
  if (parsed.data.password) {
    updates.passwordHash = bcrypt.hashSync(parsed.data.password, 10);
  }
  if (parsed.data.tambanganId !== undefined) {
    updates.tambanganId = parsed.data.tambanganId;
  }
  if (Object.keys(updates).length === 0) return err("No fields to update");

  const updated = await db
    .update(users)
    .set(updates)
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
