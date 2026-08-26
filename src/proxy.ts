import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "tb_session";
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "insecure-dev-secret-ganti-di-production",
);

async function readSession(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.sub ? { sub: Number(payload.sub) } : null;
  } catch {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const session = await readSession(req);

  if (pathname.startsWith("/nahkoda") && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if ((pathname === "/login" || pathname === "/register") && session) {
    const url = req.nextUrl.clone();
    url.pathname = "/nahkoda";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/nahkoda/:path*", "/admin/:path*", "/login", "/register"],
};
