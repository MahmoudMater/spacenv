import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function isStaticAsset(pathname: string): boolean {
  return /\.(ico|png|jpg|jpeg|svg|gif|webp|woff2?|ttf|txt|webmanifest)$/i.test(
    pathname,
  );
}

function isPublicPath(pathname: string): boolean {
  if (isStaticAsset(pathname)) {
    return true;
  }
  if (pathname.startsWith("/api")) {
    return true;
  }
  if (pathname.startsWith("/login")) {
    return true;
  }
  if (pathname.startsWith("/register")) {
    return true;
  }
  if (pathname.startsWith("/invite")) {
    return true;
  }
  return false;
}

/** Next.js 16+: auth gate at the edge (replaces deprecated `middleware.ts`). */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("access_token");

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const redirectTarget = `${pathname}${request.nextUrl.search}`;
    url.searchParams.set("redirect", redirectTarget);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
