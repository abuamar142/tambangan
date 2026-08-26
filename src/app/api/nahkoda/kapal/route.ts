import { currentUser, err, ok } from "@/lib/api-utils";
import { listKapalMilik } from "@/lib/server/kapal";

export async function GET() {
  const user = await currentUser();
  if (!user) return err("Perlu login", 401);
  return ok({ kapal: await listKapalMilik(user.id) });
}
