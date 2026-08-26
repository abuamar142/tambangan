import { requireAdmin, ok, err } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { tambangan } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return err("Unauthorized", 403);

  const rows = await db
    .select()
    .from(tambangan)
    .orderBy(asc(tambangan.id));

  return ok({ tambangan: rows });
}
