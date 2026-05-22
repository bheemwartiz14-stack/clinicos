import { SignJWT, jwtVerify } from "jose";
import { z } from "zod";
import type { Role } from "@mediclinic/rbac";

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, "Enter your email or username").max(255),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const passwordResetRequestSchema = z.object({
  identifier: z.string().trim().min(3, "Enter your email or username").max(255)
});

export const passwordResetSchema = z.object({
  token: z.string().min(32),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export const sessionSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string().uuid(),
  role: z.enum(["admin", "doctor", "receptionist", "accountant"]),
  email: z.string().email(),
  username: z.string().min(3).max(64).optional().nullable(),
  name: z.string().min(1)
});

export type SessionUser = z.infer<typeof sessionSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;

function key(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bufferSource(value: Uint8Array): ArrayBuffer {
  return value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength) as ArrayBuffer;
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bufferSource(new TextEncoder().encode(value)));
  return bytesToBase64Url(new Uint8Array(digest));
}

export function normalizeIdentifier(identifier: string): string {
  return identifier.trim().toLowerCase();
}

export function generateSecureToken(bytes = 32): string {
  const randomBytes = new Uint8Array(bytes);
  crypto.getRandomValues(randomBytes);
  return bytesToBase64Url(randomBytes);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    bufferSource(new TextEncoder().encode(password)),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: bufferSource(salt),
      iterations: 210000
    },
    passwordKey,
    256
  );

  return `pbkdf2-sha256$210000$${bytesToBase64Url(salt)}$${bytesToBase64Url(new Uint8Array(derivedBits))}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (storedHash.startsWith("$2")) {
    const bcrypt = await import("bcryptjs");
    return bcrypt.compare(password, storedHash);
  }

  const [algorithm, iterations, encodedSalt, encodedHash] = storedHash.split("$");
  if (algorithm !== "pbkdf2-sha256" || !iterations || !encodedSalt || !encodedHash) {
    return false;
  }

  const salt = base64UrlToBytes(encodedSalt);
  const expectedHash = base64UrlToBytes(encodedHash);
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    bufferSource(new TextEncoder().encode(password)),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: bufferSource(salt),
      iterations: Number(iterations)
    },
    passwordKey,
    expectedHash.byteLength * 8
  );
  const actualHash = new Uint8Array(derivedBits);

  if (actualHash.byteLength !== expectedHash.byteLength) return false;
  return actualHash.every((byte, index) => byte === expectedHash[index]);
}

export async function hashResetToken(token: string): Promise<string> {
  return sha256(token);
}

export async function createSessionToken(user: SessionUser, secret: string): Promise<string> {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(key(secret));
}

export async function verifySessionToken(token: string, secret: string): Promise<SessionUser> {
  const { payload } = await jwtVerify(token, key(secret));
  return sessionSchema.parse(payload);
}

export type AuthenticatedRole = Role;
