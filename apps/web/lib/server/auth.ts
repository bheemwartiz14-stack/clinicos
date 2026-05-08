import { db, schema } from "@mediclinicpro/db";
import type { Role } from "@mediclinicpro/types";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

export const sessionCookieName = "clinic_session";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: { id: string; role: Role }) {
  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function login(email: string, password: string) {
  const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);

  if (!user?.isActive) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function getCurrentUser() {
  const token = (await cookies()).get(sessionCookieName)?.value;
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
