import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife, cacheTag, revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { getClientIp } from "@/hooks/common";
import { getCurrentUser } from "@/modules/auth/auth.service";
import { hasPermission } from "@/modules/auth/permissions";
import { createActivityLog } from "@/modules/setting/audit-logs/hooks/audit-logs.logger";
import { getGeneralSettingsPageModel } from "./genral-setting.model";
import { findGeneralSettings, upsertGeneralSettings } from "./genral-setting.repository";
import type { ActionState } from "./genral-setting.types";
import { generalSettingsSchema } from "./genral-setting.validation";

const GENERAL_SETTINGS_PATH = "/setting/system/genral-setting";
const GENERAL_SETTINGS_CACHE_TAG = "general-settings";
const SETTINGS_UPLOAD_DIR = "uploads/settings";
const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);

const ALLOWED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".ico"]);

class SettingsAssetUploadError extends Error {}

async function requireSettingsPermission() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin" && !hasPermission(user.permissions, "settings.manage")) {
    redirect("/dashboard");
  }

  return user;
}

function emptyToUndefined(value: FormDataEntryValue | null) {
  const stringValue = String(value ?? "").trim();

  return stringValue.length > 0 ? stringValue : undefined;
}

function getUploadedFile(formData: FormData, name: string) {
  const value = formData.get(name);

  if (!(value instanceof File) || value.size === 0) {
    return undefined;
  }

  return value;
}

function sanitizeFilename(filename: string) {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseAddress(formData: FormData) {
  const address = {
    addressLine: emptyToUndefined(formData.get("addressLine")),
    country: emptyToUndefined(formData.get("country")),
    countryCode: emptyToUndefined(formData.get("countryCode")),
    state: emptyToUndefined(formData.get("state")),
    stateCode: emptyToUndefined(formData.get("stateCode")),
    city: emptyToUndefined(formData.get("city")),
  };

  return address;
}

async function saveSettingsAsset(file: File, prefix: "main-logo" | "favicon") {
  if (file.size > MAX_LOGO_SIZE_BYTES) {
    throw new SettingsAssetUploadError("Logo files must be 2 MB or smaller.");
  }

  const extension = path.extname(file.name).toLowerCase();
  if (!ALLOWED_IMAGE_TYPES.has(file.type) && !ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
    throw new SettingsAssetUploadError("Logo files must be JPG, PNG, WebP, GIF, or ICO images.");
  }
  const uploadDir = path.join(process.cwd(), "public", SETTINGS_UPLOAD_DIR);
  await mkdir(uploadDir, { recursive: true });
  const safeName = sanitizeFilename(file.name) || `${prefix}${extension || ".png"}`;
  const filename = `${prefix}-${randomUUID()}-${safeName}`;
  const diskPath = path.join(uploadDir, filename);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(diskPath, bytes);
  return `/${SETTINGS_UPLOAD_DIR}/${filename}`;
}

async function parseGeneralSettingsForm(formData: FormData) {
  const mainLogoFile = getUploadedFile(formData, "mainLogoFile");
  const faviconFile = getUploadedFile(formData, "faviconFile");

  return {
    companyName: formData.get("companyName"),
    tagline: emptyToUndefined(formData.get("tagline")),
    supportEmail: formData.get("supportEmail"),
    supportPhone: emptyToUndefined(formData.get("supportPhone")),
    address: parseAddress(formData),
    socialMediaLinks: {
      facebook: emptyToUndefined(formData.get("facebook")),
      instagram: emptyToUndefined(formData.get("instagram")),
      twitter: emptyToUndefined(formData.get("twitter")),
      linkedin: emptyToUndefined(formData.get("linkedin")),
      youtube: emptyToUndefined(formData.get("youtube")),
      website: emptyToUndefined(formData.get("website")),
    },
    mainLogo: mainLogoFile
      ? await saveSettingsAsset(mainLogoFile, "main-logo")
      : emptyToUndefined(formData.get("mainLogo")),
    favicon: faviconFile
      ? await saveSettingsAsset(faviconFile, "favicon")
      : emptyToUndefined(formData.get("favicon")),
  };
}

function getUserDisplayName(user: {
  name?: string | null;
  fullName?: string | null;
  email?: string | null;
}) {
  return user.name ?? user.fullName ?? user.email ?? "Unknown user";
}

function getActionError(error: unknown, fallback: string): ActionState {
  if (error instanceof ZodError) {
    return {
      ok: false,
      message: error.issues[0]?.message ?? "Please check the settings and try again.",
    };
  }

  if (error instanceof SettingsAssetUploadError) {
    return {
      ok: false,
      message: error.message,
    };
  }

  console.error("General settings action error:", error);

  return { ok: false, message: fallback };
}

export async function getGeneralSettingsPageData() {
  await requireSettingsPermission();

  const settings = await findGeneralSettings();

  return getGeneralSettingsPageModel(settings);
}

export async function getGeneralSettingsData() {
  const settings = await findGeneralSettings();

  return getGeneralSettingsPageModel(settings);
}

export async function getGeneralSettingsMetadataData() {
  "use cache";

  cacheTag(GENERAL_SETTINGS_CACHE_TAG);
  cacheLife("hours");

  const settings = await findGeneralSettings();

  return {
    companyName: settings?.companyName ?? null,
    tagline: settings?.tagline ?? null,
    favicon: settings?.favicon ?? null,
    mainLogo: settings?.mainLogo ?? null,
  };
}

export async function updateGeneralSettingsFromForm(formData: FormData): Promise<ActionState> {
  const user = await requireSettingsPermission();

  try {
    const input = generalSettingsSchema.parse(await parseGeneralSettingsForm(formData));
    const settings = await upsertGeneralSettings(input);

    if (!settings) {
      return {
        ok: false,
        message: "Unable to save general settings.",
      };
    }

    await createActivityLog({
      action: "UPDATE_GENERAL_SETTINGS",
      module: "genral-setting",
      description: `Updated general settings for ${settings.companyName}`,
      userId: user.id,
      userName: getUserDisplayName(user),
      ipAddress: await getClientIp(),
      metadata: {
        settingsId: settings.id,
      },
    });

    revalidatePath(GENERAL_SETTINGS_PATH);
    revalidateTag(GENERAL_SETTINGS_CACHE_TAG, { expire: 0 });

    return { ok: true, message: "General settings saved successfully." };
  } catch (error) {
    return getActionError(error, "Unable to save general settings. Please try again.");
  }
}
