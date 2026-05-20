import crypto from "node:crypto";
import { env } from "@/lib/env";

const algorithm = "aes-256-gcm";

function key() {
  return crypto.createHash("sha256").update(env.JWT_SECRET ?? "default-fallback-secret").digest();
}

export function encryptToken(token: string | null | undefined) {
  if (!token) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, key(), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
}

export function decryptToken(value: string | null | undefined) {
  if (!value) return null;
  const [ivText, tagText, encryptedText] = value.split(".");
  if (!ivText || !tagText || !encryptedText) return value;
  const decipher = crypto.createDecipheriv(algorithm, key(), Buffer.from(ivText, "base64"));
  decipher.setAuthTag(Buffer.from(tagText, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedText, "base64")),
    decipher.final()
  ]).toString("utf8");
}
