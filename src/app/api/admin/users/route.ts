import { requireAdmin, ok, err } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return err("Unauthorized", 403);

  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(asc(users.id));

  return ok({ users: rows });
}
