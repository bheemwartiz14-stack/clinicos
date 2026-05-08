import { db, schema } from "@mediclinicpro/db";
import type { Role } from "@mediclinicpro/types";
import { eq } from "drizzle-orm";
import { jwtVerify } from "jose";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

const cookieName = "clinic_session";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

function readCookie(headers: Headers, name: string) {
  const cookie = headers.get("cookie");
  return cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.split("=")[1];
}

export async function getUserFromHeaders(headers: Headers): Promise<AuthUser | null> {
  const token = readCookie(headers, cookieName);
  if (!token) {
    return null;
  }

  try {
    const verified = await jwtVerify(token, getSecret());
    const userId = verified.payload.sub;
    if (!userId) {
      return null;
    }

    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, userId)).limit(1);

    if (!user?.isActive) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } catch {
    return null;
  }
}

export async function createTRPCContext(headers: Headers) {
  return {
    db,
    user: await getUserFromHeaders(headers),
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
