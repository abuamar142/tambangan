import { currentUser, ok } from "@/lib/api-utils";

export async function GET() {
  const user = await currentUser();
  return ok({ user });
}
