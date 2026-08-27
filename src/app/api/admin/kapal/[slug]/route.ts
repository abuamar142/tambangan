import { requireAdmin, ok, err } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { kapal } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";

const editSchema = z.object({
  nama: z.string().min(1).max(40),
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

  const updated = await db
    .update(kapal)
    .set({ nama: parsed.data.nama })
    .where(eq(kapal.slug, slug))
    .returning();

  if (updated.length === 0) return err("Kapal not found", 404);
  return ok({ kapal: updated[0] });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return err("Unauthorized", 403);

  const { slug } = await params;
  const deleted = await db
    .delete(kapal)
    .where(eq(kapal.slug, slug))
    .returning({ slug: kapal.slug });

  if (deleted.length === 0) return err("Kapal not found", 404);
  return ok({ message: "Kapal deleted" });
}
