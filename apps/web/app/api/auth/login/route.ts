import { createSessionToken, login, sessionCookieName } from "@/lib/server/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  const user = await login(body.email ?? "", body.password ?? "");

  if (!user) {
    return Response.json({ message: "Invalid email or password" }, { status: 401 });
  }

  const token = await createSessionToken(user);
  const response = Response.json({ user });

  response.headers.append(
    "set-cookie",
    `${sessionCookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`,
  );

  return response;
}
