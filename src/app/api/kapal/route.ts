import { and, eq, ilike } from "drizzle-orm";
import { z } from "zod";
import { currentUser, err, ok } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { kapal, tambangan } from "@/lib/db/schema";
import { findKapalIdBySlug, listKapalPublic, logEvent } from "@/lib/server/kapal";
import { slugify } from "@/lib/slugify";

const bodySchema = z.object({
  nama: z.string().min(1).max(40),
  tambanganId: z.number().int().positive(),
});

const querySchema = z.object({
  status: z.enum(["titik_a", "proses", "titik_b"]).optional(),
  search: z.string().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(5),
  offset: z.coerce.number().int().min(0).max(10000).default(0),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    status: url.searchParams.get("status") ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
    offset: url.searchParams.get("offset") ?? undefined,
  });
  if (!parsed.success) return err("Parameter tidak valid", 400);
  const { status, search, limit, offset } = parsed.data;
  const { rows, total } = await listKapalPublic({ status, search, limit, offset });
  return ok({ kapal: rows, total });
}

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return err("Perlu login", 401);

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return err("Nama kapal dan tambangan wajib diisi");
  const { nama, tambanganId } = parsed.data;

  const [t] = await db
    .select({ id: tambangan.id })
    .from(tambangan)
    .where(eq(tambangan.id, tambanganId))
    .limit(1);
  if (!t) return err("Tambangan tidak ditemukan", 404);

  let slug = "";
  for (let i = 0; i < 5; i++) {
    const candidate = `${slugify(nama) || "kapal"}-${Math.random().toString(36).slice(2, 6)}`;
    const exists = await db
      .select({ id: kapal.id })
      .from(kapal)
      .where(eq(kapal.slug, candidate))
      .limit(1);
    if (exists.length === 0) {
      slug = candidate;
      break;
    }
  }
  if (!slug) return err("Gagal membuat kode kapal, coba lagi", 500);

  const [row] = await db
    .insert(kapal)
    .values({ slug, nama, tambanganId, ownerId: user.id })
    .returning({ slug: kapal.slug });

  const id = await findKapalIdBySlug(row.slug);
  if (id) await logEvent(id, "dibuat", { oleh: user.username });

  return ok({ slug: row.slug }, 201);
}
