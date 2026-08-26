import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { kapalEvents, kapal, tambangan } from "@/lib/db/schema";
import type { KapalMineDto, KapalStatus } from "@/lib/types";

const selection = {
  slug: kapal.slug,
  nama: kapal.nama,
  status: kapal.status,
  departingFrom: kapal.departingFrom,
  timerEndAt: kapal.timerEndAt,
  lastUpdatedAt: kapal.lastUpdatedAt,
  tambanganSlug: tambangan.slug,
  tambanganNama: tambangan.nama,
  titikANama: tambangan.titikANama,
  titikALat: tambangan.titikALat,
  titikALng: tambangan.titikALng,
  titikBNama: tambangan.titikBNama,
  titikBLat: tambangan.titikBLat,
  titikBLng: tambangan.titikBLng,
};

type Row = {
  slug: string;
  nama: string;
  status: string;
  departingFrom: string | null;
  timerEndAt: Date | null;
  lastUpdatedAt: Date;
  tambanganSlug: string;
  tambanganNama: string;
  titikANama: string;
  titikALat: number | null;
  titikALng: number | null;
  titikBNama: string;
  titikBLat: number | null;
  titikBLng: number | null;
};

export function toMineDto(r: Row): KapalMineDto {
  return {
    slug: r.slug,
    nama: r.nama,
    status: r.status as KapalStatus,
    departingFrom: r.departingFrom as KapalStatus | null,
    timerEndAt: r.timerEndAt ? r.timerEndAt.toISOString() : null,
    lastUpdated: r.lastUpdatedAt.toISOString(),
    tambanganSlug: r.tambanganSlug,
    tambanganNama: r.tambanganNama,
    titikA: { nama: r.titikANama, lat: r.titikALat, lng: r.titikALng },
    titikB: { nama: r.titikBNama, lat: r.titikBLat, lng: r.titikBLng },
  };
}

export async function listKapalMilik(ownerId: number): Promise<KapalMineDto[]> {
  const rows = await db
    .select(selection)
    .from(kapal)
    .innerJoin(tambangan, eq(kapal.tambanganId, tambangan.id))
    .where(eq(kapal.ownerId, ownerId))
    .orderBy(desc(kapal.lastUpdatedAt));
  return rows.map(toMineDto);
}

export async function findOwnedKapal(
  slug: string,
  ownerId: number,
): Promise<KapalMineDto | null> {
  const rows = await db
    .select(selection)
    .from(kapal)
    .innerJoin(tambangan, eq(kapal.tambanganId, tambangan.id))
    .where(and(eq(kapal.slug, slug), eq(kapal.ownerId, ownerId)))
    .limit(1);
  return rows[0] ? toMineDto(rows[0]) : null;
}

export async function findKapalIdBySlug(slug: string): Promise<number | null> {
  const rows = await db.select({ id: kapal.id }).from(kapal).where(eq(kapal.slug, slug)).limit(1);
  return rows[0]?.id ?? null;
}

export async function logEvent(kapalId: number, event: string, meta?: unknown) {
  await db.insert(kapalEvents).values({ kapalId, event, meta: meta ?? null });
}
