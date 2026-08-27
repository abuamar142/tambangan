import { eq } from "drizzle-orm";
import { z } from "zod";
import { currentUser, err, ok } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { kapal, tambangan } from "@/lib/db/schema";
import { findKapalIdBySlug, findOwnedKapal, logEvent } from "@/lib/server/kapal";

type Ctx = { params: Promise<{ slug: string }> };

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("status"), value: z.enum(["titik_a", "proses", "titik_b"]) }),
  z.object({ action: z.literal("timer"), minutes: z.number().int().min(1).max(240) }),
  z.object({ action: z.literal("timer_clear") }),
  z.object({
    action: z.literal("set_lokasi_titik"),
    side: z.enum(["a", "b"]),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  z.object({ action: z.literal("rename"), nama: z.string().min(1).max(40) }),
]);

export async function GET(_req: Request, ctx: Ctx) {
  const user = await currentUser();
  if (!user) return err("Perlu login", 401);

  const { slug } = await ctx.params;
  const dto = await findOwnedKapal(slug, user.id);
  if (!dto) return err("Kapal tidak ditemukan atau bukan milik Anda", 404);
  return ok({ kapal: dto });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const user = await currentUser();
  if (!user) return err("Perlu login", 401);

  const parsed = actionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return err("Aksi tidak valid");

  const { slug } = await ctx.params;
  const current = await findOwnedKapal(slug, user.id);
  if (!current) return err("Kapal tidak ditemukan atau bukan milik Anda", 404);

  const kapalId = await findKapalIdBySlug(slug);
  if (!kapalId) return err("Kapal tidak ditemukan", 404);

  const body = parsed.data;
  let departingFrom = current.departingFrom;

  if (body.action === "status") {
    if (body.value === "proses") {
      if (current.status !== "proses") departingFrom = current.status;
    } else {
      departingFrom = null;
    }

    await db
      .update(kapal)
      .set({
        status: body.value,
        departingFrom,
        lastUpdatedAt: new Date(),
        ...(body.value === "proses" ? { lastDepartureAt: new Date() } : {}),
        timerEndAt: body.value === "proses" ? null : current.timerEndAt ? new Date(current.timerEndAt) : null,
      })
      .where(eq(kapal.slug, slug));

    await logEvent(kapalId, "status", { from: current.status, to: body.value });
  } else if (body.action === "timer") {
    const timerEndAt = new Date(Date.now() + body.minutes * 60_000);
    await db
      .update(kapal)
      .set({ timerEndAt, lastUpdatedAt: new Date() })
      .where(eq(kapal.slug, slug));
    await logEvent(kapalId, "timer_set", { minutes: body.minutes, endAt: timerEndAt.toISOString() });
  } else if (body.action === "timer_clear") {
    await db
      .update(kapal)
      .set({ timerEndAt: null, lastUpdatedAt: new Date() })
      .where(eq(kapal.slug, slug));
    await logEvent(kapalId, "timer_clear");
  } else if (body.action === "set_lokasi_titik") {
    const [t] = await db
      .select({ id: tambangan.id })
      .from(tambangan)
      .where(eq(tambangan.slug, current.tambanganSlug))
      .limit(1);
    if (!t) return err("Tambangan tidak ditemukan", 404);

    await db
      .update(tambangan)
      .set(
        body.side === "a"
          ? { titikALat: body.lat, titikALng: body.lng }
          : { titikBLat: body.lat, titikBLng: body.lng },
      )
      .where(eq(tambangan.id, t.id));

    await logEvent(kapalId, "lokasi_titik", { side: body.side, lat: body.lat, lng: body.lng });
  } else if (body.action === "rename") {
    await db
      .update(kapal)
      .set({ nama: body.nama })
      .where(eq(kapal.slug, slug));
    await logEvent(kapalId, "rename", { from: current.nama, to: body.nama });
  }

  const updated = await findOwnedKapal(slug, user.id);
  return ok({ kapal: updated });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const user = await currentUser();
  if (!user) return err("Perlu login", 401);

  const { slug } = await ctx.params;
  const current = await findOwnedKapal(slug, user.id);
  if (!current) return err("Kapal tidak ditemukan atau bukan milik Anda", 404);

  const kapalId = await findKapalIdBySlug(slug);
  if (kapalId) await logEvent(kapalId, "dihapus", { oleh: user.username });

  await db.delete(kapal).where(eq(kapal.slug, slug));
  return ok({ message: "Kapal berhasil dihapus" });
}
