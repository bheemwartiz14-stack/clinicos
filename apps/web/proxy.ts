import { type NextRequest, NextResponse } from "next/server";

const protectedPrefixes = ["/dashboard", "/patients", "/appointments", "/billing", "/settings"];

export function proxy(request: NextRequest) {
  const nonce = crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

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

  const isProtected = protectedPrefixes.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix),
  );
  const hasSessionCookie = request.cookies.get("clinic_session");

  if (isProtected && !hasSessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|sw.js).*)"],
};
