import { type NextRequest, NextResponse } from "next/server";

const protectedPrefixes = [
  "/dashboard",
  "/patients",
  "/doctors",
  "/appointments",
  "/billing",
  "/prescriptions",
  "/inventory",
  "/ai-notes",
  "/roles",
  "/permissions",
  "/settings",
];

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const nonce = crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));
  const hasSessionCookie = request.cookies.has("accessToken");

  if (isProtected && !hasSessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  );

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|sw.js).*)"],
};
