import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { currentUser, err, ok } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { kapal, tambangan } from "@/lib/db/schema";
import { slugify } from "@/lib/slugify";
import type { TambanganDto } from "@/lib/types";

const bodySchema = z.object({
  nama: z.string().min(2).max(60),
  titikANama: z.string().min(1).max(40),
  titikALat: z.number().min(-90).max(90).nullable().optional(),
  titikALng: z.number().min(-180).max(180).nullable().optional(),
  titikBNama: z.string().min(1).max(40),
  titikBLat: z.number().min(-90).max(90).nullable().optional(),
  titikBLng: z.number().min(-180).max(180).nullable().optional(),
});

export async function GET() {
  const rows = await db
    .select({
      id: tambangan.id,
      slug: tambangan.slug,
      nama: tambangan.nama,
      titikANama: tambangan.titikANama,
      titikALat: tambangan.titikALat,
      titikALng: tambangan.titikALng,
      titikBNama: tambangan.titikBNama,
      titikBLat: tambangan.titikBLat,
      titikBLng: tambangan.titikBLng,
      jumlahKapal: sql<number>`count(${kapal.id})::int`,
    })
    .from(tambangan)
    .leftJoin(kapal, eq(kapal.tambanganId, tambangan.id))
    .groupBy(tambangan.id)
    .orderBy(tambangan.nama);

  const data: TambanganDto[] = rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    nama: r.nama,
    jumlahKapal: r.jumlahKapal,
    titikA: { nama: r.titikANama, lat: r.titikALat, lng: r.titikALng },
    titikB: { nama: r.titikBNama, lat: r.titikBLat, lng: r.titikBLng },
  }));

  return ok({ tambangan: data });
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return err("Perlu login", 401);

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return err("Data tambangan tidak valid");
  const b = parsed.data;

  const base = slugify(b.nama) || "tambangan";
  let slug = base;
  for (let i = 2; ; i++) {
    const exists = await db
      .select({ id: tambangan.id })
      .from(tambangan)
      .where(eq(tambangan.slug, slug))
      .limit(1);
    if (exists.length === 0) break;
    slug = `${base}-${i}`;
  }

  const [row] = await db
    .insert(tambangan)
    .values({
      slug,
      nama: b.nama,
      titikANama: b.titikANama,
      titikALat: b.titikALat ?? null,
      titikALng: b.titikALng ?? null,
      titikBNama: b.titikBNama,
      titikBLat: b.titikBLat ?? null,
      titikBLng: b.titikBLng ?? null,
    })
    .returning();

  const dto: TambanganDto = {
    id: row.id,
    slug: row.slug,
    nama: row.nama,
    titikA: { nama: row.titikANama, lat: row.titikALat, lng: row.titikALng },
    titikB: { nama: row.titikBNama, lat: row.titikBLat, lng: row.titikBLng },
  };

  return ok({ tambangan: dto }, 201);
}
