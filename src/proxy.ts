/**
 * Optimistic check: visitors without a session cookie go to the login page.
 * It only looks at the cookie's presence; the real check (is the session valid,
 * may this user open this restaurant?) happens on the server in src/auth/dal.ts.
 */
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/auth/constants";

const PUBLIC_PATHS = ["/login"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!PUBLIC_PATHS.includes(pathname) && !request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.redirect(new URL("/login", request.nextUrl));
  }
  return NextResponse.next();
}

export const config = {
  // Everything except Next.js assets and static files.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|ico|webp)$).*)"],
};
