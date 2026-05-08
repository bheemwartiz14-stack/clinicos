import { createSessionToken, getCurrentUser, login, sessionCookieName } from "./auth.service";
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

    const token = await createSessionToken(user);

    const response = Response.json({ user });
    const isProduction = process.env.NODE_ENV === "production";
    response.headers.append(
      "Set-Cookie",
      [
        `${sessionCookieName}=${token}`,
        "Path=/",
        "HttpOnly",
        "SameSite=Lax",
        `Max-Age=${60 * 60 * 24 * 7}`,
        isProduction ? "Secure" : "",
      ]
        .filter(Boolean)
        .join("; "),
    );

    return response;
  } catch (error) {
    console.error("LOGIN_CONTROLLER_ERROR:", error);

    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function logoutController() {
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
