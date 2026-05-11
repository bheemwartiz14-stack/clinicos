import {
  createUserSession,
  getCurrentUser,
  getSessionCookieOptions,
  login,
  logout,
  sessionCookieName,
} from "./auth.service";
import { loginSchema } from "./auth.validation";

export async function loginController(request: Request) {
  try {
    const body = await request.json();
    const input = loginSchema.safeParse(body);
    if (!input.success) {
      return Response.json({ message: "Invalid email or password" }, { status: 400 });
    }

    const user = await login(input.data.email, input.data.password);

    if (!user) {
      return Response.json({ message: "Invalid email or password" }, { status: 401 });
    }

    const { token } = await createUserSession({
      ipAddress: request.headers.get("x-forwarded-for"),
      user,
      userAgent: request.headers.get("user-agent"),
    });

    const response = Response.json({ user });
    response.headers.append("Set-Cookie", serializeCookie(sessionCookieName, token));

    return response;
  } catch (error) {
    console.error("LOGIN_CONTROLLER_ERROR:", error);

    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function logoutController() {
  await logout();
  const response = Response.json({ ok: true });
  response.headers.append(
    "Set-Cookie",
    [`${sessionCookieName}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"].join("; "),
  );

  return response;
}

export async function currentUserController() {
  return Response.json({
    user: await getCurrentUser(),
  });
}

function serializeCookie(name: string, value: string) {
  const options = getSessionCookieOptions();

  return [
    `${name}=${value}`,
    `Path=${options.path}`,
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${options.maxAge}`,
    options.secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}
