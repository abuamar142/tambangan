import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import type { UserInfo } from "@/lib/types";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function currentUser(): Promise<UserInfo | null> {
  const session = await getSession();
  if (!session) return null;
  const rows = await db
    .select({ id: users.id, username: users.username, role: users.role })
    .from(users)
    .where(eq(users.id, session.sub))
    .limit(1);
  return rows[0] ?? null;
}

export async function requireAdmin(): Promise<UserInfo | null> {
  const user = await currentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}
