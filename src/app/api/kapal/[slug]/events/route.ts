import { ok, err } from "@/lib/api-utils";
import { listKapalEvents, findOwnedKapal, findKapalIdBySlug } from "@/lib/server/kapal";
import { currentUser } from "@/lib/api-utils";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const user = await currentUser();
  if (!user) return err("Unauthorized", 401);

  const { slug } = await ctx.params;
  const owned = await findOwnedKapal(slug, user.id);
  if (!owned) return err("Kapal tidak ditemukan atau bukan milik Anda", 404);

  const kapalId = await findKapalIdBySlug(slug);
  if (!kapalId) return err("Kapal tidak ditemukan", 404);

  const events = await listKapalEvents(kapalId, 50);
  return ok({
    events: events.map((e) => ({
      id: e.id,
      event: e.event,
      meta: e.meta,
      createdAt: e.createdAt.toISOString(),
    })),
  });
}
