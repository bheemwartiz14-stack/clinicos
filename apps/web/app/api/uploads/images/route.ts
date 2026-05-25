import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createScopedLogger } from "@mediclinic/logger";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

const logger = createScopedLogger("image-upload-api");
const maxFileSize = 5 * 1024 * 1024;
const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"]
]);

function getUploadsDirectory() {
  const cwd = process.cwd();
  const publicDirectory = cwd.endsWith(path.join("apps", "web")) ? path.join(cwd, "public") : path.join(cwd, "apps", "web", "public");
  return path.join(publicDirectory, "uploads", "images");
}

function getUploadUrl(fileName: string) {
  return `/uploads/images/${fileName}`;
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required" }, { status: 400 });
  }

  const extension = allowedTypes.get(file.type);
  if (!extension) {
    return NextResponse.json({ error: "Only JPG, PNG, WebP, and GIF images are supported" }, { status: 415 });
  }

  if (file.size > maxFileSize) {
    return NextResponse.json({ error: "Image must be 5 MB or smaller" }, { status: 413 });
  }

  const fileName = `${randomUUID()}.${extension}`;
  const uploadDirectory = getUploadsDirectory();
  const filePath = path.join(uploadDirectory, fileName);

  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

  const url = getUploadUrl(fileName);
  logger.info("Image uploaded", { url, size: file.size, type: file.type });

  return NextResponse.json({ url });
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication is required" }, { status: 401 });
  }

  const url = (await request.text()).trim();
  if (!url.startsWith("/uploads/images/")) {
    return NextResponse.json({ ok: true });
  }

  const fileName = path.basename(url);
  const filePath = path.join(getUploadsDirectory(), fileName);

  try {
    await unlink(filePath);
    logger.info("Image upload reverted", { url });
  } catch (error) {
    logger.warn("Image upload revert skipped", { error, url });
  }

  return NextResponse.json({ ok: true });
}
