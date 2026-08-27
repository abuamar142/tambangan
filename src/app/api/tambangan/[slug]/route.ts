import { asc, eq } from "drizzle-orm";
import { err, ok } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { kapal, tambangan } from "@/lib/db/schema";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;

  const [t] = await db.select().from(tambangan).where(eq(tambangan.slug, slug)).limit(1);
  if (!t) return err("Tambangan tidak ditemukan", 404);

  const rows = await db
    .select({
      slug: kapal.slug,
      nama: kapal.nama,
      status: kapal.status,
      departingFrom: kapal.departingFrom,
      timerEndAt: kapal.timerEndAt,
      lastDepartureAt: kapal.lastDepartureAt,
      lastUpdatedAt: kapal.lastUpdatedAt,
    })
    .from(kapal)
    .where(eq(kapal.tambanganId, t.id))
    .orderBy(asc(kapal.nama));

  return ok({
    tambangan: {
      id: t.id,
      slug: t.slug,
      nama: t.nama,
      titikA: { nama: t.titikANama, lat: t.titikALat, lng: t.titikALng },
      titikB: { nama: t.titikBNama, lat: t.titikBLat, lng: t.titikBLng },
    },
    kapal: rows.map((k) => ({
      slug: k.slug,
      nama: k.nama,
      status: k.status,
      departingFrom: k.departingFrom,
      timerEndAt: k.timerEndAt ? k.timerEndAt.toISOString() : null,
      lastDepartureAt: k.lastDepartureAt ? k.lastDepartureAt.toISOString() : null,
      lastUpdated: k.lastUpdatedAt.toISOString(),
    })),
  });
}
