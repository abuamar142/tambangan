import { requireAdmin, ok, err } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { kapal, tambangan, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return err("Unauthorized", 403);

  const rows = await db
    .select({
      slug: kapal.slug,
      nama: kapal.nama,
      status: kapal.status,
      tambanganNama: tambangan.nama,
      ownerUsername: users.username,
      lastUpdatedAt: kapal.lastUpdatedAt,
    })
    .from(kapal)
    .innerJoin(tambangan, eq(kapal.tambanganId, tambangan.id))
    .innerJoin(users, eq(kapal.ownerId, users.id))
    .orderBy(desc(kapal.lastUpdatedAt));

  return ok({ kapal: rows });
}
