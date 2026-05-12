import { type NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
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
  const token = request.cookies.get("accessToken")?.value;
  const pathname = request.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/patients/:path*",
    "/doctors/:path*",
    "/appointments/:path*",
    "/billing/:path*",
    "/prescriptions/:path*",
    "/inventory/:path*",
    "/ai-notes/:path*",
    "/roles/:path*",
    "/permissions/:path*",
    "/settings/:path*",
    "/login",
  ],
};
