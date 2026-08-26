import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "tb_session";
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "insecure-dev-secret-ganti-di-production",
);

export interface SessionPayload {
  sub: number;
  username: string;
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ username: payload.username })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(payload.sub))
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub) return null;
    return { sub: Number(payload.sub), username: String(payload.username ?? "") };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
