import { desc, eq } from "drizzle-orm";
import { err, ok } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { kapalEvents, kapal, tambangan } from "@/lib/db/schema";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;

  const [t] = await db
    .select({ id: tambangan.id })
    .from(tambangan)
    .where(eq(tambangan.slug, slug))
    .limit(1);
  if (!t) return err("Tambangan tidak ditemukan", 404);

  const rows = await db
    .select({
      id: kapalEvents.id,
      event: kapalEvents.event,
      meta: kapalEvents.meta,
      createdAt: kapalEvents.createdAt,
      kapalNama: kapal.nama,
      kapalSlug: kapal.slug,
    })
    .from(kapalEvents)
    .innerJoin(kapal, eq(kapalEvents.kapalId, kapal.id))
    .where(eq(kapal.tambanganId, t.id))
    .orderBy(desc(kapalEvents.createdAt))
    .limit(10);

  return ok({
    events: rows.map((r) => ({
      id: r.id,
      event: r.event,
      meta: r.meta,
      createdAt: r.createdAt.toISOString(),
      kapalNama: r.kapalNama,
      kapalSlug: r.kapalSlug,
    })),
  });
}
