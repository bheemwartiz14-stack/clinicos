import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { can, type Permission, type Role } from "@mediclinic/rbac";
import { env } from "./lib/env";

const publicRoutes = ["/login", "/forgot-password", "/reset-password", "/403"];
const routePermissions: Array<{ path: string; permission: Permission }> = [
  { path: "/settings/login-history", permission: "settings.profile" },
  { path: "/settings/preferences", permission: "settings.profile" },
  { path: "/settings/security", permission: "settings.profile" },
  { path: "/settings/profile", permission: "settings.profile" },
  { path: "/settings/intergations", permission: "settings.profile" },
  { path: "/settings/account", permission: "settings.profile" },
  { path: "/settings/staff-manage", permission: "staff.manage" },
  { path: "/settings", permission: "settings.profile" },
  { path: "/rbac", permission: "rbac.manage" },
  { path: "/doctors", permission: "doctors.view" },
  { path: "/", permission: "dashboard.view" },
];

function getJwtSecret(): Uint8Array {

  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not resolved");
  }

  return new TextEncoder().encode(env.JWT_SECRET);
}


function redirect(request: NextRequest, pathname: string) {
  return NextResponse.redirect(new URL(pathname, request.url));
}

function isPublic(pathname: string) {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function matchPermission(pathname: string) {
  if (pathname === "/") {
    return routePermissions.find((route) => route.path === "/");
  }

  return routePermissions.find(
    (route) => route.path !== "/" && pathname.startsWith(route.path)
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const cookieName = process.env.COOKIE_NAME ?? "mediclinic_session";
  const token = request.cookies.get(cookieName)?.value;

  const publicRoute = isPublic(pathname);

  if (publicRoute) {
    return NextResponse.next();
  }

  if (!token) {
    return redirect(request, "/login");
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());

    const role = payload.role as Role | undefined;

    const matchedRoute = matchPermission(pathname);

    if (matchedRoute && (!role || !can(role, matchedRoute.permission))) {
      return redirect(request, "/403");
    }

    return NextResponse.next();
  } catch {
    const response = redirect(request, "/login");

    response.cookies.delete(cookieName);

    return response;
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sw.js|icons|images|uploads).*)",
  ],
};
