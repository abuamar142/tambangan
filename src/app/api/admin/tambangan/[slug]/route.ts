import { requireAdmin, ok, err } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { tambangan } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";

const editSchema = z.object({
  nama: z.string().min(1).optional(),
  titikANama: z.string().min(1).optional(),
  titikBNama: z.string().min(1).optional(),
  titikALat: z.number().optional(),
  titikALng: z.number().optional(),
  titikBLat: z.number().optional(),
  titikBLng: z.number().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return err("Unauthorized", 403);

  const { slug } = await params;
  const body = await req.json();
  const parsed = editSchema.safeParse(body);
  if (!parsed.success) return err("Invalid data");

  const data = parsed.data;
  const updates: Record<string, unknown> = {};
  if (data.nama !== undefined) updates.nama = data.nama;
  if (data.titikANama !== undefined) updates.titik_a_nama = data.titikANama;
  if (data.titikBNama !== undefined) updates.titik_b_nama = data.titikBNama;
  if (data.titikALat !== undefined) updates.titik_a_lat = data.titikALat;
  if (data.titikALng !== undefined) updates.titik_a_lng = data.titikALng;
  if (data.titikBLat !== undefined) updates.titik_b_lat = data.titikBLat;
  if (data.titikBLng !== undefined) updates.titik_b_lng = data.titikBLng;

  if (Object.keys(updates).length === 0) return err("No fields to update");

  const updated = await db
    .update(tambangan)
    .set(updates)
    .where(eq(tambangan.slug, slug))
    .returning();

  if (updated.length === 0) return err("Tambangan not found", 404);
  return ok({ tambangan: updated[0] });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return err("Unauthorized", 403);

  const { slug } = await params;
  const deleted = await db
    .delete(tambangan)
    .where(eq(tambangan.slug, slug))
    .returning({ id: tambangan.id });

  if (deleted.length === 0) return err("Tambangan not found", 404);
  return ok({ message: "Tambangan deleted" });
}
