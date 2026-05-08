import { sessionCookieName } from "@/lib/server/auth";

export async function POST() {
  const response = Response.json({ ok: true });
  response.headers.append(
    "set-cookie",
    `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  );
  return response;
}
