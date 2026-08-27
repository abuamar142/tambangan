import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { currentUser, err, ok } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string().min(1),
  auth: z.string().min(1),
});

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return err("Perlu login", 401);

  const body = await req.json();
  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) return err("Data tidak valid");

  const { endpoint, p256dh, auth } = parsed.data;

  const existing = await db
    .select({ id: pushSubscriptions.id })
    .from(pushSubscriptions)
    .where(and(eq(pushSubscriptions.userId, user.id), eq(pushSubscriptions.endpoint, endpoint)))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(pushSubscriptions).values({
      userId: user.id,
      endpoint,
      p256dh,
      auth,
    });
  }

  return ok({ message: "Subscription saved" });
}

export async function DELETE(req: Request) {
  const user = await currentUser();
  if (!user) return err("Perlu login", 401);

  const { endpoint } = await req.json();
  if (!endpoint) return err("Endpoint required");

  await db
    .delete(pushSubscriptions)
    .where(and(eq(pushSubscriptions.userId, user.id), eq(pushSubscriptions.endpoint, endpoint)));

  return ok({ message: "Subscription removed" });
}
