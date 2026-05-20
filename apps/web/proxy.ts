import { type NextRequest, NextResponse } from "next/server";

const publicRoutes = ["/login", "/forgot-password", "/reset-password", "/403"];

const protectedRoutes = [
  "/appointments",
  "/billing",
  "/doctor",
  "/doctors",
  "/nurse",
  "/patients",
  "/settings",
];

function isPublicRoute(pathname: string) {
  return publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function isProtectedRoute(pathname: string) {
  return protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookieName = process.env.COOKIE_NAME || "mediclinic_session";
  const token = request.cookies.get(cookieName)?.value;

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  if (!token && isProtectedRoute(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|icons|images|uploads).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
        { type: "header", key: "sec-purpose", value: "prefetch" },
      ],
    },
  ],
};
